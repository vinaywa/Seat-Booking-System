import { useState, useEffect } from "react";
import { getSquads, bookSeat } from "../api/api";

const today = () => new Date().toISOString().split("T")[0];

export default function BookSeat() {
    const [squads, setSquads] = useState([]);
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState("");
    const [date, setDate] = useState(today());
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSquads().then((r) => {
            setSquads(r.data);
            const all = r.data.flatMap((sq) => sq.members.map((m) => ({ ...m, squadName: sq.name })));
            setUsers(all);
        });
    }, []);

    const handleBook = async () => {
        if (!userId || !date) return setMsg({ type: "error", text: "Please select a user and date" });
        setLoading(true);
        setMsg(null);
        try {
            const res = await bookSeat(userId, date);
            setMsg({ type: "success", text: `✅ Seat booked successfully! Booking ID: ${res.data._id}` });
        } catch (e) {
            setMsg({ type: "error", text: `❌ ${e.response?.data?.message || "Booking failed"}` });
        }
        setLoading(false);
    };

    const selectedUser = users.find((u) => u._id === userId);

    return (
        <div className="main-content">
            <h1 className="page-title">📅 Book a Seat</h1>
            <p className="page-subtitle">Book a seat for your scheduled working day</p>

            <div className="grid-2" style={{ alignItems: "start" }}>
                <div className="card">
                    <div className="card-header">Booking Form</div>

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
                        <label>Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={today()} />
                    </div>

                    <button className="btn btn-primary" onClick={handleBook} disabled={loading}>
                        {loading ? "Booking…" : "Book Seat"}
                    </button>
                </div>

                <div className="card">
                    <div className="card-header">ℹ️ Batch Schedule</div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16 }}>
                        Seats can only be booked on your designated batch days.
                    </p>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr><th>Batch</th><th>Odd Week</th><th>Even Week</th></tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span className="badge badge-blue">BATCH_1</span></td>
                                    <td>Monday – Friday</td>
                                    <td>Thursday – Friday</td>
                                </tr>
                                <tr>
                                    <td><span className="badge badge-green">BATCH_2</span></td>
                                    <td>Thursday – Friday</td>
                                    <td>Monday – Wednesday</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {selectedUser && (
                        <div className="alert alert-info" style={{ marginTop: 16, marginBottom: 0 }}>
                            <strong>{selectedUser.name}</strong> is in <strong>{selectedUser.squadName}</strong> — <strong>{selectedUser.batch}</strong>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
