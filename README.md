# BD District Info API

Free, offline-friendly source-data REST API for Bangladesh administrative geography, packaged for Node.js, Express.js and Vercel. The snapshot contains **8 divisions, 64 districts and 495 upazilas**, matching the 2022 administrative baseline requested for this project.

## SEO

- Title: `BD District Info API — Free Bangladesh Divisions, Districts & Upazilas REST API | RA Fahim`
- Description: Free Bangladesh administrative geography REST API by RA Fahim with bilingual division, district and upazila data.
- Keywords: `bd district api`, `bangladesh district api`, `bangladesh upazila api`, `postcode api bangladesh`
- Author: RA Fahim
- Canonical: https://rafahim.com/bd-district-api/

## Features

- Bilingual English and Bangla names
- 8 divisions
- 64 districts
- 495 upazilas
- District-headquarters postcode lookup dataset
- Rate limit: 100 requests per minute per IP
- Cache-Control: `public, max-age=86400` for GET responses
- Pagination with `page` and `limit`
- District filtering by `division`
- Sorting support with `sort=population` and `sort=name`
- Search across divisions, districts and upazilas
- Random administrative item endpoint
- CORS enabled
- Swagger UI at `/docs`
- Vercel compatible with a Node.js serverless deployment model

## Installation

```bash
npm install
npm start
```

Default local URL: http://localhost:3000

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | API landing page |
| GET | `/health` | Health check and record counts |
| GET | `/docs` | Swagger documentation |
| GET | `/divisions` | Paginated division list |
| GET | `/divisions/:name` | Division details with districts |
| GET | `/districts` | Paginated districts with filtering and sorting |
| GET | `/districts/:name` | District details |
| GET | `/districts/:name/upazilas` | Paginated upazilas for a district |
| GET | `/upazilas` | Paginated upazila list with filters |
| GET | `/upazilas/:name` | Upazila details |
| GET | `/postcode/:code` | District-headquarters postcode lookup |
| GET | `/search?q=` | Search administrative names |
| GET | `/random` | Random division, district or upazila |

## Pagination

```text
GET /districts?page=1&limit=20
GET /upazilas?page=2&limit=50
GET /divisions?page=1&limit=8
```

`limit` is capped at 100.

## Filtering and sorting

```text
GET /districts?division=Dhaka
GET /districts?division=Dhaka&sort=name
GET /districts?sort=population
GET /upazilas?division=Dhaka
GET /upazilas?district=Dhaka
```

The district objects expose `population` as `null` in this baseline because the requested dataset focuses on administrative naming and hierarchy. The API still implements the `sort=population` contract and keeps null values at the end of a stable numeric sort. This avoids inventing an unsupported population figure.

## Search

```text
GET /search?q=Dhaka
GET /search?q=ঢাকা
```

Search matches English and Bangla names.

## Random

```text
GET /random
GET /random?type=division
GET /random?type=district
GET /random?type=upazila
```

## cURL

```bash
curl http://localhost:3000/health
curl http://localhost:3000/divisions
curl "http://localhost:3000/districts?division=Dhaka&limit=13"
curl http://localhost:3000/districts/Dhaka
curl http://localhost:3000/districts/Dhaka/upazilas
curl "http://localhost:3000/upazilas?division=Dhaka&page=1&limit=20"
curl http://localhost:3000/postcode/1000
curl "http://localhost:3000/search?q=Dhaka"
curl "http://localhost:3000/random?type=upazila"
```

## JavaScript fetch

```js
const response = await fetch('http://localhost:3000/districts?division=Dhaka&limit=20')
const data = await response.json()
console.log(data)
```

## Python

```python
import requests

response = requests.get('http://localhost:3000/districts', params={'division': 'Dhaka', 'limit': 20}, timeout=10)
response.raise_for_status()
print(response.json())
```

## Vercel deploy

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Keep the project root as the repository root.
4. No build command is required.
5. Vercel detects the Node.js application entry point from `server.js`.
6. Set `NODE_VERSION` to an 18+ runtime if your account requires an explicit version.
7. Deploy.
8. Test `/health` and `/docs` on the Vercel URL.

The server exports the Express app and starts a local listener only when `server.js` is executed directly.

## Data sources

The administrative snapshot is based on the Open Admin Data Bangladesh administrative divisions dataset, which documents 8 divisions, 64 districts and 495 upazilas and provides bilingual administrative names. Source: https://github.com/open-admin-data/bangladesh-administrative-divisions

The 495-upazila count corresponds to the 2022 baseline. Bangladesh later approved five new upazilas in May 2026, raising the current total to 500. This project intentionally keeps the requested 495 historical snapshot and excludes Mokamtola, Matamuhuri, Chandraganj, Ruhia and Bhulli from the upazila list.

District headquarters postcode values are included as a compact lookup dataset. For operational postal validation, verify against the latest Bangladesh Post directory before using codes for shipping or regulated address workflows.

## Author

RA Fahim is a Web Developer & Creator based in Dhaka, Bangladesh.

- Website: https://rafahim.com
- GitHub: https://github.com/rafahim
- Email: dev@rafahim.com
- X: https://twitter.com/rafahimn
- LinkedIn: https://linkedin.com/in/rafahimn
- Focus: Full-stack web development
- Experience: 1 year

## SEO checklist

- Canonical URL configured for the public docs page
- Open Graph and Twitter Card metadata included on `/` and `/docs`
- JSON-LD includes WebAPI, Person and SoftwareApplication entities
- `robots.txt` points to the public sitemap
- `sitemap.xml` includes the public API docs URLs
- `humans.txt` identifies RA Fahim and Dhaka, Bangladesh
- `.well-known/security.txt` provides the security contact email

## Made in Bangladesh

![Made in Bangladesh](https://img.shields.io/badge/Made%20in-Bangladesh-006A4E?labelColor=F42A41&logo=gitbook&logoColor=white)

## License

The application code is released under the MIT License in `LICENSE`. Upstream dataset licensing and attribution requirements remain applicable to data derived from external sources.

Built with ❤️ by RA Fahim · rafahim.com · © 2026 RA Fahim
