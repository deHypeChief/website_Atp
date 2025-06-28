import Elysia from "elysia";
import { jwtUser } from "../../../middleware/jwt";
import { userSchemas } from "../setup";
import User from "../model";
import ResetToken from "../resetToken.model";
import { sendMail } from "../../../middleware/sendMail";

const signUser = new Elysia()
    .use(sendMail)
    .use(userSchemas)
    .use(jwtUser)
    .post("/signUser", async ({ body, set, userJwt, mailConfig, generateAtpEmail }) => {
        const { email, password } = body;

        try {
            // Fetch user data from database
            const userData = await User.findOne({ email });

            // Check for user existence and password match
            if (!userData || !(await userData.comparePassword(password))) {
                set.status = 400;
                return { message: 'Invalid credentials' };
            }

            // Sign the JWT token
            const token = await userJwt.sign({
                userId: (userData._id as { toString: () => string }).toString(),
                email: userData.email,
            });

            // Fetch user details without the password
            const user = await User.findOne({ email }).select("-password");

            // Send email notification
            mailConfig(
                (user?.email ?? ""), // Send to user's email, fallback to empty string if undefined
                "Login Alert for Your Account", // Subject of the email
                generateAtpEmail({
                    title: "Account Login Notification",
                    content: `
                        <p>Hi ${user?.fullName},</p>
                        <p>We wanted to inform you that your account was just accessed on <strong>${new Date().toLocaleString()}</strong>.</p>
                        <p>If this was you, great! There's no need to worry.</p>
                        <br/>
                        <p>Best regards,</p>
                        <p>Your Security Team</p>
                    `
                })
            );

            return {
                message: 'Login successful',
                data: {
                    user,
                    auth: {
                        message: 'Auth token generated',
                        token: token,
                    },
                },
            };
        } catch (err) {
            console.error(err);
            set.status = 500;
            return {
                message: "Error while validating",
                error: err instanceof Error ? err.message : String(err), // Optional: include error message for debugging
            };
        }
    }, {
        body: "loginSchema" // Specify body schema for validation
    })
    .post('/verify', async ({ set, body, userJwt }) => {
        const { token } = body;

        if (!token) {
            set.status = 400; // Bad Request
            return { message: "Token is required" };
        }

        try {
            // Verify the token using the secret key
            const decoded = await userJwt.verify(token);

            if (!decoded) {
                set.status = 401; // Unauthorized

                return {
                    isValid: false,
                    message: "Invalid or expired token",
                };
            }

            const isUser = await User.findById(decoded.userId)

            if (!isUser) {
                set.status = 401; // Unauthorized

                return {
                    isValid: false,
                    message: "Invalid or expired token",
                };
            }

            set.status = 200;
            return {
                isValid: true,
                user: decoded, // Optionally return decoded user data
            };
        } catch (error) {
            set.status = 401; // Unauthorized
            return {
                isValid: false,
                message: "Invalid or expired token",
            };
        }
    })
    .post('/forgot-password', async ({ body, set, mailConfig, generateAtpEmail }) => {
        const { email } = body;

        if (!email) {
            set.status = 400; // Bad Request
            return { message: "Email is required" };
        }

        try {
            // Check if user exists
            const user = await User.findOne({ email });

            if (!user) {
                set.status = 404; // Not Found
                return { message: "User not found" };
            }

            // Generate a reset token (example: random string or JWT)
            const resetToken = Math.random().toString(36).substr(2, 8); // Example token

            // Save the reset token to the user (optional: with expiration)
            user.resetToken = resetToken;
            await user.save();

            // Save the reset token in the ResetToken model
            const resetTokenRecord = new ResetToken({
                userId: user._id,
                token: resetToken,
            });
            await resetTokenRecord.save();

            // Send email with reset instructions
            mailConfig(
                email,
                "Password Reset Request",
                generateAtpEmail({
                    title: "Password Reset",
                    content: `
                        <p>Hi ${user.fullName},</p>
                        <p>You requested to reset your password. Use the code below to reset it:</p>
                        <h3>${resetToken}</h3>
                        <p>If you did not request this, please ignore this email.</p>
                        <br/>
                        <p>Best regards,</p>
                        <p>Your Security Team</p>
                    `
                })
            );

            set.status = 200;
            return { message: "Password reset email sent" };
        } catch (error) {
            console.error(error);
            set.status = 500; // Internal Server Error
            return { message: "An error occurred", error: error.message };
        }
    })
    .post('/reset-password', async ({ body, set }) => {
        const { resetCode, newPassword } = body;

        if (!resetCode || !newPassword) {
            set.status = 400; // Bad Request
            return { message: "Reset code and new password are required" };
        }

        try {
            // Find the reset token in the database
            const tokenRecord = await ResetToken.findOne({ token: resetCode });

            if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
                set.status = 400; // Bad Request
                return { message: "Invalid or expired reset code" };
            }

            // Find the user associated with the reset token
            const user = await User.findById(tokenRecord.userId);

            if (!user) {
                set.status = 404; // Not Found
                return { message: "User not found" };
            }

            // Update the user's password
            user.password = newPassword;
            await user.save();

            // Delete the reset token after successful password reset
            await ResetToken.deleteOne({ token: resetCode });

            set.status = 200;
            return { message: "Password reset successful" };
        } catch (error) {
            console.error(error);
            set.status = 500; // Internal Server Error
            return { message: "An error occurred", error: error.message };
        }
    }, {
        body: "resetPasswordSchema" // Specify body schema for validation
    });

export default signUser;
