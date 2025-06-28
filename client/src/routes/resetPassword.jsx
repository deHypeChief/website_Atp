import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../libs/api/api.endpoints";
import "../libs/styles/resetPassword.css";

export default function ResetPassword() {
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await resetPassword({ resetCode, newPassword });
            setMessage(response.message);

            // Redirect to login page on success
            if (response.success) {
                navigate("/login");
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="reset-password-container">
            <h1>Reset Password</h1>
            <form onSubmit={handleSubmit} className="reset-password-form">
                <label htmlFor="resetCode">Reset Code:</label>
                <input
                    type="text"
                    id="resetCode"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                />
                <label htmlFor="newPassword">New Password:</label>
                <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit">Submit</button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}
