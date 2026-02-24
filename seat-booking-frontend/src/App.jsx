import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import BookSeat from "./pages/BookSeat";
import BlockSeat from "./pages/BlockSeat";
import VacateSeat from "./pages/VacateSeat";
import WeeklyAllocation from "./pages/WeeklyAllocation";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/book" element={<BookSeat />} />
        <Route path="/block" element={<BlockSeat />} />
        <Route path="/vacate" element={<VacateSeat />} />
        <Route path="/allocation" element={<WeeklyAllocation />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}
