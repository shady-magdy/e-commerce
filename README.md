# Atelier Store

A responsive e-commerce demo built with React, Vite, plain CSS, Express, MongoDB, and Mongoose. The source is organized into `client/` and `server/`; the Express server hosts the React app and `/api` endpoints on one port. Payments are intentionally not implemented.

## Requirements

- Node.js 22.12 or newer (developed with Node 22.13)
- npm 10.9.2 (pinned in `package.json`)
- MongoDB Community Server 6+ locally, or a reachable MongoDB deployment/Atlas URI

The project deliberately uses MongoDB/Mongoose, as requested. Its managed web workspace has a server but no managed MongoDB database, so local use needs a running MongoDB service and a valid `MONGO_URI`.

## Local setup

1. Clone/copy the project and open a terminal in its root.
2. Create the root environment file: `cp .env.example .env`.
3. Set `MONGO_URI` to your MongoDB URI. For local MongoDB, the sample value `mongodb://127.0.0.1:27017/atelier_store` is suitable once `mongod` is running.
4. Set `JWT_SECRET` to a long random secret and `ADMIN_PASSWORD` to a strong password of at least 16 characters. Choose the matching `ADMIN_EMAIL`. Keep `.env` private; it is ignored by Git.
5. For plain HTTP localhost, leave `COOKIE_SECURE=false`. HTTPS preview/production should use secure cookies (`COOKIE_SECURE=true`, or omit the variable).
6. Set `CLIENT_URL` to the exact browser origin allowed to use the API. Keep `PREVIEW_EMBED=false` for local and normal production hosting; set it to `true` only for an app running inside the embedded Manus Preview.
7. Install and run:

   ```sh
   npm install
   npm run seed
   npm run dev
   ```

8. Open `http://localhost:3000`. The demo administrator signs in at `/login` using `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Seed again after changing the catalog; the sample products are upserted by SKU and the existing admin password is not reset.

For production, build the client with `npm run build`, set `NODE_ENV=production`, configure `PORT`, `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, an exact `CLIENT_URL` (or comma-separated allowlist), and secure cookies, then run `npm start`. Leave `PREVIEW_EMBED=false` in production so Helmet's frame and Content Security Policy protections remain enabled. The generated static client is served from `client/dist` by Express.

## Catalog and admin operations

Catalog endpoints paginate server-side (20 per page by default, maximum 40). Search uses the MongoDB text index on product names; category, sale and bestseller filters are supported. Seed data includes Ceramics, Lighting, Textiles, and Objects.

The admin area lives at `/admin`. It supports a dashboard, product CRUD, filters and pagination, order status changes, customer search/order history and account activation controls. The product page includes a downloadable `.xlsx` template and a bulk importer. Imports validate rows, create categories that do not exist, upsert products by SKU using MongoDB `bulkWrite`, and report created, updated, and failed rows.

Customer checkout saves an order with status `Pending` and payment status `Unpaid`. It does not request payment details or process payment. `/api/payments` returns HTTP 501, and `server/services/PaymentService.js` contains only throwing placeholder methods.

## Main files

- `client/src/pages/` — storefront, customer, cart/order, and admin screens
- `client/src/context/` — auth and shopping state
- `server/routes/` → `server/controllers/` → `server/models/` — API layers
- `server/scripts/seed.js` — administrator and demo-catalog seed
- `.env.example` — environment-variable template
