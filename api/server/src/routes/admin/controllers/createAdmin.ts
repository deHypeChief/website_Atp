import Elysia from "elysia";
import Admin from "../model";
import { createAdminModel } from '../setup'

const createAdmin = new Elysia()
    .use(createAdminModel)
    .post('/createAdmin', async ({ body, set }) => {
        const { adminName, adminEmail, pin } = body

        const existingAdminByEmail = await Admin.findOne({ adminEmail });
        if (existingAdminByEmail) {
            set.status = 400;
            return { message: 'Admin with this mail already exists' };
        }
        const admin = new Admin({ adminName, pin, adminRole: "admin", adminEmail });
        await admin.save();

        set.status = 201;
        return {
            message: 'Admin registered successfully',
            data: {
                admin: {
                    _id: admin._id,
                    name: admin.adminName,
                    role: admin.adminRole,
                    email: admin.adminEmail,
                },
                auth: {
                    message: 'Sign In to access dashboard',
                },
            },
        };
    }, {
        body: 'createAdminModel'
    })

export default createAdmin