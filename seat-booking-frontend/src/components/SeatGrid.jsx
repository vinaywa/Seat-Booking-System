/**
 * SeatGrid — renders all 50 seats colour-coded by their status.
 * Props:
 *   seats   — array of all seat objects { _id, seatNumber, type }
 *   booked  — array of booking objects  { seatId, status }
 *   alloc   — array of seat objects assigned to a squad (optional)
 */
export default function SeatGrid({ seats = [], booked = [], alloc = [] }) {
    const bookedMap = {};
    for (const b of booked) {
        const id = b.seatId?._id || b.seatId;
        if (id) bookedMap[id] = b.status;
    }
    const allocIds = new Set(alloc.map((s) => s._id || s));

    return (
        <div>
            <div className="legend">
                <span className="legend-item">
                    <span className="legend-dot" style={{ background: "rgba(52,211,153,0.5)" }} />
                    Available
                </span>
                <span className="legend-item">
                    <span className="legend-dot" style={{ background: "rgba(248,113,113,0.5)" }} />
                    Booked
                </span>
                <span className="legend-item">
                    <span className="legend-dot" style={{ background: "rgba(251,191,36,0.5)" }} />
                    Blocked
                </span>
                <span className="legend-item">
                    <span className="legend-dot" style={{ background: "rgba(79,142,247,0.5)" }} />
                    Floater
                </span>
            </div>

            <div className="seat-grid">
                {seats.map((seat) => {
                    const id = seat._id;
                    const status = bookedMap[id];
                    let cls = "seat-cell";

                    if (status === "BOOKED") cls += " booked";
                    else if (status === "BLOCKED") cls += " blocked";
                    else if (seat.type === "FLOATER") cls += " floater";
                    else cls += " available";

                    const inAlloc = allocIds.has(id);

                    return (
                        <div
                            key={id}
                            className={cls}
                            title={`${seat.seatNumber} — ${status || seat.type}${inAlloc ? " (allocated)" : ""}`}
                            style={inAlloc ? { outline: "2px solid rgba(79,142,247,0.8)" } : {}}
                        >
                            <span>{seat.seatNumber}</span>
                            {inAlloc && <span style={{ fontSize: "0.55rem", color: "inherit", opacity: 0.7 }}>★</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
