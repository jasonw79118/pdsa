'use strict';

// Deterministic domain model for tests only. No network calls or processor SDK.
const MERCHANTS = Object.freeze({ pdsa: 'mock-pdsa', techform: 'mock-techform' });

function createPaymentWorkflow() {
  const orders = new Map();
  const seenEvents = new Set();

  function createOrder({ id, program, amount, currency = 'USD', legacyPaid = false, clientMerchant }) {
    if (!id || !Object.hasOwn(MERCHANTS, program)) throw new Error('Unknown program owner');
    if (clientMerchant && clientMerchant !== MERCHANTS[program]) throw new Error('Merchant override rejected');
    if (!Number.isInteger(amount) || amount < 0) throw new Error('Invalid server price');
    if (orders.has(id)) return orders.get(id);
    const order = {
      id, organization: program, merchant: MERCHANTS[program], amount,
      currency, state: legacyPaid ? 'legacy_paid' : 'payment_pending',
      due: legacyPaid ? 0 : amount, attemptCount: 0,
    };
    orders.set(id, order);
    return order;
  }

  function startCheckout(orderId, idempotencyKey) {
    const order = orders.get(orderId);
    if (!order) throw new Error('Order not found');
    if (order.state === 'legacy_paid' || order.state === 'paid') return null;
    if (!idempotencyKey) throw new Error('Idempotency key required');
    if (order.checkoutKey === idempotencyKey) return order.checkout;
    order.checkoutKey = idempotencyKey;
    order.checkout = `mock-checkout:${order.merchant}:${order.id}`;
    order.attemptCount += 1;
    return order.checkout;
  }

  function applyVerifiedEvent({ eventId, merchant, orderId, type }) {
    if (!eventId || seenEvents.has(eventId)) return false;
    const order = orders.get(orderId);
    if (!order || merchant !== order.merchant) throw new Error('Unknown order or merchant mismatch');
    seenEvents.add(eventId);
    if (order.state === 'legacy_paid') return false;
    if (type === 'payment_succeeded') order.state = 'paid';
    else if (type === 'ach_pending') order.state = 'payment_pending';
    else if (type === 'payment_failed') order.state = 'failed';
    else if (type === 'refund_partial') order.state = 'partially_refunded';
    else if (type === 'refund_full') order.state = 'refunded';
    else throw new Error('Unsupported event');
    return true;
  }

  return { createOrder, startCheckout, applyVerifiedEvent };
}

module.exports = { createPaymentWorkflow };
