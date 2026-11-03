import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ComplaintDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [status, setStatus] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [activities, setActivities] = useState([]);


    useEffect(() => {

        fetch(`http://localhost:5000/complaints/${id}`)
            .then((response) => {

                if (!response.ok) {
                    throw new Error("Complaint not found");
                }

                return response.json();
            })
            .then((data) => {

                setComplaint(data);
                setStatus(data.status || "Pending");
                setLoading(false);

            })
            .catch((error) => {

                console.log(error);

                setErrorMessage(
                    "Unable to load complaint details."
                );

                setLoading(false);
            });

    }, [id]);
    

useEffect(() => {
    fetch(`http://localhost:5000/complaints/${id}/activity`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch activity history");
            }

            return response.json();
        })
        .then((data) => {
            setActivities(data);
        })
        .catch((error) => {
            console.error("Error fetching activity history:", error);
        });
}, [id]);


const updateStatus = () => {

    // Ask for confirmation only when resolving a complaint
    

if (status === "Resolved" || status === "Cancelled") {
    const confirmed = window.confirm(
        status === "Resolved"
            ? "Are you sure you want to resolve this complaint? You will not be able to change its status afterward."
            : "Are you sure you want to cancel this complaint?"
    );

    if (!confirmed) {
        return;
    }
}

    setUpdatingStatus(true);
    setStatusMessage("");

    fetch(`http://localhost:5000/complaints/${id}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: status
        })
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to update status");
            }

            return response.json();
        })
        .then((data) => {
            setComplaint((prevComplaint) => ({
                ...prevComplaint,
                status: status
            }));

            setStatusMessage(data.message);
            setUpdatingStatus(false);
        })
        .catch((error) => {
            console.log(error);
            setStatusMessage("Unable to update complaint status.");
            setUpdatingStatus(false);
        });
};


    if (loading) {

        return (
            <div className="page-content">
                <h1>Complaint Details</h1>
                <p>Loading...</p>
            </div>
        );
    }

    if (errorMessage) {

        return (
            <div className="page-content">

                <h1>Complaint Details</h1>

                <p className="error-message">
                    {errorMessage}
                </p>

                <button
                    onClick={() =>
                        navigate("/complaints")
                    }
                >
                    Back to Complaints
                </button>

            </div>
        );
    }

    return (
    <div className="page-content">

        {/* Header */}
       <div className="complaint-page-header">

    <button
        className="back-to-complaints-btn"
        onClick={() => navigate("/complaints")}
    >
        ← Back to Complaints
    </button>

    <div className="complaint-header-card">

        <div className="complaint-header-info">

            <p className="page-label">
                COMPLAINT DETAILS
            </p>

            <h1>
                Complaint #{complaint.id}
            </h1>

            <p className="complaint-created">
                Created on{" "}
                {complaint.created_at
                    ? new Date(
                        complaint.created_at
                    ).toLocaleString()
                    : "N/A"}
            </p>

        </div>

       
        <div
            className={`large-status-badge ${(complaint?.status || "Pending")
                .toLowerCase()
                .replace(" ", "-")}`}
        >
            <span className="status-dot"></span>
            {complaint?.status || "Pending"}
        </div>


    </div>

</div>


        {/* Main Content */}
        <div className="complaint-details-layout">

            {/* LEFT SIDE */}
            <div className="complaint-main-column">

                {/* Customer Information */}
                <div className="details-section">

                    <div className="section-heading">
                        <div className="section-icon">
                            👤
                        </div>

                        <div>
                            <h2>Customer Information</h2>
                            <p>Details of the customer who registered the complaint</p>
                        </div>
                    </div>


                    <div className="customer-info-grid">

                        <div className="info-box">

                            <span className="info-label">
                                Customer Name
                            </span>

                            <strong>
                                {complaint.customer_name}
                            </strong>

                        </div>


                        <div className="info-box">

                            <span className="info-label">
                                Mobile Number
                            </span>

                            <strong>
                                {complaint.mobile_number}
                            </strong>

                        </div>


                        <div className="info-box">

                            <span className="info-label">
                                Email Address
                            </span>

                            <strong>
                                {complaint.customer_email}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* Complaint Information */}
                <div className="details-section">

                    <div className="section-heading">

                        <div className="section-icon">
                            📋
                        </div>

                        <div>
                            <h2>Complaint Information</h2>
                            <p>Details provided by the customer</p>
                        </div>

                    </div>


                    <div className="complaint-subject">

                        <span className="info-label">
                            Subject
                        </span>

                        <h3>
                            {complaint.subject}
                        </h3>

                    </div>


                    <div className="description-box">

                        <span className="info-label">
                            Description
                        </span>

                        <p>
                            {complaint.description}
                        </p>

                    </div>

                </div>


                {/* Location */}
                <div className="details-section">

                    <div className="section-heading">

                        <div className="section-icon">
                            📍
                        </div>

                        <div>
                            <h2>Location</h2>
                            <p>Location associated with this complaint</p>
                        </div>

                    </div>


                    <div className="location-grid">

                        <div className="location-item">
                            <span>State</span>
                            <strong>{complaint.state}</strong>
                        </div>

                        <div className="location-item">
                            <span>District</span>
                            <strong>{complaint.district}</strong>
                        </div>

                        <div className="location-item">
                            <span>City</span>
                            <strong>{complaint.city}</strong>
                        </div>

                        <div className="location-item">
                            <span>Pincode</span>
                            <strong>{complaint.pincode}</strong>
                        </div>

                    </div>

                </div>

            </div>


            {/* RIGHT SIDE */}
            <div className="complaint-side-column">

                {/* Status Card */}
                <div className="status-management-card">

                    <div className="side-card-heading">

                        <div className="section-icon">
                            ⚙️
                        </div>

                        <div>
                            <h2>Manage Status</h2>
                            <p>Update complaint progress</p>
                        </div>

                    </div>

                    <div className="status-control">

                        <label>
                            Change Status
                        </label>

                        <select
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value)
                            }
                            className="complaint-status-select"
                            disabled={complaint?.status === "Resolved"||complaint?.status ==="Cancelled"}
                        >
                            <option value="Pending">
                                Pending
                            </option>

                            <option value="In Progress">
                                In Progress
                            </option>

                            <option value="Resolved">
                                Resolved
                            </option>

                             <option value="Cancelled">
                                Cancelled
                            </option>
                        </select>

                    </div>


                    <button
                        className="update-status-btn"
                        onClick={updateStatus}
                       disabled={updatingStatus || complaint?.status === "Resolved" 
                        || complaint?.status ==="Cancelled"}
                    >
                        {updatingStatus
                            ? "Updating..."
                            : "Update Status"}
                    </button>


                    {statusMessage && (
                        <p className="status-update-message">
                            {statusMessage}
                        </p>
                    )}

                </div>

             
            <div className="activity-history">
                <h3>Complaint Activity History</h3>

                {activities.length === 0 ? (
                    <p>No activity history available yet.</p>
                ) : (
                    <div className="activity-list">
                        {activities.map((activity, index) => (
                            <div className="activity-item" key={`${activity.activity_time}-${index}`}>
                                
                    <span
                        className={`status-dot ${activity.new_status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                    ></span>


                                <div className="activity-content">
                                    <p>
                                        Status changed from{" "}
                                        <strong>{activity.old_status}</strong>
                                        {" "}to{" "}
                                        <strong>{activity.new_status}</strong>
                                    </p>

                                    <small>
                                        {new Date(activity.activity_time).toLocaleString()}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


                {/* Complaint Summary */}
                <div className="summary-card">

                    <div className="side-card-heading">

                        <div className="section-icon">
                            ℹ️
                        </div>

                        <div>
                            <h2>Complaint Summary</h2>
                            <p>Quick information</p>
                        </div>

                    </div>

                    <div className="summary-item">

                        <span>
                            Customer
                        </span>

                        <strong>
                            {complaint.customer_name}
                        </strong>

                    </div>


                    <div className="summary-item">

                        <span>
                            Location
                        </span>

                        <strong>
                            {complaint.city}, {complaint.state}
                        </strong>

                    </div>


                    <div className="summary-item">

                        <span>
                            Created
                        </span>

                        <strong>
                            {complaint.created_at
                                ? new Date(
                                    complaint.created_at
                                ).toLocaleDateString()
                                : "N/A"}
                        </strong>

                    </div>

                </div>

            </div>

        </div>

    </div>
 );
}

export default ComplaintDetails;