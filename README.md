# FarmDirect — Farmer to Consumer Marketplace

A full-stack MERN app that lets farmers list produce and sell directly to buyers, cutting out middlemen. Features real-time negotiation chat, escrow payments, geospatial search, and a trust/review system.

---

## Project Structure

```
farmer-marketplace/
├── backend/
│   ├── config/
│   │   └── cloudinary.js        # Image upload config
│   ├── middleware/
│   │   └── auth.js              # JWT auth middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Listing.js
│   │   ├── Order.js
│   │   ├── Negotiation.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── listings.js
│   │   ├── orders.js
│   │   ├── negotiations.js
│   │   ├── reviews.js
│   │   └── users.js
│   ├── server.js
│   ├── package.json
│   └── .env                     # ← fill this in
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ListingCard.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── SocketContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Marketplace.jsx
    │   │   ├── ListingDetail.jsx
    │   │   ├── CreateListing.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Orders.jsx
    │   │   ├── OrderDetail.jsx
    │   │   ├── Negotiations.jsx
    │   │   ├── NegotiationChat.jsx
    │   │   └── Profile.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Prerequisites

- Node.js v18+
- MongoDB (local install or free [MongoDB Atlas](https://cloud.mongodb.com) cluster)
- (Optional) Free [Cloudinary](https://cloudinary.com) account for image uploads

---

## Setup

### 1. Configure backend environment

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/farmer-marketplace
JWT_SECRET=change_this_to_a_long_random_string

# Get free credentials at cloudinary.com (skip if not using image upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

> **MongoDB Atlas (cloud):** Replace `MONGO_URI` with your Atlas connection string:
> `mongodb+srv://username:password@cluster.mongodb.net/farmer-marketplace`

---

### 2. Install & run backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at **http://localhost:5000**

---

### 3. Install & run frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Usage

1. Open http://localhost:5173
2. Register as a **Farmer** → create listings, manage orders, chat with buyers
3. Register as a **Buyer** → browse, negotiate, place orders, confirm delivery

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register farmer or buyer |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✓ | Get current user |
| GET | `/api/listings` | — | Browse listings (filters, geo, search) |
| POST | `/api/listings` | Farmer | Create listing |
| GET | `/api/listings/:id` | — | Get listing detail |
| PUT | `/api/listings/:id` | Farmer | Update listing |
| DELETE | `/api/listings/:id` | Farmer | Delete listing |
| GET | `/api/listings/farmer/my` | Farmer | Farmer's own listings |
| POST | `/api/orders` | Buyer | Place order |
| GET | `/api/orders` | ✓ | Get user's orders |
| GET | `/api/orders/:id` | ✓ | Order detail |
| PATCH | `/api/orders/:id/status` | ✓ | Update order status |
| PATCH | `/api/orders/:id/payment` | Buyer | Simulate escrow payment |
| POST | `/api/negotiations` | Buyer | Start negotiation |
| GET | `/api/negotiations` | ✓ | Get user's negotiations |
| GET | `/api/negotiations/:id` | ✓ | Negotiation detail |
| POST | `/api/negotiations/:id/message` | ✓ | Send message/offer |
| POST | `/api/reviews` | ✓ | Submit review |
| GET | `/api/reviews/user/:userId` | — | Get user's reviews |
| GET | `/api/users/dashboard/stats` | ✓ | Dashboard statistics |
| PUT | `/api/users/profile/me` | ✓ | Update profile |

---

## Features

- **JWT Authentication** — secure login for farmers and buyers
- **Produce Listings** — create with images, location, harvest date
- **Geospatial Search** — find produce near you using MongoDB `$near`
- **Full-text Search** — search by crop name, description, tags
- **Real-time Negotiation** — Socket.io powered price negotiation chat
- **Escrow Payment** — simulated payment hold until delivery confirmed
- **Order Lifecycle** — pending → confirmed → dispatched → delivered
- **Review System** — mutual reviews build trust scores
- **Role Dashboards** — separate views for farmers and buyers
- **Image Upload** — Cloudinary integration (5 images per listing)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Vite |
| Styling | Pure CSS with CSS variables |
| Real-time | Socket.io client |
| HTTP | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT + bcryptjs |
| WebSockets | Socket.io |
| Images | Cloudinary + Multer |
| Validation | express-validator |
