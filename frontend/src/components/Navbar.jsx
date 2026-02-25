import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const isAdmin = user.role === 'ADMIN'

    const isActive = (path) => location.pathname === path

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/auth')
    }

    return (
        <nav className="navbar">
            <span className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                Seat Booking System
            </span>

            <div className="navbar-links">
                <button
                    type="button"
                    className={`navbar-link ${isActive('/schedule') ? 'navbar-link--active' : ''}`}
                    onClick={() => navigate('/schedule')}
                >
                    Schedule
                </button>
                <button
                    type="button"
                    className={`navbar-link ${isActive('/holidays') ? 'navbar-link--active' : ''}`}
                    onClick={() => navigate('/holidays')}
                >
                    Holidays
                </button>
                {isAdmin && (
                    <button
                        type="button"
                        className={`navbar-link ${isActive('/admin') ? 'navbar-link--active' : ''}`}
                        onClick={() => navigate('/admin')}
                    >
                        Admin
                    </button>
                )}
                {!isAdmin && (
                    <button
                        type="button"
                        className={`navbar-link ${isActive('/leave') ? 'navbar-link--active' : ''}`}
                        onClick={() => navigate('/leave')}
                    >
                        Leave day
                    </button>
                )}
            </div>

            <div className="navbar-right">
                <span className="navbar-info">
                    Logged in as <span>{user.name}</span> — Batch&nbsp;
                    <span className={`badge badge-${user.batch?.toLowerCase()}`}>{user.batch}</span>
                </span>
                <button className="btn-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    )
}
