import { useState, useEffect, useCallback } from "react";
import { getAllocations, getSquads, triggerAllocation } from "../api/api";

const today = () => new Date().toISOString().split("T")[0];

export default function WeeklyAllocation() {
    const [allocations, setAllocations] = useState([]);
    const [squads, setSquads] = useState([]);
    const [date, setDate] = useState(today());
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [aRes, sRes] = await Promise.all([getAllocations(date), getSquads()]);
            setAllocations(aRes.data.allocations || []);
            setSquads(sRes.data);
        } catch { /* ignore */ }
        setLoading(false);
    }, [date]);

    useEffect(() => { load(); }, [load]);

    const handleAllocate = async () => {
        setMsg(null);
        try {
            await triggerAllocation(date);
            setMsg({ type: "success", text: "✅ Seats allocated successfully!" });
            load();
        } catch (e) {
            setMsg({ type: "error", text: `❌ ${e.response?.data?.message || "Allocation failed"}` });
        }
    };

    const weekNum = allocations[0] ? "this" : "this";

    return (
        <div className="main-content">
            <h1 className="page-title">📆 Weekly Seat Allocation</h1>
            <p className="page-subtitle">View and manage seat assignments per squad for the week</p>

            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 24 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Week containing date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={handleAllocate}>
                    ⚡ Trigger Allocation
                </button>
            </div>

            {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

            {loading && <div className="spinner" />}

            {!loading && allocations.length === 0 && (
                <div className="card" style={{ textAlign: "center", padding: 48 }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>📭</div>
                    <p style={{ color: "var(--text-muted)" }}>No allocations found for this week.</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                        Click <strong style={{ color: "var(--accent)" }}>⚡ Trigger Allocation</strong> to auto-assign seats.
                    </p>
                </div>
            )}

            {allocations.length > 0 && (
                <div className="card">
                    <div className="card-header">🏢 Squad Seat Assignments</div>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Squad</th>
                                    <th>Batch</th>
                                    <th>Assigned Seats</th>
                                    <th>Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allocations.map((a) => (
                                    <tr key={a._id}>
                                        <td><strong>{a.squadId?.name || "—"}</strong></td>
                                        <td>
                                            <span className={`badge ${a.squadId?.batch === "BATCH_1" ? "badge-blue" : "badge-green"}`}>
                                                {a.squadId?.batch || "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                                {(a.seatIds || []).map((s) => (
                                                    <span key={s._id} className="badge badge-amber">
                                                        {s.seatNumber}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>{a.seatIds?.length || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="card" style={{ marginTop: 20 }}>
                <div className="card-header">👥 All Squads</div>
                <div className="grid-3">
                    {squads.map((sq) => (
                        <div key={sq._id} style={{ padding: "14px 16px", borderRadius: 10, background: "var(--bg-card-2)", border: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <strong>{sq.name}</strong>
                                <span className={`badge ${sq.batch === "BATCH_1" ? "badge-blue" : "badge-green"}`}>
                                    {sq.batch}
                                </span>
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                {sq.members?.length || 0} members
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>
                                {sq.members?.slice(0, 4).map((m) => m.name).join(", ")}
                                {sq.members?.length > 4 && ` +${sq.members.length - 4} more`}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
