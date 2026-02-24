import { useState, useEffect } from "react";
import { getSquads, blockSeat } from "../api/api";

export default function BlockSeat() {
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState("");
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    const currentHour = new Date().getHours();
    const isAfter3PM = currentHour >= 15;

    useEffect(() => {
        getSquads().then((r) => {
            const all = r.data.flatMap((sq) => sq.members.map((m) => ({ ...m, squadName: sq.name })));
            setUsers(all);
        });
    }, []);

    const handleBlock = async () => {
        if (!userId) return setMsg({ type: "error", text: "Please select an employee" });
        setLoading(true);
        setMsg(null);
        try {
            const res = await blockSeat(userId);
            const d = res.data.date ? new Date(res.data.date).toLocaleDateString() : "next working day";
            setMsg({ type: "success", text: `✅ Seat blocked for ${d}. Booking ID: ${res.data._id}` });
        } catch (e) {
            setMsg({ type: "error", text: `❌ ${e.response?.data?.message || "Blocking failed"}` });
        }
        setLoading(false);
    };

    return (
        <div className="main-content">
            <h1 className="page-title">🔒 Block a Seat</h1>
            <p className="page-subtitle">Reserve your seat for the next designated working day (available after 3PM)</p>

            <div className="grid-2" style={{ alignItems: "start" }}>
                <div className="card">
                    <div className="card-header">Block Seat Form</div>

                    {!isAfter3PM && (
                        <div className="alert alert-error">
                            ⏰ Blocking is only allowed after <strong>3:00 PM</strong>. Current time: {new Date().toLocaleTimeString()}.
                        </div>
                    )}

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

                    <button
                        className="btn btn-amber"
                        onClick={handleBlock}
                        disabled={loading || !isAfter3PM}
                    >
                        {loading ? "Blocking…" : "Block Next Working Day"}
                    </button>
                </div>

                <div className="card">
                    <div className="card-header">📌 How Blocking Works</div>
                    <ul style={{ fontSize: "0.875rem", color: "var(--text-muted)", paddingLeft: 20, lineHeight: 2 }}>
                        <li>Blocking is only allowed <strong style={{ color: "var(--text-primary)" }}>after 3PM</strong> on a working day</li>
                        <li>A seat is automatically reserved for your <strong style={{ color: "var(--text-primary)" }}>next working day</strong></li>
                        <li>Weekends and holidays are automatically skipped</li>
                        <li>You must be scheduled for that batch day</li>
                        <li>You cannot block if you already have a booking</li>
                    </ul>

                    <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: 8, background: "var(--bg-card-2)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Current time:</span>{" "}
                        {new Date().toLocaleTimeString()}<br />
                        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Status:</span>{" "}
                        {isAfter3PM
                            ? <span style={{ color: "var(--accent-green)" }}>✅ Blocking enabled</span>
                            : <span style={{ color: "var(--accent-red)" }}>🔴 Not yet available</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
