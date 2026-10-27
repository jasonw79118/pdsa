'use strict';

// Adapter contract tests: fake Stripe clients only; no account or network.
const assert = require('node:assert/strict');
const { createStripeGateway } = require('../src/stripe-gateway.cjs');

const calls = [];
const makeClient = (organizationId) => ({
  checkout: { sessions: { create: async (params, options) => {
    calls.push({ organizationId, params, options });
    return { id: `cs_${organizationId}`, url: `https://checkout.stripe.test/${organizationId}` };
  } } },
  webhooks: { constructEvent: (body, signature, secret) => ({ body, signature, secret, type: 'checkout.session.completed' }) },
});
const gateway = createStripeGateway({
  clients: { pdsa: makeClient('pdsa'), techform: makeClient('techform') },
  merchants: {
    pdsa: { enabled: true, accountRef: 'acct_pdsa_test', webhookSecret: 'whsec_pdsa_test' },
    techform: { enabled: true, accountRef: 'acct_techform_test', webhookSecret: 'whsec_techform_test' },
  },
});

(async () => {
  const order = { id: 'order-1', organizationId: 'pdsa', amountMinor: 12500, currency: 'USD', state: 'payment_pending' };
  const checkout = await gateway.createCheckout({ order, idempotencyKey: 'order-1-attempt-1', successUrl: 'https://app.test/return', cancelUrl: 'https://app.test/cancel' });
  assert.equal(checkout.merchantRef, 'acct_pdsa_test');
  assert.equal(calls[0].organizationId, 'pdsa');
  assert.equal(calls[0].params.line_items[0].price_data.unit_amount, 12500);
  assert.equal(calls[0].params.metadata.organization_id, 'pdsa');
  assert.equal(calls[0].options.idempotencyKey, 'order-1-attempt-1');
  const techformCheckout = await gateway.createCheckout({ order: { ...order, id: 'order-2', organizationId: 'techform' }, idempotencyKey: 'order-2-attempt-1', successUrl: 'https://app.test/return', cancelUrl: 'https://app.test/cancel' });
  assert.equal(techformCheckout.merchantRef, 'acct_techform_test');
  assert.equal(calls[1].organizationId, 'techform', 'Techform uses its separate merchant client');
  assert.equal(await gateway.createCheckout({ order: { ...order, state: 'legacy_paid' }, idempotencyKey: 'paid-retry', successUrl: 'https://app.test/return', cancelUrl: 'https://app.test/cancel' }), null);
  await assert.rejects(gateway.createCheckout({ order: { ...order, organizationId: 'other' }, idempotencyKey: 'x', successUrl: 'https://app.test/return', cancelUrl: 'https://app.test/cancel' }), /Unknown organization/);

  const rawBody = Buffer.from('{"id":"evt_test"}');
  const verified = gateway.verifyWebhook({ organizationId: 'pdsa', rawBody, signature: 'sig_test' });
  assert.equal(verified.event.body, rawBody, 'webhook verifier receives exact raw bytes');
  assert.equal(verified.event.secret, 'whsec_pdsa_test');
  assert.equal(verified.merchantRef, 'acct_pdsa_test');
  assert.throws(() => gateway.verifyWebhook({ organizationId: 'pdsa', rawBody: rawBody.toString(), signature: 'sig_test' }), /Raw webhook body/);
  const disabledGateway = createStripeGateway({ clients: { pdsa: makeClient('pdsa') }, merchants: { pdsa: { enabled: false, accountRef: 'acct_pdsa_test', webhookSecret: 'whsec_pdsa_test' } } });
  assert.throws(() => disabledGateway.verifyWebhook({ organizationId: 'pdsa', rawBody, signature: 'sig_test' }), /not enabled/);
  console.log('PASS: Stripe adapter contract; server-priced hosted checkout; organization isolation; idempotency; raw-body signature boundary; no live Stripe calls.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
