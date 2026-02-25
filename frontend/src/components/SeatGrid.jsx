import { useMemo } from 'react'

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

/** Get ISO week number for a Date */
function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

function getWeekType(date) {
    return getISOWeek(date) % 2 !== 0 ? 'WEEK_1' : 'WEEK_2'
}

/** Days batch is DESIGNATED for */
function batchDesignatedDays(batch, weekType) {
    if (batch === 'A') return weekType === 'WEEK_1' ? [1, 2, 3] : [4, 5]
    return weekType === 'WEEK_1' ? [4, 5] : [1, 2, 3]
}

/** Parse YYYY-MM-DD → UTC midnight Date */
function parseDate(str) {
    const [y, m, d] = str.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d))
}

/** Normalize an id value to string for reliable comparison */
function strId(val) {
    if (!val) return ''
    if (typeof val === 'object' && val._id) return String(val._id)
    return String(val)
}

export default function SeatGrid({ seats, bookings, weekDates, user, onBook, onRelease, canBook, actionLoading }) {
    const weekType = weekDates.length ? getWeekType(parseDate(weekDates[0])) : 'WEEK_1'
    const designatedDays = batchDesignatedDays(user.batch, weekType)

    // Normalize the current user's id — server may return _id or id
    const myId = strId(user._id || user.id)

    /** Build a lookup: `${seatId}_${date}` → booking */
    const bookingMap = useMemo(() => {
        const map = {}
        bookings.forEach((b) => {
            const sid = strId(b.seatId?._id || b.seatId)
            map[`${sid}_${b.date}`] = b
        })
        return map
    }, [bookings])

    function getCellInfo(seat, dateStr) {
        const dateObj = parseDate(dateStr)
        const dow = dateObj.getUTCDay() // 0=Sun…6=Sat
        const booking = bookingMap[`${strId(seat._id)}_${dateStr}`]

        // Seat disabled by admin (maintenance)
        if (seat.isActive === false) {
            return { cls: 'seat-blocked', label: '🔧', tooltip: 'Seat unavailable (maintenance)', clickable: false }
        }

        // Already booked by this user
        if (booking && strId(booking.userId?._id || booking.userId) === myId) {
            return {
                cls: 'seat-mine',
                label: '✓',
                tooltip: 'Your booking — click to release',
                clickable: !actionLoading,
                action: 'release',
                bookingId: booking._id,
            }
        }
        // Booked by someone else
        if (booking) {
            const bookedBy = booking.userId?.name || 'Someone'
            return { cls: 'seat-taken', label: '✗', tooltip: `Booked by ${bookedBy}`, clickable: false }
        }
        // Weekend
        if (dow === 0 || dow === 6) {
            return { cls: 'seat-blocked', label: '–', tooltip: 'Weekend — no booking', clickable: false }
        }

        const isDesignatedDay = designatedDays.includes(dow)

        if (seat.type === 'designated') {
            if (!isDesignatedDay) {
                return { cls: 'seat-blocked', label: '–', tooltip: `Batch ${user.batch} designated seats not available today`, clickable: false }
            }
            return {
                cls: 'seat-available',
                label: '○',
                tooltip: canBook ? 'Click to book' : 'Booking opens after 3 PM IST',
                clickable: !actionLoading,
                action: 'book',
            }
        }

        // Floater seat — available on NON-designated days only
        if (isDesignatedDay) {
            return { cls: 'seat-blocked', label: '–', tooltip: 'Floater seats not available on your designated days', clickable: false }
        }
        return {
            cls: 'seat-floater',
            label: '◈',
            tooltip: canBook ? 'Floater seat — click to book' : 'Booking opens after 3 PM IST',
            clickable: !actionLoading,
            action: 'book',
        }
    }

    if (!seats.length) return <div className="loading">Loading seats…</div>

    return (
        <div className={`seat-layout ${actionLoading ? 'grid-busy' : ''}`}>
            <div className="timeline-layout">
                <div className="timeline-left">
                    {seats.map((seat) => (
                        <div key={seat._id} className="timeline-seat-label">
                            #{seat.seatNumber}
                        </div>
                    ))}
                </div>
                <div className="timeline-right">
                    <div className="timeline-header">
                        {weekDates.map((dateStr, index) => (
                            <div key={dateStr} className="timeline-day-label">
                                {DAY_LABELS[index]}
                            </div>
                        ))}
                    </div>
                    {seats.map((seat) => (
                        <div key={seat._id} className="timeline-row">
                            {weekDates.map((dateStr) => {
                                const info = getCellInfo(seat, dateStr)
                                let statusText = ''
                                if (info.cls === 'seat-available') {
                                    statusText = seat.type === 'floater' ? 'Floater' : 'Designated'
                                } else if (info.cls === 'seat-mine') {
                                    statusText = 'Your booking'
                                } else if (info.cls === 'seat-taken') {
                                    statusText = 'Taken'
                                } else if (info.cls === 'seat-blocked') {
                                    statusText = 'Blocked'
                                }
                                const handleClick = () => {
                                    if (!info.clickable) return
                                    if (info.action === 'book') onBook(seat._id, dateStr)
                                    if (info.action === 'release') onRelease(info.bookingId)
                                }
                                return (
                                    <div key={dateStr} className="timeline-slot">
                                        <div
                                            className={`timeline-bar ${info.cls} ${info.clickable ? 'clickable' : ''}`}
                                            data-tooltip={info.tooltip}
                                            title={info.tooltip}
                                            onClick={handleClick}
                                        >
                                            <div className="timeline-seat-main">
                                                <span className="timeline-seat-number">#{seat.seatNumber}</span>
                                                {statusText && (
                                                    <span className="timeline-seat-status">{statusText}</span>
                                                )}
                                            </div>
                                            {seat.type === 'floater' && (
                                                <span className="timeline-floater-badge">F</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
