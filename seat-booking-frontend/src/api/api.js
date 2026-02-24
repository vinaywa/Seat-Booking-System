import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE_URL });

// ── Bookings ────────────────────────────────────
export const bookSeat = (userId, date) =>
  api.post("/bookings/book", { userId, date });

export const blockSeat = (userId) =>
  api.post("/bookings/block", { userId });

export const vacateSeat = (userId, date) =>
  api.post("/bookings/vacate", { userId, date });

export const getAvailableSeats = (date) =>
  api.get("/bookings/available", { params: { date } });

export const getUserBookings = (userId) =>
  api.get(`/bookings/user/${userId}`);

export const getUtilization = (date) =>
  api.get("/bookings/utilization", { params: { date } });

export const getBookingsByDate = (date) =>
  api.get("/bookings", { params: { date } });

// ── Admin / Holidays ────────────────────────────
export const getHolidays = () =>
  api.get("/admin/holidays");

export const addHoliday = (date, description) =>
  api.post("/admin/holiday", { date, description });

export const deleteHoliday = (id) =>
  api.delete(`/admin/holiday/${id}`);

// ── Squads ──────────────────────────────────────
export const getSquads = () =>
  api.get("/squads");

// ── Allocations ─────────────────────────────────
export const getAllocations = (date) =>
  api.get("/allocations", { params: date ? { date } : {} });

export const triggerAllocation = (date) =>
  api.post("/allocations/allocate", date ? { date } : {});

export const getUsers = () =>
  api.get("/squads").then(async (r) => {
    // Flatten squad members into a users list
    const all = [];
    for (const sq of r.data) {
      for (const m of sq.members) {
        all.push({ ...m, squadName: sq.name });
      }
    }
    return all;
  });

export default api;
