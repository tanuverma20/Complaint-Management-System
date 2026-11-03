import { Fragment, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Users() {

    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        number: ""
    });
    const [editErrors, setEditErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const successTimeoutRef = useRef(null);
    const usersPerPage = 5;

    const filteredUsers = users.filter((user) => {
        const searchValue = searchTerm.toLowerCase();

        return [user.name, user.email, user.number]
            .some((value) => String(value).toLowerCase().includes(searchValue));
    });
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
    const visiblePage = Math.min(currentPage, totalPages);
    const paginatedUsers = filteredUsers.slice(
        (visiblePage - 1) * usersPerPage,
        visiblePage * usersPerPage
    );

    function showSuccess(id, message, onDismiss) {

        if (successTimeoutRef.current) {
            clearTimeout(successTimeoutRef.current);
        }

        setSuccessMessage({ id, message });

        successTimeoutRef.current = setTimeout(() => {
            setSuccessMessage(null);
            successTimeoutRef.current = null;
            onDismiss?.();
        }, 3000);
    }

    async function fetchUsers() {

        try {

            const response = await fetch("http://localhost:5000/users");
            const data = await response.json();

            setUsers(data);

        } catch (error) {

            console.log(error);

        }
    }
    
    function startEditing(user) {

        setEditingId(user.id);

        setEditForm({
            name: user.name,
            email: user.email,
            number: user.number
        });

        setEditErrors({});
     }

    function handleEditChange(event) {

    const { name, value } = event.target;

        setEditForm({
            ...editForm,
            [name]: value
        });
    }

    function handleSearchChange(event) {

        setSearchTerm(event.target.value);
        setCurrentPage(1);
    }
 
    function validateEditForm() {

        let newErrors = {};

        // Name validation
        if (editForm.name.trim() === "") {
            newErrors.name = "Name is required";
        }
        else if (!/^[A-Za-z ]+$/.test(editForm.name)) {
            newErrors.name = "Only letters are allowed";
        }
        else if (editForm.name.trim().length < 3) {
            newErrors.name = "Name must be at least 3 characters";
        }

        // Email validation
        if (editForm.email.trim() === "") {
            newErrors.email = "Email is required";
        }
        else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
            newErrors.email = "Enter a valid email";
        }

        // Mobile validation
        if (editForm.number.trim() === "") {
            newErrors.number = "Mobile number is required";
        }
        else if (!/^\d{10}$/.test(editForm.number)) {
            newErrors.number =
                "Mobile number must contain exactly 10 digits";
        }

        setEditErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }
    
    async function saveUser() {

        if (!validateEditForm()) {
        return;
        }

    try {

        const response = await fetch(
            `http://localhost:5000/users/${editingId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(editForm)
            }
        );

        const data = await response.json();

        if (response.ok) {

            setEditingId(null);
            setEditErrors({});

            showSuccess(editingId, data.message || "User updated successfully.");
            fetchUsers();

        }
        else {

            if (data.message === "Email is already registered") {

                setEditErrors(prev => ({
                    ...prev,
                    email: data.message
                }));

            }
            else if (data.message === "Mobile number is already registered") {

                setEditErrors(prev => ({
                    ...prev,
                    number: data.message
                }));

            }
            else {

                alert(data.message);

            }

        }

    } catch (error) {

        console.log(error);

        alert("Something went wrong while updating the user.");

    }
}
    function cancelEditing() {

        setEditingId(null);
        setEditErrors({});

    }

    useEffect(() => {
        fetchUsers();
    }, []);
    
        async function deleteUser(id) {

            const confirmed = window.confirm(
                "Are you sure you want to delete this user?"
            );

            if (!confirmed) {
                return;
            }

            try {

                const response = await fetch(
                    `http://localhost:5000/users/${id}`,
                    {
                        method: "DELETE"
                    }
                );

                const data = await response.json();

                if (response.ok) {

                    showSuccess(
                        id,
                        data.message || "User deleted successfully.",
                        fetchUsers
                    );

                }
                else {

                    alert(data.message);

                }

                } catch (error) {

                    console.log(error);

                    alert("Something went wrong while deleting the user.");

                }
            }   
 return (
        <div className="users-page">

            <div className="users-container">

                <div className="users-header">

                    <div>
                        <h1>Registered Users</h1>
                        <p>View all registered users</p>
                    </div>

                    <button
                        className="add-user-button"
                        onClick={() => navigate("/")}
                    >
                        Add User
                    </button>
                </div>
                <div className="users-toolbar">
                    <input
                        className="users-search"
                        type="search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search by name, email, or mobile"
                        aria-label="Search users"
                    />
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Mobile Number</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        {paginatedUsers.map((user) => (
                            <Fragment key={user.id}>
                            <tr>
                                <td>{user.id}</td>
                                {editingId === user.id ? (
                                   <>
                                   <td>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editForm.name}
                                            onChange={handleEditChange}
                                        />

                                        {editErrors.name && (
                                            <p className="edit-error">
                                                {editErrors.name}
                                            </p>
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleEditChange}
                                        />

                                        {editErrors.email && (
                                            <p className="edit-error">
                                                {editErrors.email}
                                            </p>
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="number"
                                            value={editForm.number}
                                            onChange={handleEditChange}
                                        />

                                        {editErrors.number && (
                                            <p className="edit-error">
                                                {editErrors.number}
                                            </p>
                                        )}
                                    </td>
                                <td>

                                    <div className="action-cell">

                                    <button
                                        className="icon-button save-icon"
                                        onClick={saveUser}
                                        title="Save changes"
                                    >
                                        💾
                                    </button>

                                    <button
                                        className="icon-button cancel-icon"
                                        onClick={cancelEditing}
                                        title="Cancel editing"
                                    >
                                        ❌
                                    </button>
                            
                                    </div>

                                 </td>
                                </>
                                ) : (
                                    <>
                                        <td className="name-cell">
                                            {user.name}
                                        </td>
                                        <td>
                                            {user.email}
                                        </td>
                                        <td>
                                            {user.number}
                                        </td>
                                        <td>
                                            <div className="action-cell">

                                                <button
                                                    className="icon-button edit-icon"
                                                    onClick={() => startEditing(user)}
                                                    title="Edit user"
                                                >
                                                    ✏️
                                                </button>

                                                <button
                                                    className="icon-button delete-icon"
                                                    onClick={() => deleteUser(user.id)}
                                                    title="Delete user"
                                                >
                                                    🗑️
                                                </button>

                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                            {successMessage?.id === user.id && (
                                <tr>
                                    <td colSpan="5">
                                        <p className="row-success-message">
                                            {successMessage.message}
                                        </p>
                                    </td>
                                </tr>
                            )}
                            </Fragment>
                        ))}
                        {paginatedUsers.length === 0 && (
                            <tr>
                                <td className="no-users-message" colSpan="5">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>

                    </table>

                </div>

                {filteredUsers.length > 0 && (
                    <div className="pagination" aria-label="Users pagination">
                        <button
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={visiblePage === 1}
                        >
                            Previous
                        </button>
                        <span>
                            Page {visiblePage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            disabled={visiblePage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}

            </div>

        </div>
    );
}

export default Users;
