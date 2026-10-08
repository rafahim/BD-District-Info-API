const buckets = new Map()
const WINDOW_MS = 60 * 1000
const LIMIT = 100

module.exports = (req, res, next) => {
  const now = Date.now()
  const key = req.ip || req.socket.remoteAddress || 'unknown'
  let item = buckets.get(key)
  if (!item || now - item.start >= WINDOW_MS) item = { start:now, count:0 }
  item.count += 1
  buckets.set(key, item)
  const remaining = Math.max(LIMIT - item.count, 0)
  const reset = Math.ceil((item.start + WINDOW_MS) / 1000)
  res.set('X-RateLimit-Limit', String(LIMIT))
  res.set('X-RateLimit-Remaining', String(remaining))
  res.set('X-RateLimit-Reset', String(reset))
  if (item.count > LIMIT) return res.status(429).json({ error:'Too many requests', retryAfterSeconds:Math.ceil((item.start + WINDOW_MS - now) / 1000) })
  next()
}
