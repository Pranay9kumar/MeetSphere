export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  console.error(JSON.stringify({
    level: 'error',
    event: 'request_error',
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  }));

  if (res.headersSent) return next(err);
  res.status(err.statusCode || 500).json({
    error: err.statusCode ? err.message : 'Internal server error'
  });
}