'use strict';
const notifications = require('../../src/services/notificationService');
const { config } = require('../../src/config');

const user = { email: 'alice@shopease.example', name: 'Alice' };
const order = { id: 'ORD-1001', total: 1234.5 };

describe('Notifications', () => {
  test('[UT-NOTIF-001] order confirmation is queued with the order id in the subject', () => {
    notifications.sendOrderConfirmation(user, order);
    expect(notifications.outbox()[0]).toMatchObject({ to: user.email, template: 'order-confirmation' });
    expect(notifications.outbox()[0].subject).toContain('ORD-1001');
  });

  test('[UT-NOTIF-002] confirmation body shows the formatted total', () => {
    expect(notifications.sendOrderConfirmation(user, order).body).toContain('$1,234.50');
  });

  test('[UT-NOTIF-003] cancellation email uses the cancellation template', () => {
    expect(notifications.sendOrderCancelled(user, order).template).toBe('order-cancelled');
  });

  test('[UT-NOTIF-004] nothing is sent when notifications are disabled', () => {
    config.notifications.enabled = false;
    try {
      expect(notifications.sendOrderConfirmation(user, order)).toBeNull();
      expect(notifications.outbox()).toHaveLength(0);
    } finally {
      config.notifications.enabled = true;
    }
  });

  test('[UT-NOTIF-005] confirmation body includes the item count and support link', () => {
    const body = notifications.sendOrderConfirmation(user, { ...order, items: [{}, {}] }).body;
    expect(body).toContain('2 item(s)');
    expect(body).toContain('/support');
  });
});
