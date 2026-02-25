import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import SeatGrid from '../components/SeatGrid'
import MyBookings from '../components/MyBookings'
import OccupancyBar from '../components/OccupancyBar'
import QuickBookModal from '../components/QuickBookModal'
import api from '../services/api'

/** Get ISO week number */
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

function toDateStr(date) {
    return date.toISOString().split('T')[0]
}

function getMondayOfISOWeek(year, week) {
    const jan4 = new Date(Date.UTC(year, 0, 4))
    const jan4Day = jan4.getUTCDay() || 7
    const monday = new Date(jan4)
    monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (week - 1) * 7)
    return monday
}

function getWeekDates(year, week) {
    const monday = getMondayOfISOWeek(year, week)
    const dates = []
    for (let i = 0; i < 5; i++) {
        const d = new Date(monday)
        d.setUTCDate(monday.getUTCDate() + i)
        dates.push(toDateStr(d))
    }
    return dates
}

function toWeekParam(year, week) {
    return `${year}-${String(week).padStart(2, '0')}`
}

function isPast3PMIST() {
    const now = new Date()
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
    return istNow.getUTCHours() >= 15
}

export default function BookingPage() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const navigate = useNavigate()

    const today = new Date()
    const currentISOWeek = getISOWeek(today)
    const weekYear = (() => {
        const dec31 = new Date(Date.UTC(today.getUTCFullYear(), 11, 31))
        if (getISOWeek(dec31) === 1 && today.getUTCMonth() === 11) return today.getUTCFullYear() + 1
        const jan1 = new Date(Date.UTC(today.getUTCFullYear(), 0, 1))
        if (getISOWeek(jan1) > 50 && today.getUTCMonth() === 0) return today.getUTCFullYear() - 1
        return today.getUTCFullYear()
    })()

    const [viewYear, setViewYear] = useState(weekYear)
    const [viewWeek, setViewWeek] = useState(currentISOWeek)

    const [seats, setSeats] = useState([])
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionMsg, setActionMsg] = useState('')
    const [actionErr, setActionErr] = useState('')
    const [actionLoading, setActionLoading] = useState(false)
    const [showQuickBook, setShowQuickBook] = useState(false)

    const msgTimer = useRef(null)
    const errTimer = useRef(null)

    // 3 PM IST restriction disabled so seats can be booked anytime.
    const canBook = true
    const weekDates = getWeekDates(viewYear, viewWeek)
    const weekType = getWeekType(new Date(weekDates[0] + 'T00:00:00Z'))

    const showMsg = (msg) => {
        setActionMsg(msg)
        clearTimeout(msgTimer.current)
        msgTimer.current = setTimeout(() => setActionMsg(''), 4000)
    }

    const showErr = (msg) => {
        setActionErr(msg)
        clearTimeout(errTimer.current)
        errTimer.current = setTimeout(() => setActionErr(''), 5000)
    }

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const [seatsRes, bookingsRes] = await Promise.all([
                api.get('/seats'),
                api.get(`/bookings?week=${toWeekParam(viewYear, viewWeek)}`),
            ])
            setSeats(seatsRes.data)
            setBookings(bookingsRes.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load data.')
        } finally {
            setLoading(false)
        }
    }, [viewYear, viewWeek])

    useEffect(() => { fetchData() }, [fetchData])

    const handleBook = async (seatId, date) => {
        setActionLoading(true)
        try {
            await api.post('/bookings', { seatId, date })
            showMsg(`✅ Seat booked for ${date}!`)
            fetchData()
        } catch (err) {
            showErr(err.response?.data?.message || 'Booking failed.')
            throw err // re-throw for QuickBookModal
        } finally {
            setActionLoading(false)
        }
    }

    const handleRelease = async (bookingId) => {
        if (!window.confirm('Release this booking? This cannot be undone.')) return
        setActionLoading(true)
        try {
            await api.delete(`/bookings/${bookingId}`)
            showMsg('✅ Booking released.')
            fetchData()
        } catch (err) {
            showErr(err.response?.data?.message || 'Release failed.')
        } finally {
            setActionLoading(false)
        }
    }

    const prevWeek = () => {
        if (viewWeek === 1) { setViewYear((y) => y - 1); setViewWeek(52) }
        else setViewWeek((w) => w - 1)
    }
    const nextWeek = () => {
        if (viewWeek >= 52) { setViewYear((y) => y + 1); setViewWeek(1) }
        else setViewWeek((w) => w + 1)
    }

    return (
        <>
            <Navbar />
            <div className="booking-page">
                <div className="schedule-shell">
                    {/* Header */}
                    <div className="page-header">
                        <div>
                            <h1>Seat Schedule for the week</h1>
                            <p className="page-subtitle">See availability by day and manage your bookings.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {canBook && (
                                <button className="btn-quickbook" onClick={() => setShowQuickBook(true)}>
                                    ⚡ Quick Book
                                </button>
                            )}
                            <div className="week-nav">
                                <button className="btn-nav" onClick={prevWeek}>◀ Prev</button>
                                <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
                                    Week {viewWeek}, {viewYear}
                                </span>
                                <button className="btn-nav" onClick={nextWeek}>Next ▶</button>
                            </div>
                        </div>
                    </div>

                    {/* Batch / Week / Designated row */}
                    <div className="week-chips-row">
                        <div className="week-chip">
                            <span className="week-chip-label">Batch</span>
                            <span className={`week-chip-value badge badge-${user.batch?.toLowerCase()}`}>{user.batch}</span>
                        </div>
                        <div className="week-chip">
                            <span className="week-chip-label">Week</span>
                            <span className={`week-chip-value badge badge-${weekType === 'WEEK_1' ? 'week1' : 'week2'}`}>{weekType}</span>
                        </div>
                        <div className="week-chip">
                            <span className="week-chip-label">Designated</span>
                            <span className="week-chip-value">
                                {user.batch === 'A'
                                    ? weekType === 'WEEK_1' ? 'Mon–Wed' : 'Thu–Fri'
                                    : weekType === 'WEEK_1' ? 'Thu–Fri' : 'Mon–Wed'}
                            </span>
                        </div>
                        <div className="week-chip week-chip-range">
                            <span className="week-chip-label">Range</span>
                            <span className="week-chip-value">
                                {weekDates[0]} → {weekDates[4]}
                            </span>
                        </div>
                    </div>

                    {/* My Bookings */}
                    <div className="panels-row">
                        <MyBookings onRelease={fetchData} />
                    </div>

                    {/* Action loading bar */}
                    {actionLoading && (
                        <div className="action-loading-bar">
                            <div className="action-loading-fill" />
                        </div>
                    )}

                    {/* Toasts */}
                    {actionMsg && <div className="toast toast-success">{actionMsg}</div>}
                    {actionErr && <div className="toast toast-error">{actionErr}</div>}
                    {error && <div className="error-msg">{error}</div>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div className="legend">
                            <div className="legend-item"><div className="legend-dot dot-available" /><span>Designated (Available)</span></div>
                            <div className="legend-item"><div className="legend-dot dot-floater" /><span>Floater (Available)</span></div>
                            <div className="legend-item"><div className="legend-dot dot-mine" /><span>Your Booking</span></div>
                            <div className="legend-item"><div className="legend-dot dot-taken" /><span>Taken</span></div>
                            <div className="legend-item"><div className="legend-dot dot-blocked" /><span>Blocked / Maintenance</span></div>
                        </div>
                        <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => navigate('/holidays')}
                        >
                            🗓️ Open holidays page
                        </button>
                    </div>

                    {/* Seat Grid */}
                    {loading ? (
                        <div className="loading">Loading seats…</div>
                    ) : (
                        <SeatGrid
                            seats={seats}
                            bookings={bookings}
                            weekDates={weekDates}
                            user={user}
                            onBook={handleBook}
                            onRelease={handleRelease}
                            canBook={canBook}
                            actionLoading={actionLoading}
                        />
                    )}

                    <p className="info-note" style={{ marginTop: '0.75rem' }}>
                        D = Designated (1–40) · F = Floater (41–50) · Hover seats for details
                    </p>

                    {/* Occupancy bar at the end, vertical style */}
                    {!loading && (
                        <div style={{ marginTop: '1.25rem' }}>
                            <OccupancyBar weekDates={weekDates} bookings={bookings} totalSeats={50} />
                        </div>
                    )}
                </div>

                {/* Quick Book Modal */}
                {showQuickBook && (
                    <QuickBookModal
                        seats={seats}
                        bookings={bookings}
                        user={user}
                        onBook={handleBook}
                        onClose={() => { setShowQuickBook(false); fetchData() }}
                    />
                )}
            </div>
        </>
    )
}
