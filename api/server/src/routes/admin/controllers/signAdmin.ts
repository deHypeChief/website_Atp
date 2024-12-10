import Elysia from "elysia";
import Admin from "../model";

import { jwtAdmin } from "../../../middleware/jwt";
import { loginAdminModel } from "../setup";

const signAdmin = new Elysia()
    .use(loginAdminModel)
    .use(jwtAdmin)
    .post('/signAdmin', async ({ body, set, adminJwt }) => {
        const { adminEmail, pin } = body;

        try{
            const admin = await Admin.findOne({ adminEmail });
            if (!admin || !(await admin.comparePin(pin))) {
                set.status = 400;
                return 'Invalid credentials';
            }

            // Sign the JWT token
            const token = await adminJwt.sign({
                adminId: admin._id.toString(),
                adminEmail: admin.adminEmail,
            });

            return {
                message: 'Login successful',
                data: {
                    admin: {
                        _id: admin._id,
                        name: admin.adminName,
                        role: admin.adminRole,
                        email: admin.adminEmail,
                    },
                    auth: {
                        token: token,
                    },
                },
            };
        }catch (err) {
            console.log(err)
            set.status = 500
            return {
                message: "Error while validating"
            }
        }
    }, {
        body: 'loginAdminModel'
    })
    .post('/verify', async ({ set, body, adminJwt }) => {
        const { token } = body;

        if (!token) {
            set.status = 400; // Bad Request
            return { message: "Token is required" };
        }

        try {
            // Verify the token using the secret key
            const decoded = adminJwt.verify(token);

            if (!decoded) {
                set.status = 401
                return {
                    isValid: false,
                    message: "Invalid or expired token",
                };
            }

            const isAdmin = await Admin.findById(decoded.adminId)

            if(!isAdmin){
                set.status = 401; // Unauthorized
                
                return {
                    isValid: false,
                    message: "Invalid or expired token",
                };
            }

            set.status = 200;
            return {
                isValid: true,
                admin: decoded, // Optionally return decoded admin data
            };
        } catch (error) {
            set.status = 401; // Unauthorized
            return {
                isValid: false,
                message: "Invalid or expired token",
            };
        }
    });


export default signAdmin