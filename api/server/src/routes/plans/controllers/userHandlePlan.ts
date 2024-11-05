import Elysia from "elysia";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import Plan from "../model";
import flw from "../../../config/flutterwave.config";
import User from "../../user/model";
import dayjs from "dayjs";
import Coach from "../../coach/model";
import Notify from "../../notifications/model";
import { sendMail } from "../../../middleware/sendMail";
import { flutterwave } from "../../../middleware/flutterwave";

const userHandle = new Elysia({
    prefix: "/user"
})
    .use(isUser_Authenticated)
    .use(sendMail)
    .use(flutterwave)
    .get("/pay", async ({flwPay, set, user, query:{planId, billingType, coachId} }) => {
        try {
            // Validate required fields
            // billingType is an array index
            if (!planId || billingType === undefined) {
                set.status = 400;
                return { message: "planId and billingType are required" };
            }

            // Find the plan by ID
            const plan = await Plan.findById(planId);
            if (!plan) {
                set.status = 400;
                return { message: "Invalid plan ID" };
            }

            const coach = await Coach.findById(coachId)


            const billing = plan.billingPlans[parseInt(billingType)];
            if (!billing) {
                set.status = 400;
                return { message: "Invalid billing type" };
            }
            if (!coach) {
                set.status = 400;
                return { message: "Invalid Coach" };
            }

            let payAmount = 0

            if (plan.planPrice > 0) {
                payAmount = billing.billingPrice
            } else {
                const discountFactor = 1 - (billing.discountPercentage / 100);
                payAmount = coach.price * billing.interval * discountFactor;
            }

            // Prepare payment request
            const flwResponse = await flwPay({
                tx_ref: `${user.username}-${Date.now()}`,
                amount: payAmount,
                currency: billing.currency.toUpperCase(),
                redirect_url: `${process.env.ACTIVE_ORIGIN}/u/billing/${planId}/${billingType}/${coachId || "null"}/planCallback`,
                customer: {
                    email: user.email,
                    name: user.fullName,
                    phonenumber: user.phoneNumber
                },
                customizations: {
                    title: `${billing.billingName} for ${plan.planName}`.toUpperCase(),
                }
            })

            set.status = 200;
            console.log(flwResponse)
            return {
                flwResponse
            };

        } catch (err) {
            set.status = 500;
            console.log(err)
            return { message: "Error while making payment", error: err };
        }
    })
    .get("/:planId/:billingType/:coachId/planCallback", async ({ generateAtpEmail, mailConfig, set, query, user, params: { billingType, coachId, planId } }) => {
        try {

            if(query.status == "cancelled"){
                set.status = 400;
                return { message: "The Payment was cancelled" };
            }
            // Verify transaction via Flutterwave
            const verifyTransactions = await flw.get(`transactions/${query.transaction_id}/verify`);
            console.log(verifyTransactions)
            if (verifyTransactions.data.status !== "success") {
                set.status = 400;
                return { message: "Transaction Error" };
            }

            // Find the plan by ID
            const plan = await Plan.findById(planId);
            if (!plan) {
                set.status = 400;
                return { message: "Invalid plan ID" };
            }

            // Find the coach by ID
            const coach = coachId ? await Coach.findById(coachId) : null;

            const billing = plan.billingPlans[parseInt(billingType)];
            if (!billing) {
                set.status = 400;
                return { message: "Invalid billing type" };
            }
            // Update user membership details
            const updatedUser = await User.findByIdAndUpdate(
                user._id,
                {
                    membership: plan.planName,
                    assignedCoach: coachId || null,
                    plan: {
                        planId: planId,
                        planIntervalNumber: parseInt(billingType),
                        flutterwavePlanId: query.transaction_id,
                        renewalDate:  new Date(dayjs().add(billing.interval, 'month').valueOf()),
                        planStartDate: new Date()
                    }
                },
                { 
                    new: true,
                    runValidators: true, // Enable validation
                    lean: true,
                    // Explicitly select fields to avoid circular references
                    select: 'membership assignedCoach plan email fullName'
                }
            );
            console.log(updatedUser);
            // Notify user of successful subscription
            await Notify.create({
                userID: user._id,
                title: `Subscription Successful 🎉`,
                message: `Hi ${user.fullName}, you've successfully subscribed to the ${plan.planName} plan! ${coach ? `Your coach, ${coach.coachName}, will be in touch soon.` : ''} Your next renewal is on ${dayjs().add(billing.interval, 'month').format("MMMM D, YYYY")}.`,
                type: "info"
            });

            // Send email notification
            mailConfig(
                user.email,
                `Subscription Confirmation: ${plan.planName} Plan`,
                generateAtpEmail({
                    title: `Welcome to the ${plan.planName} Plan! 🎉`,
                    content: `
                        <p>Hi ${user.fullName},</p>
                        <p>Thank you for subscribing to the <strong>${plan.planName}</strong> plan.</p>
                        <br/>
                        <p>Your subscription details are as follows:</p>
                        <ul>
                            <li><strong>Plan Name:</strong> ${plan.planName}</li>
                            ${coach ? `<li><strong>Coach Assigned:</strong> ${coach.coachName}</li>` : ''}
                            <li><strong>Subscription Start Date:</strong> ${dayjs().format("MMMM D, YYYY")}</li>
                            <li><strong>Next Renewal Date:</strong> ${dayjs().add(billing.interval, 'month').format("MMMM D, YYYY")}</li>
                        </ul>
                        <br/>
                        <p>If you have any questions, feel free to reach out to us.</p>
                        <p>We're excited to have you on board, and we look forward to supporting you in your journey!</p>
                        <br/>
                        <p>Best regards,</p>
                        <p>The Team</p>
                    `
                })
            );

            set.status = 200;
            return {
                flw: {
                    amount: verifyTransactions.data.amount,
                    currency: verifyTransactions.data.currency,
                    status: verifyTransactions.data.status,
                },
                message: "Membership successfully updated"
            };

        } catch (err) {
            set.status = 500;
            console.log(err);
            return { message: "Error during payment validation", error: err };
        }
    });


export default userHandle;
