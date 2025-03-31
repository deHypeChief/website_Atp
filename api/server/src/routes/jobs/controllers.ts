import Elysia from "elysia";
import { sendMail } from "../../middleware/sendMail";
import dayjs from "dayjs";
import User from "../user/model";
import Notify from "../notifications/model";
import Billing from "../billings/model";
import mongoose from "mongoose";


const jobs = new Elysia()
    .use(sendMail)
    .post("/removeExpiredMemberships", async ({ set, mailConfig, generateAtpEmail }) => {
        try {
            const today = new Date();

            // Find all records with expired membership bills (renewAt date has passed)
            const expiredMemberships = await Billing.find({
                'bills.membershipBill.status': { $ne: "Expired" },
                'bills.membershipBill.renewAt': { $lt: today }
            });

            // Handle expired memberships based on grace period
            for (const billing of expiredMemberships) {
                const user = await mongoose.model('User').findById(billing.user);

                if (!user) continue;

                // Check if within grace period or grace period has passed
                const graceExpired = billing.bills.membershipBill.gracePeriod < today;

                if (graceExpired) {
                    // Grace period has passed - mark as expired
                    await Billing.findByIdAndUpdate(billing._id, {
                        isMember: false,
                        'bills.membershipBill.status': "Expired",
                        'bills.membershipBill.discount': 0
                    });

                    // Send expiration notification
                    await Notify.create({
                        userID: user._id,
                        title: "Membership Expired",
                        message: `Hi ${user.fullName}, your membership has now expired. You'll need to renew to continue enjoying our services and benefits.`,
                        type: "warning"
                    });

                    mailConfig(
                        user.email,
                        "ATP membership expired",
                        generateAtpEmail({
                            title: "Membership Expired",
                            content: `
                                <p>Hi ${user.fullName},</p>
                                <p>Your membership plan <strong>${user.membership}</strong> has now expired and the grace period has ended.</p>
                                <p>To regain access to our services, please visit your profile to renew your plan.</p>
                                <p>Thank you!</p>
                            `
                        })
                    );
                } else {
                    // Within grace period - send grace period notification
                    // Only send if status is not already "Grace Period" to avoid duplicate notifications
                    if (billing.bills.membershipBill.status !== "Grace Period") {
                        await Billing.findByIdAndUpdate(billing._id, {
                            'bills.membershipBill.status': "Grace Period"
                        });

                        await Notify.create({
                            userID: user._id,
                            title: "Membership Renewal",
                            message: `Hi ${user.fullName}, your membership has ended! Renew now to keep enjoying all the benefits and stay on track. We'd love to have you back! 🚀`,
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
                                    <p>You have a grace period of 7 days to renew. Don't miss out on the benefits! Please visit your profile to renew your plan.</p>
                                    <p>Thank you!</p>
                                `
                            })
                        );
                    }
                }
            }

            // Handle expired training bills
            const expiredTrainings = await Billing.find({
                'bills.trainingBill.status': { $ne: "Expired" },
                'bills.trainingBill.renewAt': { $lt: today }
            });

            for (const billing of expiredTrainings) {
                const user = await mongoose.model('User').findById(billing.user);

                if (!user) continue;

                // Check if within grace period or grace period has passed
                const graceExpired = (billing.bills.trainingBill?.gracePeriod ?? new Date(0)) < today;

                if (graceExpired) {
                    // Grace period has passed - mark as expired
                    await Billing.findByIdAndUpdate(billing._id, {
                        'bills.trainingBill.status': "Expired"
                    });

                    // Send expiration notification
                    await Notify.create({
                        userID: user._id,
                        title: "Training Subscription Expired",
                        message: `Hi ${user.fullName}, your training subscription has now expired. You'll need to renew to continue accessing training resources.`,
                        type: "warning"
                    });

                    mailConfig(
                        user.email,
                        "ATP training subscription expired",
                        generateAtpEmail({
                            title: "Training Subscription Expired",
                            content: `
                                <p>Hi ${user.fullName},</p>
                                <p>Your training subscription for <strong>${billing.bills.trainingBill?.trainingType ?? 'Unknown'}</strong> has now expired and the grace period has ended.</p>
                                <p>To regain access to our training resources, please visit your profile to renew your subscription.</p>
                                <p>Thank you!</p>
                            `
                        })
                    );
                } else {
                    // Within grace period - send grace period notification
                    // Only send if status is not already "Grace Period" to avoid duplicate notifications
                    if (billing.bills.trainingBill?.status !== "Grace Period") {
                        await Billing.findByIdAndUpdate(billing._id, {
                            'bills.trainingBill.status': "Grace Period"
                        });

                        await Notify.create({
                            userID: user._id,
                            title: "Training Subscription Renewal",
                            message: `Hi ${user.fullName}, your training subscription has ended! Renew now to keep accessing all training resources. You have a 7-day grace period.`,
                            type: "info"
                        });

                        mailConfig(
                            user.email,
                            "ATP training subscription renewal",
                            generateAtpEmail({
                                title: "Training Subscription Update",
                                content: `
                                    <p>Hi ${user.fullName},</p>
                                    <p>Your training subscription for <strong>${billing.bills.trainingBill?.trainingType ?? 'Unknown'}</strong> has expired!</p>
                                    <p>You have a grace period of 7 days to renew. Don't miss out on the benefits! Please visit your profile to renew your subscription.</p>
                                    <p>Thank you!</p>
                                `
                            })
                        );
                    }
                }
            }

            set.status = 200;
            return {
                message: "Expired memberships and trainings processed successfully",
                membershipCount: expiredMemberships.length,
                trainingCount: expiredTrainings.length
            };

        } catch (err: Error | unknown) {
            set.status = 500;
            return { message: "Error while processing expired memberships", error: err instanceof Error ? err.message : 'Unknown error' };
        }
    });

export default jobs