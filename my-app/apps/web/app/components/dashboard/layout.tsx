import React from 'react'
import Sidebar from '../sidebar/sidebar'
import './layout.css'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="DashboardLayout">
            <div className="DashboardLayout-in">
                <div className="Dashboard-one">
                    <Sidebar />
                </div>
                <div className="Dashboard-two">
                    {children}
                </div>
            </div>
        </div>
    )
};

export default layout;