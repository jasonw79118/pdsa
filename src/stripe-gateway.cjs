'use strict';

// Server-side Stripe adapter boundary. No SDK is loaded and no network calls
// happen until a configured server injects Stripe clients and merchant config.
// Never import this module from browser code.

const ORGANIZATIONS = Object.freeze(['pdsa', 'techform']);

function createStripeGateway({ clients, merchants }) {
  if (!clients || !merchants) throw new Error('Stripe clients and merchant configuration are required');

  function merchantFor(organizationId) {
    if (!ORGANIZATIONS.includes(organizationId)) throw new Error('Unknown organization');
    const merchant = merchants[organizationId];
    const stripe = clients[organizationId];
    if (!merchant?.enabled || !merchant.webhookSecret || !stripe) {
      throw new Error(`Stripe is not enabled for ${organizationId}`);
    }
    return { merchant, stripe };
  }

  async function createCheckout({ order, idempotencyKey, successUrl, cancelUrl }) {
    if (!order?.id || !order.organizationId || !Number.isSafeInteger(order.amountMinor) || order.amountMinor <= 0) {
      throw new Error('Invalid server-priced order');
    }
    if (!idempotencyKey) throw new Error('Idempotency key required');
    if (!successUrl || !cancelUrl) throw new Error('Checkout return URLs are required');
    if (order.state === 'paid' || order.state === 'legacy_paid' || order.state === 'refunded') return null;

    const { merchant, stripe } = merchantFor(order.organizationId);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: (order.currency || 'usd').toLowerCase(),
          unit_amount: order.amountMinor,
          product_data: { name: order.description || 'Program registration' },
        },
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: order.id,
      metadata: { order_id: order.id, organization_id: order.organizationId },
      payment_intent_data: {
        metadata: { order_id: order.id, organization_id: order.organizationId },
      },
    }, { idempotencyKey });

    if (!session?.id || !session?.url) throw new Error('Stripe did not return a hosted checkout session');
    return { id: session.id, url: session.url, merchantRef: merchant.accountRef };
  }

  function verifyWebhook({ organizationId, rawBody, signature }) {
    if (!Buffer.isBuffer(rawBody) || !signature) throw new Error('Raw webhook body and signature are required');
    const { merchant, stripe } = merchantFor(organizationId);
    const event = stripe.webhooks.constructEvent(rawBody, signature, merchant.webhookSecret);
    return { event, merchantRef: merchant.accountRef, organizationId };
  }

  return Object.freeze({ createCheckout, verifyWebhook });
}

module.exports = { createStripeGateway };
