# Atelier Store — implementation plan

## Product scope and implementation approach

Build the requested full-stack commerce application as plain JavaScript, with a React 18/Vite 8.3.4 customer and admin client in `client/` and an Express/Mongoose API in `server/`. Use React Router 7.18.4 for the client, Context for the signed-in user/cart/wishlist view state, and a small fetch wrapper for API calls. The package manifest pins these versions and requires Node.js 22.12 or newer. Keep controllers, routes, and models separate, avoid TypeScript, UI frameworks, Redux, GraphQL, and microservices, and keep one plain CSS file per page/component. Pin UUID to patched 11.1.1 to protect the ExcelJS transitive UUID dependency while retaining the requested workbook import/export library.

MongoDB is the requested persistent database, accessed through Mongoose and `MONGO_URI`; the managed platform database (MySQL) is intentionally not substituted or enabled. Local run instructions will require a reachable MongoDB service and explain the sample URI. Protect passwords with bcrypt and authenticate customers/admins with JWTs in an application-owned HttpOnly cookie. Support credentials-based account signup/login (as requested), use distinct customer/admin roles and admin middleware, set the cookie for cross-site HTTPS Preview (`SameSite=None; Secure`), and keep plain-HTTP local settings explicit in `.env` rather than inferring public HTTPS from Express request flags. Never return password hashes from APIs.

Product lists must be server-paginated (20/page default), searchable by name, filterable by category/discount/bestseller, and backed by the requested Mongoose indexes. Seed the customer-facing demo with homewares categories/products. Build accessible, responsive home, category, product-detail, auth, wishlist, cart, customer-order and admin pages. Cart/order writes validate current stock and prices on the server. Checkout creates an order with `Pending` status and `Unpaid` payment status and does not charge or collect payment details.

The admin area will provide product search/filter/pagination and product CRUD, Excel template download, bulk `.xlsx` upload with row validation/category creation/SKU upsert operations and a row-by-row outcome report, order status management, customer search/details/order history and account activation controls. Excel writes use bulk operations. Include dashboard counts, admin seeding from environment settings, and sample catalog seed data.

Express will provide JSON API endpoints, health response, security middleware and static production serving for the built Vite app. The development setup will serve the UI and API together on the managed preview port. In middleware mode, attach Vite's HMR WebSocket to the parent Node HTTP server; use the public HTTPS client port 443 in the embedded Preview and the configured app port for plain-HTTP local development. Keep the public page-route manifest in `public/manus-routes.json` synchronized with React Router. Provide a root `.env.example`, README and concise local start/seed instructions. Keep social destinations in a shared config file. Add the requested `PaymentService` methods that throw `Not implemented yet` and a `/api/payments` 501 placeholder only.

### Audit-driven implementation refinements

- Compute one effective sale unit price consistently in product cards/details, cart totals, and the immutable order snapshot; the server remains authoritative for checkout totals.
- Remove product references from carts and wishlists when an administrator deletes a product, and safely prune any old populated-null references so carts do not become unremovable.
- Add compensating cleanup if order creation succeeds but cart clearing fails. Validate malformed product ids as not-found responses.
- Ensure declared Mongoose indexes are explicitly created after MongoDB connects, including when production disables automatic index creation.
- Require an explicit `CLIENT_URL` origin allowlist for CORS; reject cross-site mutations by Origin/Fetch-Metadata checks. Limit the embedded-preview frame/CSP exception to `PREVIEW_EMBED=true`; retain production Helmet protections by default.
- Validate uploaded `.xlsx` MIME/signature and reject blank or invalid required numeric cells. Bulk-upsert missing categories and products, derive created/updated counts from bulk results, and keep the full row-error report available to administrators.

## Project structure

```text
atelierstore/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx, App.jsx, api.js
│       ├── context/       # AuthContext and StoreContext
│       ├── components/    # Header, Footer, ProductCard, ProtectedRoute, shared UI
│       ├── pages/         # Home, category, product, auth, wishlist, cart, orders, admin
│       ├── config/        # social links and store presentation settings
│       └── styles/        # global.css and one stylesheet per page/component
├── server/
│   ├── index.js, app.js, config/db.js
│   ├── models/            # User, Category, Product, Cart, Order
│   ├── routes/            # API route declarations
│   ├── controllers/       # request handling and validation
│   ├── middleware/        # auth, role, error and upload handling
│   ├── services/          # PaymentService placeholder
│   └── scripts/           # admin/catalog seed
├── public/                # hero asset and manus-routes.json
├── package.json           # pinned package manager and simple scripts
├── .env.example
├── README.md
├── TODO.md
└── plan.md
```

## Design direction (approved demo defaults, not a real-brand claim)

- **Design Movement:** Warm contemporary craft editorial, drawing on quiet modernist interiors and tactile, natural materials.
- **Core Principles:** (1) Editorial restraint and generous whitespace; (2) clear, honest product and stock information; (3) tactile materials and human-scale imagery; (4) effortless shopping without visual clutter.
- **Color Philosophy:** Linen and warm chalk create a sunlit, calm canvas; espresso ink preserves contrast and sophistication; clay accents nod to fired ceramics; muted olive is the ownable signature color. Use these tones to frame product imagery, not compete with it.
- **Layout Paradigm:** Asymmetric editorial storefront: offset hero text beside a large full-bleed lifestyle image, horizontal category/product rails, and shop-like detail pages with image and purchasing panel. Admin pages use compact practical tables.
- **Signature Elements:** Small olive leaf/asterisk emblem; fine clay-colored rules and pill badges; rounded product thumbnails with subtle paper-like surfaces.
- **Interaction Philosophy:** Direct and quiet. Filters and stock state update clearly; product swatches are labeled; cart feedback is immediate; unavailable inventory never presents an enabled purchase action.
- **Animation:** Brief opacity/translate transitions for page and card entry (160–220ms), restrained image zoom on hover, reduced-motion support, no looping animation or motion that delays shopping.
- **Typography System:** Georgia (or a similarly available editorial serif) for display headings paired with a clean system sans stack for body, controls and prices; concise, consistent hierarchy and high readability on mobile.
- **Brand Essence:** “A considered edit of enduring pieces for the everyday home.” Personality: tactile, calm, discerning.
- **Brand Voice:** Headings and CTAs are short and specific. Examples: “Make room for ritual.” and “Shop the new edit.”
- **Wordmark & Logo:** A compact custom CSS/SVG botanical asterisk mark paired with the “Atelier” wordmark; use a serif face for the wordmark rather than relying on a generated image for readable logo text.
- **Signature Brand Color:** Muted olive `#59654B`.

## Delivery and material constraint

The project source will run locally with Node.js, npm/pnpm per the pinned manifest, and a reachable MongoDB connection. This initialized workspace has the managed server capability but no managed database; persistent app data therefore requires the user’s MongoDB URI/service. Payments remain deliberately unimplemented. No public release will be claimed unless publishing is separately performed and confirmed.
