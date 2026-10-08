const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const divisionsRouter = require('./routes/divisions')
const districtsRouter = require('./routes/districts')
const upazilasRouter = require('./routes/upazilas')
const searchRouter = require('./routes/search')
const rateLimit = require('./middleware/rateLimit')
const cache = require('./middleware/cache')
const errorHandler = require('./middleware/errorHandler')

const app = express()
const port = process.env.PORT || 3000

app.set('trust proxy', 1)
app.use(cors())
app.use(express.json())
app.use(rateLimit)
app.use(cache)

const loadJson = name => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', name), 'utf8'))
const divisions = loadJson('divisions.json')
const districts = loadJson('districts.json')
const upazilas = loadJson('upazilas.json')
const postcodes = loadJson('postcodes.json')

app.locals.data = { divisions, districts, upazilas, postcodes }

const page = (title, description, body, extra = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><meta name="keywords" content="bd district api, bangladesh district api, bangladesh upazila api, postcode api bangladesh"><meta name="author" content="RA Fahim"><link rel="canonical" href="https://rafahim.com/bd-district-api/"><meta property="og:type" content="website"><meta property="og:title" content="BD District Info API — Free Bangladesh Divisions, Districts & Upazilas REST API | RA Fahim"><meta property="og:description" content="Free Bangladesh administrative geography REST API by RA Fahim with 8 divisions, 64 districts and a 495-upazila 2022 census snapshot."><meta property="og:url" content="https://rafahim.com/bd-district-api/"><meta property="og:image" content="https://rafahim.com/og-image.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="BD District Info API — Free Bangladesh Divisions, Districts & Upazilas REST API | RA Fahim"><meta name="twitter:description" content="Free Bangladesh divisions, districts, upazilas and postcodes REST API by RA Fahim."><script type="application/ld+json">${JSON.stringify([{ '@context':'https://schema.org','@type':'WebAPI','name':'BD District Info API','description':description,'url':'https://rafahim.com/bd-district-api/','documentation':'https://rafahim.com/bd-district-api/docs','provider':{'@type':'Person','name':'RA Fahim','url':'https://rafahim.com'}},{ '@context':'https://schema.org','@type':'Person','name':'RA Fahim','url':'https://rafahim.com','email':'dev@rafahim.com','jobTitle':'Web Developer & Creator','address':{'@type':'PostalAddress','addressLocality':'Dhaka','addressCountry':'BD'}},{ '@context':'https://schema.org','@type':'SoftwareApplication','name':'BD District Info API','applicationCategory':'DeveloperApplication','operatingSystem':'Any','url':'https://rafahim.com/bd-district-api/','author':{'@type':'Person','name':'RA Fahim'}}])}</script>${extra}</head><body>${body}<footer>Built with ❤️ by RA Fahim · rafahim.com · © 2026 RA Fahim</footer></body></html>`

const homeHtml = page('BD District Info API — Free Bangladesh Divisions, Districts & Upazilas REST API | RA Fahim','Free Bangladesh divisions, districts, upazilas and postcode REST API by RA Fahim.',`<main><h1>BD District Info API</h1><p>Free REST API for Bangladesh administrative geography.</p><p><strong>8 divisions · 64 districts · 495 upazilas</strong> using the 2022 administrative snapshot.</p><p><a href="/docs">Open Swagger Docs</a> · <a href="/health">Health</a> · <a href="/divisions">Divisions</a> · <a href="/districts">Districts</a> · <a href="/upazilas">Upazilas</a></p></main>`)

const docsHtml = page('BD District Info API — API Documentation | RA Fahim','Interactive Swagger documentation for the BD District Info API by RA Fahim.',`<div id="swagger-ui"></div><script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script><script>window.onload=()=>window.ui=SwaggerUIBundle({url:'/openapi.yaml',dom_id:'#swagger-ui',deepLinking:true,presets:[SwaggerUIBundle.presets.apis,SwaggerUIBundle.SwaggerUIStandalonePreset],layout:'BaseLayout'})</script>`,`<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">`)

app.get('/', (req, res) => res.type('html').send(homeHtml))
app.get('/health', (req, res) => res.json({ status:'ok', service:'bd-district-info-api', version:'1.0.0', timestamp:new Date().toISOString(), counts:{ divisions:divisions.length, districts:districts.length, upazilas:upazilas.length } }))
app.get('/docs', (req, res) => res.type('html').send(docsHtml))
app.get('/openapi.yaml', (req, res) => res.type('text/yaml').send(fs.readFileSync(path.join(__dirname,'openapi.yaml'),'utf8')))
app.get('/robots.txt', (req, res) => res.type('text/plain').send(fs.readFileSync(path.join(__dirname,'robots.txt'),'utf8')))
app.get('/sitemap.xml', (req, res) => res.type('application/xml').send(fs.readFileSync(path.join(__dirname,'sitemap.xml'),'utf8')))
app.get('/humans.txt', (req, res) => res.type('text/plain').send(fs.readFileSync(path.join(__dirname,'humans.txt'),'utf8')))
app.get('/.well-known/security.txt', (req, res) => res.type('text/plain').send(fs.readFileSync(path.join(__dirname,'.well-known','security.txt'),'utf8')))

app.use('/divisions', divisionsRouter)
app.use('/districts', districtsRouter)
app.use('/upazilas', upazilasRouter)
app.use('/search', searchRouter)

app.get('/postcode/:code', (req, res, next) => {
  try {
    const code = String(req.params.code).trim()
    const matches = postcodes.filter(item => item.code === code)
    if (!matches.length) return res.status(404).json({ error:'Postcode not found', code })
    res.json({ code, count:matches.length, results:matches })
  } catch (error) { next(error) }
})

app.get('/random', (req, res, next) => {
  try {
    const type = String(req.query.type || 'all').toLowerCase()
    const pools = { division:divisions, district:districts, upazila:upazilas, all:[...divisions,...districts,...upazilas] }
    const pool = pools[type]
    if (!pool) return res.status(400).json({ error:'Invalid type', allowed:['all','division','district','upazila'] })
    const item = pool[Math.floor(Math.random() * pool.length)]
    res.json({ type: type === 'all' ? (item.division_id ? (item.district_id ? 'upazila' : 'district') : 'division') : type, result:item })
  } catch (error) { next(error) }
})

app.use(errorHandler)

if (require.main === module) app.listen(port)

module.exports = app
