import Elysia from "elysia";
import { paystack } from "../../../middleware/paystack";
import { sendMail } from "../../../middleware/sendMail";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import BillingConfig from "./billingContent";
import { Subscription } from "../model";
import Notify from "../../notifications/model";

const subscriptions = new Elysia()
    .use(paystack)
    .use(sendMail)
    .use(isUser_Authenticated)
    .get("/pay/me", async ({ set, user }) => {
        try {
            const billing = await Subscription.findOne({ user: user._id });

            if (!billing) {
                set.status = 400;
                return {
                    message: 'User Billing not found',
                };
            }

            set.status = 200;
            return {
                message: 'Billing retrieved successfully',
                data: billing,
            };
        } catch (err) {
            console.error(err);
            set.status = 500;
            return { message: "Error getting billing info" };
        }
    })
    .get("/pay/info", async ({ set }) => {
        try {
            set.status = 200;
            return {
                message: 'Payment info retrieved successfully',
                data: BillingConfig,
            };
        } catch (err) {
            console.error(err);
            set.status = 500;
            return { message: "Error getting payment info" };
        }
    })
    .post("/pay/membership/:type/:autoRenew", async ({ paystack_Transaction, set, user, params: { type, autoRenew } }) => {
        try {
            const billing = await Subscription.findOne({ user: user._id });

            if (!billing) {
                set.status = 400;
                return {
                    message: 'User Billing not found',
                };
            }

            // Validate membership type
            const membershipTypes = ['monthly', 'quarterly', 'yearly'];
            if (!membershipTypes.includes(type)) {
                set.status = 400;
                return {
                    message: 'Invalid membership type',
                };
            }

            const membershipConfig = BillingConfig.dues[type as 'monthly' | 'quarterly' | 'yearly'];


            const paystackResponse = await paystack_Transaction({
                reference: `${user.username}-membership-${type}-${Date.now()}`,
                amount: (membershipConfig.price * 100).toString(),
                currency: "NGN",
                callback_url: `${process.env.ACTIVE_ORIGIN}/u/bills/membership/${type}/${membershipConfig.duration}/${autoRenew}`,
                email: user.email,
            });

            set.status = 200;
            return { paystackResponse };
        } catch (err) {
            console.error(err);
            set.status = 500;
            return { message: "Error creating membership subscription" };
        }
    })
    .post("/pay/training/:type/:duration", async ({ paystack_Transaction, set, user, params: { type, duration } }) => {
        try {
            const billing = await Subscription.findOne({ user: user._id });

            if (!billing) {
                set.status = 400;
                return {
                    message: 'User Billing not found',
                };
            }

            // Validate training package type
            const trainingPackages = ['regular', 'standard', 'premium', 'family', 'couples'];
            if (!trainingPackages.includes(type)) {
                set.status = 400;
                return {
                    message: 'Invalid training package type',
                };
            }

            const trainingConfig = BillingConfig.packages[type as 'regular' | 'standard' | 'premium' | 'family' | 'couples'];

            // Validate duration
            const validDurations = ['1month', '3months'];
            if (!validDurations.includes(duration)) {
                set.status = 400;
                return {
                    message: 'Invalid plan duration',
                };
            }

            // Select the correct plan based on duration
            const selectedPlan = duration === '1month'
                ? trainingConfig.plans[0]
                : trainingConfig.plans[1];

            // Calculate price with member discount if applicable
            const basePrice = selectedPlan.price;
            const finalPrice = billing.membership.status === "Paid"
                ? basePrice * (1 - trainingConfig.discount / 100)
                : basePrice;

            // generate a unique reference for the transaction
            const paystackResponse = await paystack_Transaction({
                reference: `${user.username}-training-${type}-${duration}-${Date.now()}`,
                amount: (finalPrice * 100).toString(),
                currency: "NGN",
                callback_url: `${process.env.ACTIVE_ORIGIN}/u/bills/training/${type}/${duration}/none`,
                email: user.email,
            });

            set.status = 200;
            return { paystackResponse };
        } catch (err) {
            console.error(err);
            set.status = 500;
            return { message: "Error creating training subscription" };
        }
    })
    .get("/pay/callback/:type/:subType/:duration/:autoRenew", async ({
        paystack_VerifyTransaction,
        mailConfig,
        generateAtpEmail,
        set,
        user,
        query,
        params: { type, subType, duration, autoRenew }
    }) => {
        try {

            if (!query.tx_ref) {
                set.status = 400;
                return { message: "Transaction reference is missing" };
            }

            const paystackResponse = await paystack_VerifyTransaction(query.tx_ref);

            if (!paystackResponse.status) {
                set.status = 400;
                return { message: "Payment transaction error" };
            }

            const billing = await Subscription.findOne({ user: user._id });
            if (!billing) {
                set.status = 400;
                return { message: "User Billing not found" };
            }

            // Update auto renwal information based on type
            if (type === "membership") {
                billing.membership.autoRenew = autoRenew === "true";
            }
            await billing.save();

            set.status = 200;
            return {
                message: "Payment Successful",
                billing,
                autoRenew
            };
        } catch (err) {
            console.error("Error checking payment status:", err);

            // Create error notification
            await Notify.create({
                userID: user._id,
                title: "Payment Processing Error",
                message: "We encountered an issue processing your payment. Please contact support for assistance.",
                type: "error"
            })
                .catch(notifyErr =>
                    console.error("Failed to create error notification:",
                        notifyErr
                    ));

            set.status = 500;
            return { message: "Error during payment validation check" };
        }
    });


export default subscriptions 
