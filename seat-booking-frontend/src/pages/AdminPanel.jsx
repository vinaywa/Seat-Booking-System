import { useState, useEffect } from "react";
import { getHolidays, addHoliday, deleteHoliday, triggerAllocation } from "../api/api";

const today = () => new Date().toISOString().split("T")[0];

export default function AdminPanel() {
    const [holidays, setHolidays] = useState([]);
    const [hDate, setHDate] = useState("");
    const [hDesc, setHDesc] = useState("");
    const [msg, setMsg] = useState(null);
    const [allocMsg, setAllocMsg] = useState(null);
    const [allocDate, setAllocDate] = useState(today());

    const loadHolidays = () =>
        getHolidays().then((r) => setHolidays(r.data));

    useEffect(() => { loadHolidays(); }, []);

    const handleAddHoliday = async () => {
        if (!hDate) return setMsg({ type: "error", text: "Date is required" });
        try {
            await addHoliday(hDate, hDesc);
            setMsg({ type: "success", text: `✅ Holiday added for ${hDate}` });
            setHDate(""); setHDesc("");
            loadHolidays();
        } catch (e) {
            setMsg({ type: "error", text: `❌ ${e.response?.data?.message || "Failed to add holiday"}` });
        }
    };

    const handleDeleteHoliday = async (id) => {
        try {
            await deleteHoliday(id);
            loadHolidays();
        } catch {/* ignore */ }
    };

    const handleAllocate = async () => {
        setAllocMsg(null);
        try {
            const res = await triggerAllocation(allocDate);
            setAllocMsg({ type: "success", text: `✅ Allocation done for week containing ${allocDate}. ${res.data.results?.length || 0} squads assigned.` });
        } catch (e) {
            setAllocMsg({ type: "error", text: `❌ ${e.response?.data?.message || "Allocation failed"}` });
        }
    };

    return (
        <div className="main-content">
            <h1 className="page-title">⚙️ Admin Panel</h1>
            <p className="page-subtitle">Manage holidays and trigger weekly seat allocations</p>

            <div className="grid-2" style={{ alignItems: "start", marginBottom: 24 }}>
                {/* Holiday Form */}
                <div className="card">
                    <div className="card-header">🗓️ Add Holiday</div>
                    {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

                    <div className="form-group">
                        <label>Holiday Date</label>
                        <input type="date" value={hDate} onChange={(e) => setHDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Description (optional)</label>
                        <input
                            type="text"
                            value={hDesc}
                            onChange={(e) => setHDesc(e.target.value)}
                            placeholder="e.g. Republic Day"
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleAddHoliday}>Add Holiday</button>
                </div>

                {/* Weekly Allocation */}
                <div className="card">
                    <div className="card-header">⚡ Weekly Seat Allocation</div>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 16 }}>
                        Assign seats to all squads for the week containing the selected date. Re-running overwrites existing allocations.
                    </p>
                    {allocMsg && <div className={`alert alert-${allocMsg.type}`}>{allocMsg.text}</div>}
                    <div className="form-group">
                        <label>Week containing</label>
                        <input type="date" value={allocDate} onChange={(e) => setAllocDate(e.target.value)} />
                    </div>
                    <button className="btn btn-success" onClick={handleAllocate}>
                        ⚡ Run Allocation
                    </button>
                </div>
            </div>

            {/* Holidays list */}
            <div className="card">
                <div className="card-header">📋 Holidays List ({holidays.length})</div>
                {holidays.length === 0 ? (
                    <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>No holidays configured.</p>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr><th>Date</th><th>Day</th><th>Description</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {holidays.map((h) => {
                                    const d = new Date(h.date);
                                    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                                    return (
                                        <tr key={h._id}>
                                            <td>{d.toLocaleDateString()}</td>
                                            <td><span className="badge badge-amber">{days[d.getDay()]}</span></td>
                                            <td>{h.description || <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                                            <td>
                                                <button className="btn btn-danger" style={{ padding: "4px 12px", fontSize: "0.75rem" }}
                                                    onClick={() => handleDeleteHoliday(h._id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
