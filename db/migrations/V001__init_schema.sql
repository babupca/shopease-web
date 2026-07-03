-- ShopEase initial schema (PostgreSQL). The demo app uses an in-memory store (src/data/store.js) mirroring these tables.
CREATE TABLE users (
  id            VARCHAR(20) PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(120) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'customer',
  region        VARCHAR(10)  NOT NULL DEFAULT 'US-CA',
  created_at    TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id          VARCHAR(20) PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  category    VARCHAR(60)  NOT NULL,
  price       NUMERIC(10,3) NOT NULL CHECK (price >= 0),
  rating      NUMERIC(2,1),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE orders (
  id          VARCHAR(20) PRIMARY KEY,
  user_id     VARCHAR(20) NOT NULL REFERENCES users(id),
  status      VARCHAR(20) NOT NULL,
  subtotal    NUMERIC(10,2) NOT NULL,
  discount    NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping    NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax         NUMERIC(10,2) NOT NULL DEFAULT 0,
  total       NUMERIC(10,2) NOT NULL,
  region      VARCHAR(10) NOT NULL,
  promo_code  VARCHAR(30),
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  order_id   VARCHAR(20) NOT NULL REFERENCES orders(id),
  product_id VARCHAR(20) NOT NULL REFERENCES products(id),
  unit_price NUMERIC(10,3) NOT NULL,
  qty        INTEGER NOT NULL CHECK (qty BETWEEN 1 AND 10),
  PRIMARY KEY (order_id, product_id)
);
