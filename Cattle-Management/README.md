# Cattle Management System — MVP

A full-stack (MERN) cattle/livestock trading ledger: animals, dynamic vaccination
history, monthly weight tracking, search, and one-click PDF reports.

- **Frontend:** React (Vite) + Tailwind + React Router + Recharts + Axios
- **Backend:** Node.js + Express + Mongoose
- **DB:** MongoDB Atlas (cloud-hosted — no local Mongo container needed)
- **Photos:** Cloudinary (optional per animal — placeholder shown if skipped)
- **PDF:** pdfkit (pure-JS, no headless browser)

---

## Run it with Docker Compose (recommended)

### 1. Get a free MongoDB Atlas cluster
1. Sign up / log in at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free **M0** cluster.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add IP `0.0.0.0/0` (allow access from anywhere) — simplest for local Docker use; tighten later if deploying.
4. **Database → Connect → Drivers** → copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`

### 2. Get a free Cloudinary account
Photo upload needs Cloudinary credentials. Sign up free at
[cloudinary.com](https://cloudinary.com) → Dashboard → copy your **Cloud name**,
**API Key**, **API Secret**. (You can skip this and just never upload photos —
the app works fine with placeholder avatars only — but the env vars still need
to exist, even as dummy values, for the server to boot.)

### 3. Configure environment
```bash
cp server/.env.example server/.env
```
Open `server/.env` and fill in:
```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/cattle-mgmt?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Keep `/cattle-mgmt` right before the `?` in the URI — that's the database name
this app uses. (`PORT` and `CLIENT_URL` in that file are overridden by
`docker-compose.yml` for the container network — no need to touch them.)

### 4. Build and run everything
```bash
docker compose up --build
```
This starts two containers (the database lives in Atlas, not locally):
| Service  | URL                     |
|----------|-------------------------|
| client   | http://localhost:5173   |
| server   | http://localhost:5000   |

### 5. Seed sample data (one time, in a second terminal)
```bash
docker compose exec server npm run seed
```
This inserts 4 sample animals (mix of with/without photo), vaccination
history (including one overdue and one due-this-week, so the dashboard's
"Due This Week" strip isn't empty), and a few months of weight logs.

### 5. Open the app
Go to **http://localhost:5173** — the dashboard/ledger loads with the seeded
animals.

To stop everything: `Ctrl+C`, then `docker compose down` (add `-v` to also
wipe the Mongo volume).

---

## Running without Docker (local dev)

**Prereqs:** Node 18+, a MongoDB Atlas cluster (see step 1 above, or any Mongo instance), a Cloudinary account.

```bash
# Server
cd server
cp .env.example .env   # fill in MONGO_URI (Atlas connection string) + Cloudinary keys
npm install
npm run seed            # optional, seeds sample data
npm run dev              # http://localhost:5000

# Client (new terminal)
cd client
npm install
npm run dev              # http://localhost:5173
```
The Vite dev server proxies `/api/*` requests to `http://localhost:5000`
(see `client/vite.config.js`).

---

## Project structure
```
cattle-mgmt/
├── docker-compose.yml
├── server/                  Express API
│   ├── config/               db.js, cloudinary.js
│   ├── models/                Animal, Vaccination, WeightLog, Counter
│   ├── routes/                animals, vaccinations, weights, meta
│   ├── middleware/            upload.js (multer memory storage)
│   ├── utils/                  dateUtils.js, pdfReport.js (pdfkit)
│   ├── seed/seed.js
│   └── Dockerfile
└── client/                  React (Vite) app
    ├── src/
    │   ├── api/axios.js
    │   ├── components/        EarTag, AnimalPhoto, QuickVaccinationPopover, BulkVaccinate, BulkWeighIn, ...
    │   └── pages/               Dashboard, AddAnimal, AnimalProfile
    └── Dockerfile
```

## API endpoints
```
GET    /api/animals                        list all (?search=)
GET    /api/animals/stats                   dashboard quick stats
GET    /api/animals/:animalId               get one
POST   /api/animals                         create (multipart: photo optional)
PUT    /api/animals/:animalId               edit (multipart: photo optional)
DELETE /api/animals/:animalId               delete (+ its vaccinations/weights)
GET    /api/animals/:animalId/pdf           download PDF report

GET    /api/animals/:animalId/vaccinations             list
GET    /api/animals/:animalId/vaccinations/last/:name   last-used entry for a vaccine (smart defaults)
POST   /api/animals/:animalId/vaccinations              add
PUT    /api/animals/:animalId/vaccinations/:id          edit
DELETE /api/animals/:animalId/vaccinations/:id          delete

GET    /api/animals/:animalId/weights        list
POST   /api/animals/:animalId/weights        add (rejects duplicate month)
PUT    /api/animals/:animalId/weights/:id     edit
DELETE /api/animals/:animalId/weights/:id     delete

GET    /api/meta/vaccine-names               distinct vaccine names (quick-add dropdown)
```

## Design notes
- Light "ledger book" theme — forest green + brass/gold + warm paper white, no dark mode.
- The **ear-tag badge** (brass, monospace ID) is the app's signature element and repeats
  everywhere: dashboard rows, profile header, PDF report.
- Vaccination entry is optimized to 2 clicks: the syringe icon on any dashboard row (or
  the "Due This Week" strip) opens a small popover pre-filled with today's date and the
  last-used frequency for that vaccine — confirm and save.
