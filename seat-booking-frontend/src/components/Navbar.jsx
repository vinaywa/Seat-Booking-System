import { NavLink } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="navbar">
            <NavLink to="/" className="navbar-brand">🪑 SeatBook</NavLink>
            <ul className="navbar-links">
                <li><NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink></li>
                <li><NavLink to="/book" className={({ isActive }) => isActive ? "active" : ""}>Book Seat</NavLink></li>
                <li><NavLink to="/block" className={({ isActive }) => isActive ? "active" : ""}>Block Seat</NavLink></li>
                <li><NavLink to="/vacate" className={({ isActive }) => isActive ? "active" : ""}>Vacate Seat</NavLink></li>
                <li><NavLink to="/allocation" className={({ isActive }) => isActive ? "active" : ""}>Weekly Allocation</NavLink></li>
                <li><NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""}>Admin Panel</NavLink></li>
            </ul>
        </nav>
    );
}
