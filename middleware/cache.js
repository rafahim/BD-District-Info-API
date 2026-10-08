module.exports = (req, res, next) => {
  if (req.method === 'GET') res.set('Cache-Control', 'public, max-age=86400')
  next()
}
