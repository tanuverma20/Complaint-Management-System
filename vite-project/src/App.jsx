import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Registration from "./pages/Registration";
import Users from "./pages/Users";
import Complaints from "./pages/Complaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import AddComplaint from "./pages/AddComplaint";
import AIAssistant from "./pages/AIAssistant";

import "./App.css";

function App() {

    return (

        <BrowserRouter>

            <div className="app-layout">

                <Sidebar />

                <main className="main-content">

                    <Routes>

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/register"
                            element={<Registration />}
                        />

                        <Route
                            path="/users"
                            element={<Users />}
                        />

                        <Route
                            path="/complaints"
                            element={<Complaints />}
                        />
                        <Route
                            path="/add-complaint"
                            element={<AddComplaint />}
                        />
                        <Route
                            path="/complaints/:id"
                            element={<ComplaintDetails />}
                        />
                        <Route path="/ai-assistant" element={<AIAssistant />} />

                    </Routes>

                </main>

            </div>

        </BrowserRouter>

    );
}

export default App;