import Elysia from "elysia";
import { sendMail } from "../../middleware/sendMail";
import dayjs from "dayjs";
import User from "../user/model";
import Notify from "../notifications/model";

const jobs = new Elysia()
    .use(sendMail)
    .post("/removeExpiredMemberships", async ({ set, mailConfig, generateAtpEmail }) => {
        try {
            // Get current date
            const currentDate = dayjs();

            // Find users whose renewal date has passed
            const usersWithExpiredMemberships = await User.find({
                "plan.renewalDate": { $lt: currentDate.toISOString() }
            });

            if (!usersWithExpiredMemberships.length) {
                set.status = 200;
                return { message: "No expired memberships found" };
            }

            for (const user of usersWithExpiredMemberships) {
                await Notify.create({
                    userID: user._id,
                    title: "Membership Renewal",
                    message: `Hi ${user.fullName}, your membership has ended! Renew now to keep enjoying all the benefits and stay on track. We’d love to have you back! 🚀`,
                    type: "info"
                });
                mailConfig(
                    user.email,
                    "ATP membership renewal",
                    generateAtpEmail({
                        title: "Membership Update",
                        content: `
                            <p>Hi ${user.fullName},</p>
                            <p>Your membership plan <strong>${user.membership}</strong> has expired!</p>
                            <p>Don't miss out on the benefits! Please visit your profile to renew your plan.</p>
                            <p>Thank you!</p>
                        `
                    })
                )
                await User.findByIdAndUpdate(user._id, {
                    $unset: {
                        membership: "",
                        plan: ""
                    }
                });


            }

            set.status = 200;
            return { message: "Expired memberships removed successfully", count: usersWithExpiredMemberships.length };

        } catch (err) {
            set.status = 500;
            return { message: "Error while removing expired memberships", error: err.message };
        }
    })

export default jobs