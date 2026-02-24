import { useState, useEffect, useCallback } from "react";
import { getUtilization, getAvailableSeats, getBookingsByDate } from "../api/api";
import SeatGrid from "../components/SeatGrid";
import axios from "axios";

const today = () => new Date().toISOString().split("T")[0];

export default function Dashboard() {
    const [date, setDate] = useState(today());
    const [util, setUtil] = useState(null);
    const [allSeats, setAllSeats] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [uRes, sRes, bRes] = await Promise.all([
                getUtilization(date),
                getAvailableSeats(date),
                getBookingsByDate(date),
            ]);
            setUtil(uRes.data);
            // Merge available + booked into full seat list
            const bookedSeats = (bRes.data || []).map((b) => b.seatId).filter(Boolean);
            const allSeatMap = {};
            for (const s of [...(sRes.data.seats || []), ...bookedSeats]) {
                if (s && s._id) allSeatMap[s._id] = s;
            }
            setAllSeats(Object.values(allSeatMap));
            setBookings(bRes.data || []);
        } catch {/* ignore */ }
        setLoading(false);
    }, [date]);

    useEffect(() => { load(); }, [load]);

    const pct = util ? parseFloat(util.utilization) : 0;
    const valueClass = pct >= 80 ? "red" : pct >= 50 ? "amber" : "green";

    return (
        <div className="main-content">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                    <h1 className="page-title">📊 Dashboard</h1>
                    <p className="page-subtitle">Live seat utilization and availability overview</p>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Select Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
            </div>

            {loading && <div className="spinner" />}

            {util && (
                <>
                    <div className="stat-grid">
                        <div className="stat-card">
                            <div className="stat-label">Total Seats</div>
                            <div className="stat-value blue">{util.totalSeats}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Booked / Blocked</div>
                            <div className={`stat-value ${valueClass}`}>{util.totalBooked}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Available</div>
                            <div className="stat-value green">{util.totalSeats - util.totalBooked}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Utilization</div>
                            <div className={`stat-value ${valueClass}`}>{util.utilization}</div>
                            <div className="util-bar-bg">
                                <div className="util-bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">🪑 Seat Map — {date}</div>
                        <SeatGrid seats={allSeats} booked={bookings} />
                    </div>

                    {bookings.length > 0 && (
                        <div className="card" style={{ marginTop: 20 }}>
                            <div className="card-header">📋 Bookings for {date}</div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Batch</th>
                                            <th>Seat</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((b) => (
                                            <tr key={b._id}>
                                                <td>{b.userId?.name || "—"}</td>
                                                <td>{b.userId?.batch || "—"}</td>
                                                <td>{b.seatId?.seatNumber || "—"}</td>
                                                <td>{b.seatId?.type || "—"}</td>
                                                <td>
                                                    <span className={`badge ${b.status === "BOOKED" ? "badge-green" : b.status === "BLOCKED" ? "badge-amber" : "badge-red"}`}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
