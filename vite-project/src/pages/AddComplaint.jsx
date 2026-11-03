import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import {
//     getAllStates,
//     getDistrictsByState
// } from "india-states-districts";
import "../App.css";

function AddComplaint() {

    const navigate = useNavigate();

    const [customerName, setCustomerName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");

    const [state, setState] = useState("");
    const [states, setStates] = useState([]);

    const [district, setDistrict] = useState("");
    const [districts, setDistricts] = useState([]);
    const [city, setCity] = useState("");
    // const states = getAllStates();
    // const districts = state
    //     ? getDistrictsByState(state) || []
    //     : [];

    const [pincode, setPincode] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
  
    useEffect(() => {
        fetch("http://localhost:5000/locations/states")
            .then((response) => response.json())
            .then((data) => {
                setStates(data);
            })
            .catch((error) => {
                console.log("Error fetching states:", error);
            });
    }, []);

    useEffect(() => {
        if (!state) {
            setDistricts([]);
            return;
        }

        fetch(`http://localhost:5000/locations/districts/${state}`)
            .then((response) => response.json())
            .then((data) => {
                setDistricts(data);
            })
            .catch((error) => {
                console.log("Error fetching districts:", error);
            });
    }, [state]);

    function validateForm() {

        const errors = {};

        // Customer name
        if (!customerName.trim()) {
            errors.customerName = "Customer name is required";
        } else if (!/^[A-Za-z ]+$/.test(customerName.trim())) {
            errors.customerName =
                "Customer name can contain only letters";
        }


        // Mobile number
        if (!mobileNumber) {
            errors.mobileNumber =
                "Mobile number is required";
        } else if (!/^[0-9]{10}$/.test(mobileNumber)) {
            errors.mobileNumber =
                "Mobile number must contain exactly 10 digits";
        }


        // Email
        if (!customerEmail.trim()) {
            errors.customerEmail =
                "Email address is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                customerEmail.trim()
            )
        ) {
            errors.customerEmail =
                "Please enter a valid email address";
        }


        // State
        if (!state.trim()) {
            errors.state = "State is required";
        }


        // District
        if (!district.trim()) {
            errors.district = "District is required";
        }


        // City
        if (!city.trim()) {
            errors.city = "City is required";
        }


        // Pincode
        if (!pincode) {
            errors.pincode = "Pincode is required";
        } else if (!/^[0-9]{6}$/.test(pincode)) {
            errors.pincode =
                "Pincode must contain exactly 6 digits";
        }


        // Subject
        if (!subject.trim()) {
            errors.subject =
                "Complaint subject is required";
        }


        // Description
        if (!description.trim()) {
            errors.description =
                "Complaint description is required";
        }


        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    }

    async function handleSubmit(event) {

        event.preventDefault();

        setErrorMessage("");
        setFieldErrors({});

        if (!validateForm()) {
            return;
        }
        setLoading(true);

        const selectedState = states.find(
            (item) => item.id === Number(state)
        );

        const selectedDistrict = districts.find(
            (item) => item.id === Number(district)
        );

        const complaint = {
            customer_name: customerName,
            mobile_number: mobileNumber,
            customer_email: customerEmail,
            state: selectedState ? selectedState.name : "",
            district: selectedDistrict ? selectedDistrict.name : "",
            city: city,
            pincode: pincode,
            subject: subject,
            description: description
        };

        try {

            const response = await fetch(
                "http://localhost:5000/complaints",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(complaint)
                }
            );

            const data = await response.json();

            setLoading(false);

            if (response.ok) {

                navigate("/complaints");

            } else {

                setErrorMessage(
                    data.message || "Failed to add complaint"
                );
            }

        } catch (error) {

            setLoading(false);

            setErrorMessage(
                "Something went wrong. Please try again."
            );

            console.log(error);
        }
    }

    return (
    <div className="add-complaint-page">

        <div className="add-complaint-container">

            {/* Header */}
            <div className="add-complaint-header">

                <div className="complaint-header-icon">
                    📝
                </div>

                <div>
                    <h1>Add New Complaint</h1>

                    <p>
                        Enter the customer's complaint details below
                    </p>
                </div>

            </div>


            {/* Error message */}
            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                </div>
            )}


            <form onSubmit={handleSubmit}>

                {/* Customer Information */}
                <div className="form-section">

                    <h2>Customer Information</h2>

                    <div className="form-grid">

                        <div className="form-group">

                            <label>
                                Customer Name
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                placeholder="Enter customer name"
                                value={customerName}
                                onChange={(event) =>
                                    setCustomerName(event.target.value)
                                }
                                required
                            />
                            {fieldErrors.customerName && (
                                <p className="field-error">
                                    {fieldErrors.customerName}
                                </p>
                            )}
                        </div>

                        <div className="form-group">

                            <label>
                                Mobile Number
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength="10"
                                placeholder="Enter 10-digit mobile number"
                                value={mobileNumber}
                                onChange={(event) =>
                                    setMobileNumber(
                                        event.target.value.replace(/\D/g, "")
                                    )
                                }
                                required
                            />
                            {fieldErrors.mobileNumber && (
                                <p className="field-error">
                                    {fieldErrors.mobileNumber}
                                </p>
                            )}

                        </div>


                        <div className="form-group full-width">

                            <label>
                                Email Address
                                <span>*</span>
                            </label>

                            <input
                                type="email"
                                placeholder="Enter customer email"
                                value={customerEmail}
                                onChange={(event) =>
                                    setCustomerEmail(event.target.value)
                                }
                                required
                            />
                            {fieldErrors.customerEmail && (
                                <p className="field-error">
                                    {fieldErrors.customerEmail}
                                </p>
                            )}
                        </div>

                    </div>

                </div>


                {/* Address Information */}
                <div className="form-section">

                    <h2>Location Information</h2>

                    <div className="form-grid">

                        <div className="form-group">

                            <label>
                                State
                                <span>*</span>
                            </label>

                            <select
                                value={state}
                                onChange={(event) => {
                                    setState(event.target.value);
                                    setDistrict("");
                                }}
                                required
                            >
                                <option value="">Select state</option>

                                {states.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.state && (
                                <p className="field-error">
                                    {fieldErrors.state}
                                </p>
                            )}
                        </div>

                        <div className="form-group">

                            <label>
                                District
                                <span>*</span>
                            </label>

                            <select
                                value={district}
                                onChange={(event) => setDistrict(event.target.value)}
                                required
                                disabled={!state}
                            >
                                <option value="">Select district</option>

                                {districts.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.district && (
                                <p className="field-error">
                                    {fieldErrors.district}
                                </p>
                            )}
                        </div>


                        <div className="form-group">

                            <label>
                                City
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                placeholder="Enter city"
                                value={city}
                                onChange={(event) =>
                                    setCity(event.target.value)
                                }
                                required
                            />

                            {fieldErrors.city && (
                                <p className="field-error">
                                    {fieldErrors.city}
                                </p>
                            )}


                        </div>


                        <div className="form-group">

                            <label>
                                Pincode
                                <span>*</span>
                            </label>

                           <input
                                type="text"
                                inputMode="numeric"
                                maxLength="6"
                                placeholder="Enter pincode"
                                value={pincode}
                                onChange={(event) =>
                                    setPincode(
                                        event.target.value.replace(/\D/g, "")
                                    )
                                }
                                required
                            />
                            {fieldErrors.pincode && (
                                <p className="field-error">
                                    {fieldErrors.pincode}
                                </p>
                            )}
                        </div>

                    </div>

                </div>


                {/* Complaint Information */}
                <div className="form-section">

                    <h2>Complaint Information</h2>

                    <div className="form-group">

                        <label>
                            Complaint Subject
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            placeholder="Example: Product damaged"
                            value={subject}
                            onChange={(event) =>
                                setSubject(event.target.value)
                            }
                            required
                        />
                        {fieldErrors.subject && (
                            <p className="field-error">
                                {fieldErrors.subject}
                            </p>
                        )}
                    </div>


                    <div className="form-group">

                        <label>
                            Description
                            <span>*</span>
                        </label>

                        <textarea
                            placeholder="Describe the complaint in detail..."
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            required
                        />
                        {fieldErrors.description && (
                            <p className="field-error">
                                {fieldErrors.description}
                            </p>
                        )}
                    </div>

                </div>


                {/* Buttons */}
                <div className="form-actions">

                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() =>
                            navigate("/complaints")
                        }
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="submit-complaint-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Adding..."
                            : "Add Complaint"
                        }
                    </button>

                </div>

            </form>

        </div>

    </div>
 );
}

export default AddComplaint;