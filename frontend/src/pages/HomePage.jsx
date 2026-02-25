import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const isAdmin = user.role === 'ADMIN'

    return (
        <>
            <Navbar />
            <div className="booking-page home-page">
                <div className="page-header">
                    <div>
                        <h1>Smart Seat Booking</h1>
                        <p className="page-subtitle">
                            Plan your hybrid work week with batch-based, fair seat rotation.
                        </p>
                    </div>
                </div>

                <div className="home-layout">
                    <section className="home-hero-card">
                        <h2>Your workspace, organised</h2>
                        <p>
                            See who is in the office, reserve your seat for the right days, and keep a clear view of your
                            weekly schedule.
                        </p>
                        <div className="home-cta-row">
                            <button className="btn-primary" onClick={() => navigate('/schedule')}>
                                Go to booking page
                            </button>
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => navigate('/schedule')}
                            >
                                View my weekly bookings
                            </button>
                            {isAdmin && (
                                <button
                                    type="button"
                                    className="btn-ghost btn-ghost--admin"
                                    onClick={() => navigate('/admin')}
                                >
                                    Go to admin dashboard
                                </button>
                            )}
                        </div>
                    </section>

                    <section className="home-highlight-grid">
                        <div className="home-highlight-card">
                            <h3>Batch-aware logic</h3>
                            <p>Automatically respects A/B batches and alternating weeks so the office never overfills.</p>
                        </div>
                        <div className="home-highlight-card">
                            <h3>Visual seat grid</h3>
                            <p>Colour-coded schedule for your designated days, floaters, and your own bookings.</p>
                        </div>
                        <div className="home-highlight-card">
                            <h3>Smart admin tools</h3>
                            <p>Force release bookings, disable seats for maintenance and manage holidays in one place.</p>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}

