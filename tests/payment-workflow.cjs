'use strict';

// Fictional domain tests only: this fake workflow never contacts a processor.
const assert = require('node:assert/strict');
const { createPaymentWorkflow } = require('../src/payment-workflow.cjs');

const payments = createPaymentWorkflow();
const pdsa = payments.createOrder({ id: 'pdsa-next-season-1', program: 'pdsa', amount: 12500 });
const techform = payments.createOrder({ id: 'techform-camp-1', program: 'techform', amount: 8000 });
assert.equal(pdsa.merchant, 'mock-pdsa');
assert.equal(techform.merchant, 'mock-techform');
assert.throws(() => payments.createOrder({ id: 'forged', program: 'pdsa', amount: 1, clientMerchant: 'mock-techform' }), /override/);

const legacy = payments.createOrder({ id: 'crossbar-paid', program: 'pdsa', amount: 12500, legacyPaid: true });
assert.equal(legacy.due, 0);
assert.equal(legacy.state, 'legacy_paid');
assert.equal(payments.startCheckout(legacy.id, 'retry'), null, 'legacy paid registration cannot be charged again');

const session1 = payments.startCheckout(pdsa.id, 'same-request');
const session2 = payments.startCheckout(pdsa.id, 'same-request');
assert.equal(session1, session2, 'retry returns same checkout session');
assert.equal(pdsa.attemptCount, 1);
assert.throws(() => payments.applyVerifiedEvent({ eventId: 'bad-account', merchant: 'mock-techform', orderId: pdsa.id, type: 'payment_succeeded' }), /merchant mismatch/);
assert.equal(payments.applyVerifiedEvent({ eventId: 'evt-paid', merchant: 'mock-pdsa', orderId: pdsa.id, type: 'payment_succeeded' }), true);
assert.equal(payments.applyVerifiedEvent({ eventId: 'evt-paid', merchant: 'mock-pdsa', orderId: pdsa.id, type: 'payment_succeeded' }), false);
assert.equal(pdsa.state, 'paid', 'duplicate webhook is a no-op');

payments.applyVerifiedEvent({ eventId: 'evt-ach', merchant: 'mock-techform', orderId: techform.id, type: 'ach_pending' });
assert.equal(techform.state, 'payment_pending', 'ACH stays pending until verified completion');
payments.applyVerifiedEvent({ eventId: 'evt-refund', merchant: 'mock-techform', orderId: techform.id, type: 'refund_partial' });
assert.equal(techform.state, 'partially_refunded');

assert.throws(() => payments.createOrder({ id: 'bad-price', program: 'pdsa', amount: 1.5 }), /server price/);
console.log('PASS: mock payments; separate merchant routing; legacy paid protection; idempotent checkout/webhook; merchant validation; ACH/refund states.');
