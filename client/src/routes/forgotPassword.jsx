import { useState } from "react";
import { forgotPassword } from "../libs/api/api.endpoints";
import "../libs/styles/forgotPassword.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await forgotPassword(email);
            setMessage(response.message);
            setTimeout(() => {
                window.location.href = '/reset-password';
            }, 2000); // Redirect after 2 seconds
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="forgot-password-container">
            <h1>Forgot Password</h1>
            <form onSubmit={handleSubmit} className="forgot-password-form">
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Submit</button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}
