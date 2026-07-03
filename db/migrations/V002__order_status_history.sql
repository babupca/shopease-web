CREATE TABLE order_status_history (
  order_id   VARCHAR(20) NOT NULL REFERENCES orders(id),
  status     VARCHAR(20) NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
