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
const byName = (a, b) => a.name.en.localeCompare(b.name.en)

router.get('/', (req, res) => {
  let items = [...req.app.locals.data.districts]
  if (req.query.division) {
    const division = normalize(req.query.division)
    items = items.filter(x => normalize(x.division.en) === division || normalize(x.division.bn) === division || normalize(req.app.locals.data.divisions.find(d => d.id === x.division_id)?.slug) === division)
  }
  const sort = String(req.query.sort || '').toLowerCase()
  if (sort === 'population') items.sort((a,b) => (b.population || 0) - (a.population || 0))
  if (sort === 'name') items.sort(byName)
  const { data, pagination } = paginate(items, req.query)
  res.json({ data, pagination, filters:{ division:req.query.division || null, sort:sort || null } })
})

router.get('/:name/upazilas', (req, res) => {
  const target = normalize(req.params.name)
  const district = req.app.locals.data.districts.find(x => normalize(x.name.en) === target || normalize(x.name.bn) === target || x.slug === target)
  if (!district) return res.status(404).json({ error:'District not found', name:req.params.name })
  let items = req.app.locals.data.upazilas.filter(x => x.district_id === district.id)
  if (String(req.query.sort || '').toLowerCase() === 'name') items.sort(byName)
  const { data, pagination } = paginate(items, req.query)
  res.json({ district, data, pagination })
})

router.get('/:name', (req, res) => {
  const target = normalize(req.params.name)
  const district = req.app.locals.data.districts.find(x => normalize(x.name.en) === target || normalize(x.name.bn) === target || x.slug === target)
  if (!district) return res.status(404).json({ error:'District not found', name:req.params.name })
  res.json({ ...district, divisionInfo:req.app.locals.data.divisions.find(x => x.id === district.division_id) || null })
})

module.exports = router
