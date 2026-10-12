# Project ToDo

## [x] Responsive storefront, catalog discovery, product details, and shared presentation
- Frontend: React (Vite) with plain CSS (one CSS file per page/component, no UI framework). Use React Router for pages, Context API for auth/cart/wishlist state, and fetch or Axios for API calls. The layout must be responsive (mobile + desktop).
- Home page: show all categories, with each category's products listed under it (plus a "View all" link per category).
- Category page: all products of that category with pagination and filters (discounted, best sellers).
- Product card and details page: image, price, discount badge (old price crossed out when discounted), "Best Seller" badge, selectable color swatches, stock status.
- Add support for search by name and filters by category, discounted and best sellers.
- Add a shared Footer component at the end of every page with social media links (Facebook, Instagram, X, YouTube, TikTok, LinkedIn, WhatsApp). Keep all the URLs in one config file so they are easy to change.
- Keep the code simple, clean and well-commented. No over-engineering: no TypeScript, Redux, GraphQL or microservices.

## [x] Customer accounts, saved items, cart, checkout, and order history
- Sign up (name, email, password) and log in. After signup, redirect to the Home page.
- Auth: JWT + bcrypt password hashing, with two roles: customer and admin.
- Customers can add any available (in-stock) product to the Wishlist or the Cart. Out-of-stock products show "Unavailable" with the buttons disabled. If a guest clicks, redirect them to login.
- Wishlist page: view, remove, move to cart.
- Cart page: change quantity or color, remove items, see the total, then "Place Order".
- My Orders page: order history and current status.
- Order: user, items [{ product, name, price, color, quantity }], totalAmount, shippingAddress, status (Pending | Processing | Shipped | Delivered | Cancelled), paymentStatus (Unpaid | Paid | Refunded, default Unpaid), paymentMethod, createdAt.

## [x] MongoDB data model, scalable catalog API, and security
- Backend: Node.js + Express (JavaScript) with a simple structure: routes -> controllers -> models.
- Database: MongoDB (NoSQL) with Mongoose.
- Scale: support thousands of products. Use server-side pagination on every product list (e.g. 20 per page). Never load all products at once.
- User: name, email (unique), password (hashed), role (customer | admin), isActive, wishlist (array of product ids), createdAt.
- Category: name, slug (unique), image (optional).
- Product: sku (unique), name, description, price, category (ref), images [urls], colors [strings], isDiscounted (boolean flag), discountPercent (number, optional), isBestSeller (boolean flag), stock, isAvailable, createdAt.
- Cart: user (ref), items [{ product, color, quantity }].
- Add MongoDB indexes on category, sku (unique), best-seller flag, discount flag, and a text index on name.
- Libraries: multer (file upload), exceljs or xlsx (Excel parsing), dotenv, cors, helmet.
- Basic security: validate inputs, hash passwords, protect admin routes with role middleware, never return passwords in API responses.

## [x] Admin dashboard, product management, Excel import, order and account operations
- Admin features (admin role only, protected routes).
- Create the admin account automatically with a seed script that reads ADMIN_EMAIL and ADMIN_PASSWORD from .env. Generate a strong password.
- Dashboard: total products, orders and customers.
- Products: table with search, filters and pagination. The admin can add, edit and delete a product and edit all its criteria (price, discount flag/percent, best-seller flag, colors, stock, category, images).
- Excel upload: upload an .xlsx file to add many products at once, and provide a downloadable sample template.
- Columns: sku, name, description, category, price, isDiscounted, discountPercent, isBestSeller, colors (comma-separated), stock, images (comma-separated URLs).
- If the sku already exists, update the product; otherwise create it. Create missing categories automatically.
- Validate every row and return a report: created / updated / failed rows, with row number and reason.
- Excel import must use bulk operations (bulkWrite/insertMany), not row-by-row inserts.
- Orders: list with a status filter, view details, change order status.
- Accounts: list customers, search, view a customer's orders, activate/deactivate accounts.

## [x] Payment placeholder, seed data, project delivery and local setup
- Payments (to be added later). Do NOT implement payments now. Only prepare the structure: Create a PaymentService class (server/services/PaymentService.js) with empty methods createPayment(), verifyPayment() and refund() that throw "Not implemented yet". Add a /api/payments route placeholder that returns 501. Keep paymentStatus and paymentMethod on the Order model. For now, checkout simply creates the order as Pending / Unpaid.
- Deliver the full project (client/ and server/) with complete working code.
- Include .env.example (PORT, MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, CLIENT_URL).
- Include a seed script for the admin plus sample categories and products.
- Include a README with step-by-step instructions to run everything locally.
- At the end of your answer, clearly give me the admin email and password so I can log in.

## [x] Generated custom hero image pixels
- The home page references the exact managed-storage URL returned by the image generator: `/manus-storage/async-images/eZJuLoXOgR73SrY9hg9F3T/image-1.webp`.
- The generated image is now visible in the live Preview and visually confirmed as the storefront hero.
