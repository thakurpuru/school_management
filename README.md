# School Management System

A complete MERN-based school management system with session-based admin authentication, student records, fee tracking, PDF receipts, teacher and staff management, and salary slip generation.

## Tech Stack

- MongoDB with Mongoose
- Express.js with MVC structure
- React.js with React Router
- Node.js
- Tailwind CSS
- Passport.js with session authentication
- PDFKit for fee receipts and salary slips

## Features

- Single admin login with Passport.js sessions
- Public school landing page
- Protected admin panel with sidebar navigation
- Dashboard statistics for students, staff, fees, and dues
- Structured student management with personal, academic, contact, and fee details
- Student search by name, Aadhar, phone, and student ID
- Fee payment tracking with accurate due calculation
- Traditional-style PDF fee receipts
- Monthly receipt generation for recurring tuition collection
- Manual and automatic class upgrade system
- Teacher and staff CRUD management
- Monthly salary recording with salary slip PDF generation

## Project Structure

```text
Project/
  backend/
    src/
      config/
      controllers/
      data/
      middleware/
      models/
      routes/
      services/
      utils/
    storage/
  frontend/
    src/
      api/
      components/
      context/
      hooks/
      layouts/
      pages/
      utils/
```

## Backend Setup

1. Open a terminal in `backend`
2. Copy `.env.example` to `.env`
3. Install dependencies:

```bash
npm install
```

4. Start the backend server:

```bash
npm run dev
```

The backend runs on `http://localhost:5000`

### Default Admin Login

- Email: `admin@school.com`
- Password: `admin123`

You can change both values from `backend/.env`.

## Frontend Setup

1. Open another terminal in `frontend`
2. Copy `.env.example` to `.env`
3. Install dependencies:

```bash
npm install
```

4. Start the frontend:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173`

## Important Business Rules Implemented

- Only one admin user is created and used for login
- No JWT is used
- All admin routes are session-protected
- Student deletion is blocked when dues are pending
- Fee payments update total paid and total due
- A PDF receipt is generated after each fee payment
- Monthly fee receipts support month-based collection
- Salary payments generate printable salary slips

## API Overview

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Dashboard

- `GET /api/dashboard`

### Students

- `GET /api/students`
- `POST /api/students`
- `GET /api/students/:id`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`
- `PATCH /api/students/:id/upgrade`
- `POST /api/students/auto-upgrade`

### Fees

- `POST /api/fees/:studentId/pay`
- `GET /api/fees/:studentId/history`

### Teachers

- `GET /api/teachers`
- `POST /api/teachers`
- `PUT /api/teachers/:id`
- `DELETE /api/teachers/:id`

### Staff

- `GET /api/staff`
- `POST /api/staff`
- `PUT /api/staff/:id`
- `DELETE /api/staff/:id`

### Salaries

- `GET /api/salaries`
- `POST /api/salaries`

## PDF Output

- Fee receipts are stored in `backend/storage/receipts`
- Salary slips are stored in `backend/storage/salary-slips`
- Generated files are served by the backend at `/storage/...`

## Notes

- This project was scaffolded locally in a clean workspace, so dependencies still need to be installed before running it.
- The system is organized to stay beginner-friendly while following a production-style separation of concerns.
