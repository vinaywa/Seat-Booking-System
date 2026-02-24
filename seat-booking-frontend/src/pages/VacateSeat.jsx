import { useState, useEffect } from "react";
import { getSquads, vacateSeat, getUserBookings } from "../api/api";

const today = () => new Date().toISOString().split("T")[0];

export default function VacateSeat() {
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState("");
    const [date, setDate] = useState(today());
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userBookings, setUserBookings] = useState([]);

    useEffect(() => {
        getSquads().then((r) => {
            const all = r.data.flatMap((sq) => sq.members.map((m) => ({ ...m, squadName: sq.name })));
            setUsers(all);
        });
    }, []);

    useEffect(() => {
        if (userId) {
            getUserBookings(userId).then((r) => {
                const active = r.data.filter((b) => ["BOOKED", "BLOCKED"].includes(b.status));
                setUserBookings(active);
            }).catch(() => setUserBookings([]));
        } else {
            setUserBookings([]);
        }
    }, [userId]);

    const handleVacate = async () => {
        if (!userId || !date) return setMsg({ type: "error", text: "Please select an employee and date" });
        setLoading(true);
        setMsg(null);
        try {
            await vacateSeat(userId, date);
            setMsg({ type: "success", text: `✅ Seat vacated for ${date}. The seat is now available for others.` });
            // Refresh bookings
            getUserBookings(userId).then((r) => setUserBookings(r.data.filter((b) => ["BOOKED", "BLOCKED"].includes(b.status))));
        } catch (e) {
            setMsg({ type: "error", text: `❌ ${e.response?.data?.message || "Vacating failed"}` });
        }
        setLoading(false);
    };

    return (
        <div className="main-content">
            <h1 className="page-title">🏖️ Vacate Seat</h1>
            <p className="page-subtitle">Mark yourself on leave and free up your booked seat</p>

            <div className="grid-2" style={{ alignItems: "start" }}>
                <div className="card">
                    <div className="card-header">Vacate Form</div>

                    {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

                    <div className="form-group">
                        <label>Select Employee</label>
                        <select value={userId} onChange={(e) => setUserId(e.target.value)}>
                            <option value="">-- Choose Employee --</option>
                            {users.map((u) => (
                                <option key={u._id} value={u._id}>
                                    {u.name} ({u.squadName} · {u.batch})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Date to Vacate</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>

                    <button className="btn btn-danger" onClick={handleVacate} disabled={loading}>
                        {loading ? "Vacating…" : "Vacate Seat"}
                    </button>
                </div>

                <div className="card">
                    <div className="card-header">📋 Active Bookings</div>
                    {!userId && (
                        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Select an employee to see their bookings.</p>
                    )}
                    {userId && userBookings.length === 0 && (
                        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>No active bookings found.</p>
                    )}
                    {userBookings.length > 0 && (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr><th>Date</th><th>Seat</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {userBookings.map((b) => (
                                        <tr
                                            key={b._id}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setDate(b.date?.split("T")[0] || "")}
                                        >
                                            <td>{b.date ? new Date(b.date).toLocaleDateString() : "—"}</td>
                                            <td>{b.seatId?.seatNumber || "—"}</td>
                                            <td>
                                                <span className={`badge ${b.status === "BOOKED" ? "badge-green" : "badge-amber"}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {userBookings.length > 0 && (
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 8 }}>
                            💡 Click a row to auto-fill the date above.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
