import { Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import HolidaysPage from './pages/HolidaysPage'
import LeavePage from './pages/LeavePage'
import AdminPage from './pages/AdminPage'

function PrivateRoute({ children }) {
    const token = localStorage.getItem('token')
    return token ? children : <Navigate to="/auth" replace />
}

function AdminRoute({ children }) {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const isAdmin = user.role === 'ADMIN'
    if (!token) return <Navigate to="/auth" replace />
    if (!isAdmin) return <Navigate to="/" replace />
    return children
}

function EmployeeRoute({ children }) {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const isAdmin = user.role === 'ADMIN'
    if (!token) return <Navigate to="/auth" replace />
    if (isAdmin) return <Navigate to="/schedule" replace />
    return children
}

export default function App() {
    return (
        <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <HomePage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/schedule"
                element={
                    <PrivateRoute>
                        <BookingPage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/holidays"
                element={
                    <PrivateRoute>
                        <HolidaysPage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/leave"
                element={
                    <EmployeeRoute>
                        <LeavePage />
                    </EmployeeRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminPage />
                    </AdminRoute>
                }
            />
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
