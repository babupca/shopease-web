'use strict';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const body = { error: { code: err.code || 'INTERNAL_ERROR', message: status === 500 ? 'Internal server error' : err.message } };
  if (err.orderId) body.error.orderId = err.orderId;
  res.status(status).json(body);
}

function notFound(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}` } });
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, notFound, asyncHandler };
