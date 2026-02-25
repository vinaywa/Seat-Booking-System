import Navbar from '../components/Navbar'
import AdminPanel from '../components/AdminPanel'

export default function AdminPage() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    return (
        <>
            <Navbar />
            <div className="booking-page">
                <div className="page-header">
                    <div>
                        <h1>Admin dashboard</h1>
                        <p className="page-subtitle">Manage all bookings and seat availability.</p>
                    </div>
                    <div className="admin-user-pill">
                        <span className="pill-label">Signed in as</span>
                        <span className="pill-name">{user.name}</span>
                        <span className="pill-role">Admin</span>
                    </div>
                </div>

                <AdminPanel />
            </div>
        </>
    )
}

