import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'

const todayStr = new Date().toISOString().split('T')[0]

export default function LeavePage() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(todayStr)
    const [submitting, setSubmitting] = useState(false)
    const [reason, setReason] = useState('')
    const [lastCancelled, setLastCancelled] = useState(null)
    const [msg, setMsg] = useState('')
    const [err, setErr] = useState('')

    useEffect(() => {
        const fetchMyBookings = async () => {
            setLoading(true)
            try {
                const { data } = await api.get('/my-bookings')
                setBookings(data)
            } catch {
                setBookings([])
            } finally {
                setLoading(false)
            }
        }
        fetchMyBookings()
    }, [])

    const normalize = (d) => (typeof d === 'string' ? d.split('T')[0] : d)
    const currentBooking = bookings.find((b) => normalize(b.date) === selectedDate)

    const handleLeave = async () => {
        if (!currentBooking) return
        if (!reason.trim()) {
            setErr('Please provide a reason for your leave.')
            return
        }
        setSubmitting(true)
        setMsg('')
        setErr('')
        try {
            await api.delete(`/bookings/${currentBooking._id}`)
            setMsg(`Leave applied for ${selectedDate}. Your seat has been released.`)
            setLastCancelled({ booking: currentBooking, date: selectedDate })
            setBookings((prev) => prev.filter((b) => b._id !== currentBooking._id))
        } catch (ex) {
            setErr(ex.response?.data?.message || 'Failed to apply leave.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelLeave = async () => {
        if (!lastCancelled) return
        const { booking, date } = lastCancelled
        setSubmitting(true)
        setMsg('')
        setErr('')
        try {
            await api.post('/bookings', { seatId: booking.seatId?._id || booking.seatId, date })
            setMsg(`Leave cancelled for ${date}. Your seat has been restored.`)
            setBookings((prev) => [...prev, booking])
            setLastCancelled(null)
        } catch (ex) {
            setErr(ex.response?.data?.message || 'Failed to cancel leave.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <Navbar />
            <div className="booking-page">
                <div className="page-header">
                    <div>
                        <h1>Apply for a leave day</h1>
                        <p className="page-subtitle">
                            Choose a date with an existing booking. We will cancel the booking so your seat becomes vacant.
                        </p>
                    </div>
                </div>

                <div className="leave-card">
                    <div className="form-group">
                        <label>Select date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value)
                                setMsg('')
                                setErr('')
                                setLastCancelled(null)
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Reason for leave</label>
                        <textarea
                            rows={3}
                            className="holiday-input"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value)
                                setErr('')
                            }}
                            placeholder="e.g. Personal work, sick leave…"
                        />
                    </div>

                    {loading ? (
                        <p className="mb-hint">Loading your bookings…</p>
                    ) : currentBooking ? (
                        <div className="leave-summary">
                            <p>
                                You have a booking on <strong>{currentBooking.date}</strong> for seat{' '}
                                <strong>#{currentBooking.seatId?.seatNumber}</strong>.
                            </p>
                        </div>
                    ) : (
                        <p className="mb-hint">
                            You do not have any booking on this date. Choose another date with an upcoming booking.
                        </p>
                    )}

                    <div className="leave-summary" style={{ marginTop: '0.75rem' }}>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleLeave}
                            disabled={submitting || loading}
                        >
                            {submitting ? 'Applying…' : 'Apply leave and release seat'}
                        </button>
                        <button
                            type="button"
                            className="btn-ghost"
                            onClick={handleCancelLeave}
                            disabled={submitting || !lastCancelled}
                        >
                            Cancel leave and restore seat
                        </button>
                    </div>

                    {msg && <p className="qb-success" style={{ marginTop: '0.75rem' }}>{msg}</p>}
                    {err && <p className="qb-err" style={{ marginTop: '0.75rem' }}>{err}</p>}
                </div>
            </div>
        </>
    )
}

