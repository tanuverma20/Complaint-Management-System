import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    ClipboardList,
    Clock,
    CheckCircle
} from "lucide-react";


function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_users: 0,
        total: 0,
        pending: 0,
        in_progress: 0,
        resolved: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);

    const [recentComplaints, setRecentComplaints] = useState([]);
    const [recentLoading, setRecentLoading] = useState(true);

   useEffect(() => {
        fetch("http://localhost:5000/dashboard-stats")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch dashboard statistics");
                }

                return response.json();
            })
            .then((data) => {
                setStats(data);
                setStatsLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setStatsLoading(false);
            });
    }, []);

    useEffect(() => {
        fetch("http://localhost:5000/complaints")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch complaints");
                }

                return response.json();
            })
            .then((data) => {
                setRecentComplaints(data.slice(0, 5));
                setRecentLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setRecentLoading(false);
            });
    }, []);



    return (
        <div className="dashboard-page">

            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome to your complaint management system.</p>
                </div>
            </div>

            <div className="dashboard-cards">

                {/* Total Users */}
                <div className="dashboard-card">
                    <div className="card-icon users-icon">
                        <Users size={24} />
                    </div>

                    <div className="card-content">
                        <p>Total Users</p>
                        <h2>{statsLoading ? "..." : stats.total_users}</h2>
                    </div>
                </div>


                {/* Total Complaints */}
                <div className="dashboard-card">
                    <div className="card-icon complaints-icon">
                        <ClipboardList size={24} />
                    </div>

                    <div className="card-content">
                        <p>Total Complaints</p>
                        <h2>{statsLoading ? "..." : stats.total}</h2>
                    </div>
                </div>


                {/* Pending */}
                <div className="dashboard-card">
                    <div className="card-icon pending-icon">
                        <Clock size={24} />
                    </div>

                    <div className="card-content">
                        <p>Pending</p>
                        <h2>{statsLoading ? "..." : stats.pending}</h2>
                    </div>
                </div>


                {/* Resolved */}
                <div className="dashboard-card">
                    <div className="card-icon resolved-icon">
                        <CheckCircle size={24} />
                    </div>

                    <div className="card-content">
                        <p>Resolved</p>
                        <h2>{statsLoading ? "..." : stats.resolved}</h2>
                    </div>
                </div>

            </div>

            <div className="dashboard-section">

                <div className="section-header">
                    <div>
                        <h2>Recent Activity</h2>
                        <p>Latest activity in the system</p>
                    </div>
                    <button
                        className="view-all-complaints-btn"
                        onClick={() => navigate("/complaints")}
                    >
                        View All Complaints
                    </button>
                </div>

                {recentLoading ? (
                    <div className="empty-state">
                        <p>Loading recent complaints...</p>
                    </div>
                ) : recentComplaints.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            📋
                        </div>

                        <h3>No complaints yet</h3>

                        <p>
                            Complaint activity will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="recent-complaints-list">

                        {recentComplaints.map((complaint) => (
                            <div 
                                className="recent-complaint-item" 
                                key={complaint.id}
                                onClick={() => navigate(`/complaints/${complaint.id}`)}
                            >

                                <div className="recent-complaint-info">
                                    <h3>{complaint.subject}</h3>

                                    <p>
                                        {complaint.customer_name}
                                    </p>

                                    <span>
                                        {complaint.city}, {complaint.state}
                                    </span>
                                </div>

                                <div className="recent-complaint-status">
                                    <span className={`status-badge ${(
                                        complaint.status || "Pending"
                                    ).toLowerCase().replace(" ", "-")}`}>
                                        {complaint.status || "Pending"}
                                    </span>
                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Dashboard;