const express = require('express')
const router = express.Router()

const normalize = value => decodeURIComponent(String(value || '')).trim().toLowerCase().replace(/[\s_]+/g, '-')
const paginate = (items, query) => {
  const page = Math.max(Number.parseInt(query.page || '1', 10) || 1, 1)
  const limit = Math.min(Math.max(Number.parseInt(query.limit || '20', 10) || 20, 1), 100)
  const total = items.length
  const start = (page - 1) * limit
  const data = items.slice(start, start + limit)
  return { data, pagination:{ page, limit, total, totalPages:Math.ceil(total / limit) } }
}

router.get('/', (req, res) => {
  const { data, pagination } = paginate(req.app.locals.data.divisions, req.query)
  res.json({ data, pagination })
})

router.get('/:name', (req, res) => {
  const target = normalize(req.params.name)
  const item = req.app.locals.data.divisions.find(x => normalize(x.name.en) === target || normalize(x.name.bn) === target || x.slug === target)
  if (!item) return res.status(404).json({ error:'Division not found', name:req.params.name })
  const districts = req.app.locals.data.districts.filter(x => x.division_id === item.id)
  res.json({ ...item, districts })
})

module.exports = router
