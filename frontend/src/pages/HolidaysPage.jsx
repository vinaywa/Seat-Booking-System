import Navbar from '../components/Navbar'
import HolidayManager from '../components/HolidayManager'

export default function HolidaysPage() {
    return (
        <>
            <Navbar />
            <div className="booking-page">
                <div className="page-header">
                    <div>
                        <h1>Office holidays</h1>
                        <p className="page-subtitle">
                            View all configured organisation holidays and, if you are an admin, add or remove dates.
                        </p>
                    </div>
                </div>

                <div style={{ maxWidth: '720px' }}>
                    <HolidayManager />
                </div>
            </div>
        </>
    )
}

