# Smart Office Seat Booking System

A full-stack **office seat booking** app with batch-based weekly rotation, designated vs floater seats, holidays, leave days, and admin seat management. Built with **React (Vite)** frontend and **Node.js / Express / MongoDB** backend.

---

## What It Does

- **Employees** sign up with a batch (A or B) and book seats for the current week on a **timeline schedule** (seats × Mon–Fri).
- **Batch rules**: Designated seats (1–40) are bookable on your batch’s designated days; floater seats (41–50) on the other days.
- **Holidays** block all bookings for those dates; **Leave day** lets employees release their seat for a day (with reason) and optionally cancel leave to rebook.
- **Admins** can enable/disable seats (maintenance) and manage the system from the Admin panel.

---

## Tech Stack

| Layer   | Stack |
|--------|--------|
| Frontend | React 18, Vite, React Router, Axios |
| Backend  | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth     | JWT (httpOnly-style token in localStorage) |

---

## Quick Start

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** running (e.g. `mongodb://localhost:27017` or MongoDB Atlas)

### 1. Clone and open the project

```bash
git clone <your-repo-url>
cd Seat-Booking-System-main
```

### 2. Backend setup and run

```bash
cd backend
npm install
```

Create a **`.env`** file in `backend/` (you can copy from `.env.example` if present):

```env
MONGO_URI=mongodb://localhost:27017/seat-booking
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

Then:

```bash
npm run seed    # Creates 50 seats, sample users, holidays (run once)
npm run dev     # Server at http://localhost:5000
```

### 3. Frontend setup and run (new terminal)

```bash
cd frontend
npm install
npm run dev     # UI at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Sample Credentials (after `npm run seed`)

| Email              | Password        | Role    | Batch |
|--------------------|-----------------|---------|-------|
| admin@example.com  | SecureAdmin@2026 | Admin   | A     |
| alice@example.com  | Rahul@1234      | Employee| A     |
| bob@example.com    | Sneha@5678      | Employee| B     |
| carol@example.com  | Arjun@9012     | Employee| A     |

---

## Main Features

- **Auth** — Register / login with name, email, password, batch. JWT stored in localStorage.
- **Home** — Landing after login with link to the booking (schedule) page.
- **Schedule** — Timeline view: left column = seats (1–50), columns = Mon–Fri. Each cell shows seat number and status (Designated, Floater, Your booking, Taken, Blocked). Blocked cells (wrong day, holiday, maintenance) use a striped style; floater seats show an “F” badge.
- **Booking** — Click an available seat tile to book that seat for that day. You can only book according to batch and seat-type rules.
- **Holidays** — List of holidays; admins can add/remove. These dates are blocked for everyone.
- **Leave day** (employees only) — Pick a date and reason, then “Apply leave and release seat” to free your seat, or “Cancel leave and restore seat” to rebook.
- **Admin** — Enable/disable seats (maintenance). Admin link only visible to users with role `ADMIN`.

---

## How the Rules Work

### Seat types

| Seat numbers | Type        |
|-------------|-------------|
| 1–40        | Designated  |
| 41–50       | Floater     |

### Batch and week

- Week type is based on **ISO week number** of the date:
  - **Odd ISO week** → WEEK_1  
  - **Even ISO week** → WEEK_2  

| Batch | WEEK_1 (Mon–Wed / Thu–Fri) | WEEK_2 |
|-------|----------------------------|--------|
| **A** | Mon, Tue, Wed              | Thu, Fri |
| **B** | Thu, Fri                   | Mon, Tue, Wed |

### Who can book which seat when

- **Designated seats** — Only on your batch’s **designated** days for that week type.
- **Floater seats** — Only on your batch’s **non-designated** days.

### Other rules

- Weekends (Sat/Sun) and holidays are blocked.
- Inactive (maintenance) seats are blocked.
- One booking per seat per date; users can only release their own bookings.

### Note on booking time

- The original “booking opens after 3 PM IST” rule is **disabled** in the frontend so that booking is allowed at any time (useful for demos and testing).

---

## Routes (Frontend)

| Path       | Access     | Description                |
|------------|------------|----------------------------|
| `/auth`    | Public     | Login / Register           |
| `/`        | Logged in  | Home                       |
| `/schedule`| Logged in  | Weekly timeline & booking  |
| `/holidays`| Logged in  | Holidays list              |
| `/leave`   | Employees  | Apply / cancel leave       |
| `/admin`   | Admins     | Seat enable/disable        |

---

## API Endpoints (Backend)

| Method | URL | Description |
|--------|-----|-------------|
| POST   | `/auth/register` | Register (name, email, password, batch) |
| POST   | `/auth/login`    | Login → returns JWT |
| GET    | `/seats`         | All seats |
| GET    | `/bookings?week=YYYY-WW` | Bookings for that ISO week |
| POST   | `/bookings`      | Create booking (policy engine) |
| DELETE | `/bookings/:id`  | Release own booking |
| GET    | `/my-bookings`   | Current user’s upcoming bookings |
| GET    | `/holidays`      | List holidays |
| POST   | `/holidays`      | Add holiday `{ date, reason }` |
| DELETE | `/holidays/:id`  | Remove holiday |
| GET/PATCH | `/admin/seats` | List/update seats (enable/disable) |

All except `/auth/*` require `Authorization: Bearer <JWT>`.

---

## Project Structure

```
Seat-Booking-System-main/
├── backend/
│   ├── models/        # User, Seat, Booking, Holiday
│   ├── routes/        # auth, seats, bookings, holidays, myBookings, admin
│   ├── middleware/    # authMiddleware
│   ├── policyEngine.js
│   ├── seed.js
│   ├── index.js
│   └── .env           # MONGO_URI, PORT, JWT_SECRET (not committed)
├── frontend/
│   └── src/
│       ├── pages/     # AuthPage, HomePage, BookingPage, HolidaysPage, LeavePage, AdminPage
│       ├── components/# Navbar, SeatGrid, etc.
│       ├── App.jsx
│       └── main.jsx
└── README.md
```

---

## Theme and UI

- White, SaaS-style layout with light gray sections and indigo/blue accents.
- Schedule uses a **timeline layout** (seats on the left, weekdays as columns) with square-ish cells and clear labels (seat number + designation/status).

---

## License

Use and modify as needed for your organization.
