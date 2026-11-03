import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Complaints() {
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState("All");

    const complaintsPerPage = 5;

    useEffect(() => {
        fetch("http://localhost:5000/complaints")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch complaints");
                }

                return response.json();
            })
            .then((data) => {
                setComplaints(data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setErrorMessage("Unable to load complaints.");
                setLoading(false);
            });
    }, []);
    
        useEffect(() => {
            setCurrentPage(1);
        }, [searchTerm, activeTab]);

        const allCount = complaints.length;

        const pendingCount = complaints.filter(
            (complaint) => (complaint.status || "Pending") === "Pending"
        ).length;

        const inProgressCount = complaints.filter(
            (complaint) => (complaint.status || "Pending") === "In Progress"
        ).length;

        const resolvedCount = complaints.filter(
            (complaint) => (complaint.status || "Pending") === "Resolved"
        ).length;

         const cancelCount = complaints.filter(
            (complaint) => (complaint.status || "Pending") === "Cancelled"
        ).length;

        const filteredComplaints = complaints.filter((complaint) => {
            const search = searchTerm.toLowerCase();

            const matchesSearch =
                complaint.customer_name?.toLowerCase().includes(search) ||
                complaint.mobile_number?.includes(search) ||
                complaint.subject?.toLowerCase().includes(search) ||
                complaint.state?.toLowerCase().includes(search) ||
                complaint.district?.toLowerCase().includes(search) ||
                complaint.city?.toLowerCase().includes(search) ||
                complaint.pincode?.includes(search);

            const matchesTab =
                activeTab === "All" ||
                (complaint.status || "Pending").toLowerCase() ===
                activeTab.toLowerCase();

            return matchesSearch && matchesTab;
        });

        const totalPages = Math.ceil(
            filteredComplaints.length / complaintsPerPage
        );

        const startIndex = (currentPage - 1) * complaintsPerPage;

        const currentComplaints = filteredComplaints.slice(
            startIndex,
            startIndex + complaintsPerPage
        );

    if (loading) {
        return (
            <div className="page-content">
                <h1>Complaints</h1>
                <p>Loading complaints...</p>
            </div>
        );
    }

    return (
        <div className="page-content">

            {/* Page Header */}
            <div className="complaints-header">
                <div>
                    <h1>Complaints</h1>
                    <p>View and manage customer complaints</p>
                </div>

                <button
                    className="add-complaint-btn"
                    onClick={() => navigate("/add-complaint")}
                >
                    + Add Complaint
                </button>
            </div>

            <div className="complaints-toolbar">
                <input
                    type="text"
                    placeholder="Search by customer, mobile, subject or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="complaints-search"
                />
            </div>

           <div className="complaints-tabs">

                <button
                    className={activeTab === "All" ? "active" : ""}
                    onClick={() => setActiveTab("All")}
                >
                    All ({allCount})
                </button>

                <button
                    className={activeTab === "Pending" ? "active" : ""}
                    onClick={() => setActiveTab("Pending")}
                >
                    Pending ({pendingCount})
                </button>

                <button
                    className={activeTab === "In Progress" ? "active" : ""}
                    onClick={() => setActiveTab("In Progress")}
                >
                    In Progress ({inProgressCount})
                </button>

                <button
                    className={activeTab === "Resolved" ? "active" : ""}
                    onClick={() => setActiveTab("Resolved")}
                >
                    Resolved ({resolvedCount})
                </button>

                <button
                    className={activeTab === "Cancelled" ? "active" : ""}
                    onClick={() => setActiveTab("Cancelled")}
                >
                    Cancelled ({cancelCount})
                </button>

            </div>

            {/* Error message */}
            {errorMessage && (
                <p className="error-message">
                    {errorMessage}
                </p>
            )}

            {/* No complaints */}
            {complaints.length === 0 ? (
                <div className="empty-state">
                    <h3>No complaints found</h3>
                    <p>There are currently no complaints in the system.</p>
                </div>
            ) : (

                /* Complaints Table */
                <div className="complaints-table-container">

                    <table className="complaints-table">

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Subject</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {currentComplaints.map((complaint) => (

                                <tr key={complaint.id}>

                                    <td>
                                        #{complaint.id}
                                    </td>

                                    <td>
                                        <div className="customer-cell">
                                            <strong>
                                                {complaint.customer_name}
                                            </strong>

                                            <span>
                                                {complaint.mobile_number}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        {complaint.subject}
                                    </td>
                                    <td>
                                        <span className={`category-badge ${
                                            complaint.category
                                                ?.toLowerCase()
                                                .replace(/\s+/g, "-") || "uncategorized"
                                        }`}>
                                            {complaint.category || "Not Categorized"}
                                        </span>
                                    </td>
                                    <td>
                                        {complaint.city}, {complaint.state}
                                    </td>

                                    <td>
                                        <span
                                            className={`status-badge ${complaint.status
                                                ?.toLowerCase()
                                                .replace(/\s+/g, "-") || "pending"
                                                }`}
                                        >
                                            {complaint.status || "Pending"}
                                        </span>
                                    </td>

                                    <td>
                                        {complaint.created_at
                                            ? new Date(
                                                  complaint.created_at
                                              ).toLocaleDateString()
                                            : "N/A"}
                                    </td>

                                    <td>
                                        <button
                                            className="view-complaint-btn"
                                            onClick={() =>
                                                navigate(
                                                    `/complaints/${complaint.id}`
                                                )
                                            }
                                        >
                                            View
                                        </button>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}
            {totalPages > 1 && (
                <div className="complaints-pagination">

                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        ← Previous
                    </button>

                    <span>
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next →
                    </button>

                </div>
            )}
        </div>
    );
}

export default Complaints;