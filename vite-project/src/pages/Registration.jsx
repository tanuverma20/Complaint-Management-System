import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Registration(){

    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [number, setNumber] = useState("");
   
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    function validateForm() {

        let newErrors = {};

        // Name Validation
        if (name.trim() === "") {
            newErrors.name = "Name is required";
        }
        else if (!/^[A-Za-z ]+$/.test(name)) {
            newErrors.name = "Only letters are allowed";
        }
        else if (name.trim().length < 3) {
            newErrors.name = "Name must be at least 3 characters";
        }

        // Email Validation
        if (email.trim() === "") {
            newErrors.email = "Email is required";
        }
        else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Enter a valid email";
        }

        // Mobile Number Validation
        if (number.trim() === "") {
            newErrors.number = "Mobile number is required";
        }
        else if (!/^\d{10}$/.test(number)) {
            newErrors.number = "Mobile number must contain exactly 10 digits";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }
     
    async function handleSubmit(event){

        event.preventDefault();
        if (!validateForm()) {
        return;
       }
        setSuccessMessage("");
        setErrorMessage("");
        setLoading(true);

        const user = {
            name,
            email,
            number
        };

        try{

            const response = await fetch("http://localhost:5000/register",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(user)
            });

            const data = await response.json();
            setLoading(false);

                if (response.ok) {

                    setSuccessMessage(data.message);

                    setName("");
                    setEmail("");
                    setNumber("");
                    setErrors({});

                    setTimeout(() => {
                        navigate("/users");
                    }, 1000);

                }
                else {
                    setErrorMessage(data.message || "Registration failed");
                }
        }
        catch(error){
            setLoading(false);
            setErrorMessage("Something went wrong. Please try again.");
            console.log(error);

        }
    }
    return (
     <div className="registration-page">

        <div className="container">

            <h1>Registration Form</h1>

            {successMessage && (
                <p className="success-message">
                    {successMessage}
                </p>
            )}

            {errorMessage && (
                <p className="error-message">
                    {errorMessage}
                </p>
            )}

            <form onSubmit={handleSubmit}>

                <div className="input-group">
                    <label>Name</label>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />

                    {errors.name && (
                        <p className="error">{errors.name}</p>
                    )}
                </div>


                <div className="input-group">
                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />

                    {errors.email && (
                        <p className="error">{errors.email}</p>
                    )}
                </div>


                <div className="input-group">
                    <label>Mobile Number</label>

                    <input
                        type="text"
                        placeholder="Enter your number"
                        value={number}
                        onChange={(event) => setNumber(event.target.value)}
                    />

                    {errors.number && (
                        <p className="error">{errors.number}</p>
                    )}
                </div>


                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>

            </form>

        </div>

    </div>
   );
 }


export default Registration;