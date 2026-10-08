const express = require('express')
const router = express.Router()

const normalize = value => String(value || '').trim().toLowerCase()
const paginate = (items, query) => {
  const page = Math.max(Number.parseInt(query.page || '1', 10) || 1, 1)
  const limit = Math.min(Math.max(Number.parseInt(query.limit || '20', 10) || 20, 1), 100)
  const total = items.length
  const start = (page - 1) * limit
  return { data:items.slice(start, start + limit), pagination:{ page, limit, total, totalPages:Math.ceil(total / limit) } }
}
const matches = (name, q) => normalize(name.en).includes(q) || normalize(name.bn).includes(q)

router.get('/', (req, res) => {
  const q = normalize(req.query.q)
  if (!q) return res.status(400).json({ error:'Missing q query parameter', example:'/search?q=Dhaka' })
  const divisions = req.app.locals.data.divisions.filter(x => matches(x.name, q)).map(x => ({ type:'division', ...x }))
  const districts = req.app.locals.data.districts.filter(x => matches(x.name, q)).map(x => ({ type:'district', ...x }))
  const upazilas = req.app.locals.data.upazilas.filter(x => matches(x.name, q)).map(x => ({ type:'upazila', ...x }))
  const { data, pagination } = paginate([...divisions,...districts,...upazilas], req.query)
  res.json({ q:req.query.q, data, pagination, counts:{ divisions:divisions.length, districts:districts.length, upazilas:upazilas.length } })
})

module.exports = router
