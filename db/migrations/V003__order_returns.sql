-- SHOP-133 Order returns
ALTER TABLE orders ADD COLUMN return_reason VARCHAR(500);
ALTER TABLE orders ADD COLUMN returned_at TIMESTAMP;
ALTER TABLE orders ADD CONSTRAINT chk_orders_status
  CHECK (status IN ('PENDING','PAID','PAYMENT_FAILED','SHIPPED','DELIVERED','CANCELLED','RETURNED'));
CREATE INDEX idx_orders_status ON orders(status);
