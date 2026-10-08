module.exports = (err, req, res, next) => {
  const status = Number.isInteger(err.statusCode) ? err.statusCode : 500
  const message = status >= 500 ? 'Internal server error' : (err.message || 'Request failed')
  res.status(status).json({ error:message })
}
