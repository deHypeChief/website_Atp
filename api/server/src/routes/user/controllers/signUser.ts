import Elysia from "elysia";
import { jwtUser } from "../../../middleware/jwt";
import { userSchemas } from "../setup";
import User from "../model";
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
                userId: userData._id.toString(),
                email: userData.email,
            });

            // Fetch user details without the password
            const user = await User.findOne({ email }).select("-password");

            // Send email notification
            mailConfig(
                user?.email, // Send to user's email
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
                error: err.message, // Optional: include error message for debugging
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
            const decoded = userJwt.verify(token);

            if (!decoded) {
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
    });

export default signUser;
