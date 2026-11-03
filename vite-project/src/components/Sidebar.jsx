import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">

            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">C</div>
                <span>Complaint System</span>
            </div>

            {/* Main Section */}
            <div className="sidebar-section">
                <p className="section-title">MAIN</p>

                <NavLink to="/dashboard" className="sidebar-link">
                    <span className="sidebar-icon">⌂</span>
                    <span>Dashboard</span>
                </NavLink>
            </div>

            {/* Management Section */}
            <div className="sidebar-section">
                <p className="section-title">MANAGEMENT</p>

                <NavLink to="/users" className="sidebar-link">
                    <span className="sidebar-icon">♙</span>
                    <span>Users</span>
                </NavLink>

                <NavLink to="/complaints" className="sidebar-link">
                    <span className="sidebar-icon">☷</span>
                    <span>Complaints</span>
                </NavLink>
                <NavLink to="/add-complaint" className="sidebar-link">
                    <span className="sidebar-icon">＋</span>
                    <span>Add Complaint</span>
                </NavLink>
                <NavLink to="/register" className="sidebar-link">
                    <span className="sidebar-icon">＋</span>
                    <span>Add User</span>
                </NavLink>
                
                <NavLink to="/ai-assistant" className="sidebar-link">
                    <span>🤖</span>
                    <span>AI Assistant</span>
                </NavLink>

            </div>

            {/* Bottom User */}
            <div className="sidebar-user">

                <div className="user-avatar">
                    T
                </div>

                <div className="user-info">
                    <strong>Admin</strong>
                    <span>Administrator</span>
                </div>

            </div>

        </aside>
    );
}

export default Sidebar;