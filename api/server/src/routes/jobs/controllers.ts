import Elysia from "elysia";
import { sendMail } from "../../middleware/sendMail";
import dayjs from "dayjs";
import Notify from "../notifications/model";
import { Subscription } from "../subscriptions/model";
import { paystack } from "../../middleware/paystack";
import BillingConfig from "../subscriptions/controllers/billingContent";
import CoachAssignment from "../coachAssigments/model";

export const jobs = new Elysia()
    .use(sendMail)
    .use(paystack)
    .post("/handleSubscribtions", async ({ set, mailConfig, generateAtpEmail, paystack_Transaction_Subscriptions }) => {
        try {
            const today = dayjs();

            const subscriptions = await Subscription.find({
                $or: [
                    {
                        "membership.status": "Paid",
                        "membership.endDate": { $lt: today.toDate() }
                    },
                    {
                        "training.status": "Paid",
                        "training.endDate": { $lt: today.toDate() }
                    }
                ]
            }).populate("user");

            for (const sub of subscriptions) {
                const user = sub.user as any;

                // Handle Membership Expiry
                if (
                    sub.membership.status === "Paid" &&
                    sub.membership.endDate &&
                    dayjs(sub.membership.endDate).isBefore(today)
                ) {
                    if (sub.membership.autoRenew) {
                        try {
                            const validPlans = ["monthly", "quarterly", "yearly"] as const;
                            type PlanType = typeof validPlans[number];
                            const plan = validPlans.includes(sub.membership.plan as PlanType) ? sub.membership.plan as PlanType : "monthly";
                            const price = BillingConfig.dues[plan]?.price || 0;

                            const chargeResult = await paystack_Transaction_Subscriptions({
                                amount: String(price * 100), // kobo
                                email: user.email,
                                authorization_code: sub.cardAuthToken
                            });

                            if (chargeResult.status && chargeResult.data.status === "success") {
                                sub.paymentHistory.push({
                                    type: "membership",
                                    date: today.toDate(),
                                    amount: price,
                                    status: "paid",
                                    transactionRef: chargeResult.data.reference
                                });

                                sub.membership.endDate = dayjs(today).add(
                                    BillingConfig.dues[plan]?.duration || 1,
                                    "month"
                                ).toDate();

                                await Notify.create({
                                    user: user._id,
                                    title: "Membership Auto-Renewed",
                                    message: `Your membership plan (${sub.membership.plan}) has been auto-renewed successfully.`,
                                });


                                mailConfig(
                                    (user?.email ?? ""), // Send to user's email, fallback to empty string if undefined
                                    "Membership Renewed",
                                    generateAtpEmail({
                                        title: "Membership Renewed",
                                        content: `<p>Hello ${user.fullName},</p><p>Your membership has been auto-renewed. Your next billing date is ${dayjs(sub.membership.endDate).format("DD MMM YYYY")}.</p>`
                                    })
                                )
                            } else {
                                sub.membership.status = "Expired";
                                sub.membership.plan = "none";

                                sub.paymentHistory.push({
                                    type: "membership",
                                    date: today.toDate(),
                                    amount: price,
                                    status: "failed",
                                    transactionRef: chargeResult.data?.reference || `AUTOFAIL-${Date.now()}`
                                });

                                await Notify.create({
                                    user: user._id,
                                    title: "Auto-Renewal Failed",
                                    message: `We couldn't auto-renew your membership. Please update your billing info.`,
                                });


                                mailConfig(
                                    (user?.email ?? ""), // Send to user's email, fallback to empty string if undefined
                                    "Membership Renewal Failed",
                                    generateAtpEmail({
                                        title: "Membership Renewal Failed",
                                        content: `<p>Hello ${user.fullName},</p><p>Your membership auto-renewal failed. Kindly update your payment method to avoid interruptions.</p>`
                                    })
                                )
                            }
                        } catch (err) {
                            console.error("Auto-renewal failed:", err);
                        }
                    } else {
                        sub.membership.status = "Expired";
                        sub.membership.plan = "none";

                        await Notify.create({
                            user: user._id,
                            title: "Membership Expired",
                            message: `Your membership has expired. Please renew to continue.`,
                        });


                        mailConfig(
                            (user?.email ?? ""), // Send to user's email, fallback to empty string if undefined
                            "Membership Expired",
                            generateAtpEmail({
                                title: "Membership Expired",
                                content: `<p>Hello ${user.fullName},</p><p>Your membership has expired. Kindly renew to continue enjoying our services.</p>`
                            })
                        )
                    }
                }

                // Handle Training Expiry
                if (
                    sub.training.status === "Paid" &&
                    sub.training.endDate &&
                    dayjs(sub.training.endDate).isBefore(today)
                ) {
                    sub.training.status = "Expired";
                    sub.training.plan = "none";

                    // Unassign any coach linked to the user
                    await CoachAssignment.deleteMany({ playerId: user._id });

                    await Notify.create({
                        user: user._id,
                        title: "Training Plan Expired",
                        message: `Your training plan has expired. Your coach has been unassigned.`,
                    });

                    mailConfig(
                        (user?.email ?? ""), // Send to user's email, fallback to empty string if undefined
                        "Training Expired",
                        generateAtpEmail({
                            title: "Training Plan Expired",
                            content: `<p>Hello ${user.fullName},</p><p>Your training plan has expired and your coach has been unassigned. Kindly renew to continue your training sessions.</p>`
                        })
                    )
                }

                await sub.save();
            }

            return { message: "Subscription checks completed successfully" };
        } catch (err: Error | unknown) {
            set.status = 500;
            return {
                message: "Error while processing expired subscriptions",
                error: err instanceof Error ? err.message : "Unknown error"
            };
        }
    });

    
export default jobs;
