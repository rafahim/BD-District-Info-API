const express = require('express')
const router = express.Router()

const normalize = value => decodeURIComponent(String(value || '')).trim().toLowerCase().replace(/[\s_]+/g, '-')
const paginate = (items, query) => {
  const page = Math.max(Number.parseInt(query.page || '1', 10) || 1, 1)
  const limit = Math.min(Math.max(Number.parseInt(query.limit || '20', 10) || 20, 1), 100)
  const total = items.length
  const start = (page - 1) * limit
  return { data:items.slice(start, start + limit), pagination:{ page, limit, total, totalPages:Math.ceil(total / limit) } }
}

router.get('/', (req, res) => {
  let items = [...req.app.locals.data.upazilas]
  if (req.query.division) {
    const division = normalize(req.query.division)
    items = items.filter(x => normalize(x.division.en) === division || normalize(x.division.bn) === division)
  }
  if (req.query.district) {
    const district = normalize(req.query.district)
    items = items.filter(x => normalize(x.district.en) === district || normalize(x.district.bn) === district)
  }
  if (String(req.query.sort || '').toLowerCase() === 'name') items.sort((a,b) => a.name.en.localeCompare(b.name.en))
  const { data, pagination } = paginate(items, req.query)
  res.json({ data, pagination, filters:{ division:req.query.division || null, district:req.query.district || null, sort:req.query.sort || null } })
})

router.get('/:name', (req, res) => {
  const target = normalize(req.params.name)
  const item = req.app.locals.data.upazilas.find(x => normalize(x.name.en) === target || normalize(x.name.bn) === target || x.slug === target)
  if (!item) return res.status(404).json({ error:'Upazila not found', name:req.params.name })
  res.json(item)
})

module.exports = router
