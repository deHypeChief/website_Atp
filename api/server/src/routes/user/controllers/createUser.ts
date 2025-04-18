import Elysia from "elysia";
import User from "../model";
import { userSchemas } from "../setup";
import Notify from "../../notifications/model";
import { sendMail } from "../../../middleware/sendMail";
import Billing from "../../billings/model";

const createUser = new Elysia()
    .use(userSchemas)
    .use(sendMail)
    .post("/createUser", async ({ set, body, mailConfig, generateAtpEmail }) => {
        const {
            fullName,
            username,
            email,
            password,
            phoneNumber,
            dob,
            level,
        } = body

        try {
            
            const usernameExists = await User.findOne({ username })
            const userEmailExists = await User.findOne({ email })

            if (usernameExists) {
                set.status = 400
                return { message: "the username is already taken" }
            }
            if (userEmailExists) {
                set.status = 400
                return { message: "the email is already taken" }
            }

            const user = new User({
                fullName,
                username,
                email,
                password,
                phoneNumber,
                dob,
                level,
            });
            await user.save();
            await Billing.create({
                user: user._id,
            })
            await Notify.create({
                userID: user._id,
                title: "New account created",
                message: `Welcome to ATP, ${fullName}`,
                type: "info"
            });
            
            mailConfig(
                email,
                `Hello welcome to ATP`,
                generateAtpEmail({
                    title: 'Welcome to ATP',
                    content: `
                        <div class="content">
                            <h2>Stay Updated on All Things Tennis</h2>
                            <p>Hi ${fullName},</p>
                            <p>We're thrilled to have you on board. Get ready to stay updated with the latest in tennis, exclusive content, match updates, and more!</p>
                            <br/>
                            <p>Dive into your account to setup your profile</p>

                            <!-- Blue Button -->
                            <p>Thank you for joining the ATP family. We're excited to serve you with the best tennis content out there.</p>
                        </div>
                    `
                })
            )

            set.status = 201;
            return {
                message: 'User created successfully',
                data: {
                    user: {
                        name: user.fullName,
                        username: user.username,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        dob: user.dob,
                        level: user.level,
                        socialAuth: user.socialAuth
                    },
                    auth: {
                        message: 'Sign in to access dashboard',
                    },
                },
            };
        } catch (err) {
            console.log(err);
            set.status = 500
            return { message: "Error while creating user" }
        }

    }, {
        body: "signUpSchema"
    })

export default createUser