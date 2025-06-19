import Elysia from "elysia";
import { paystack } from "../../../middleware/paystack";
import { BillingConfig } from "./billingContent";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import Billing from "../model";
import Notify from "../../notifications/model";
import { billingSchema } from "../setup";
import { sendMail } from "../../../middleware/sendMail";

const userAction = new Elysia()
    .use(paystack)
    .use(sendMail)
    .use(isUser_Authenticated)
    .get("/pay/me", async ({ set, user }) => {
        try {
            const billing = await Billing.findOne({ user: user._id });

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
    .post("/pay/registration", async ({ paystack_Transaction, set, user }) => {
        try {
            const billing = await Billing.findOne({ user: user._id });

            if (!billing) {
                set.status = 400;
                return {
                    message: 'User Billing not found',
                };
            }

            const paystackResponse = await paystack_Transaction({
                reference: `${user.username}-registration-${Date.now()}`,
                amount: (BillingConfig.registration.price * 100).toString(),
                currency: "NGN",
                callback_url: `${process.env.ACTIVE_ORIGIN}/u/bills/registration/none/none`,
                // callback_url: `${process.env.ACTIVE_ORIGIN}/u/bills/registration`,
                email: user.email,
            });

            set.status = 200;
            return { paystackResponse };
        } catch (err) {
            console.error(err);
            set.status = 500;
            return { message: "Error during payment processing" };
        }
    })
    .post("/pay/membership/:type", async ({ paystack_Transaction, set, params: { type }, user }) => {
        try {
            const billing = await Billing.findOne({ user: user._id });

            if (!billing) {
                set.status = 400;
                return {
                    message: 'User Billing not found',
                };
            }

            // Validate membership type
            const membershipTypes = ['monthly', 'quarterly', 'biAnnually', 'yearly'];
            if (!membershipTypes.includes(type)) {
                set.status = 400;
                return {
                    message: 'Invalid membership type',
                };
            }

            const membershipConfig = BillingConfig.dues[type as 'monthly' | 'quarterly' | 'biAnnually' | 'yearly'];

            const paystackResponse = await paystack_Transaction({
                reference: `${user.username}-membership-${type}-${Date.now()}`,
                amount: (membershipConfig.price * 100).toString(),
                currency: "NGN",
                callback_url: `${process.env.ACTIVE_ORIGIN}/u/bills/membership/${type}/${membershipConfig.duration}`,
                email: user.email,
            });

            set.status = 200;
            return { paystackResponse };
        } catch (err) {
            console.error(err);
            set.status = 500;
            return { message: "Error during payment processing" };
        }
    })
    .post("/pay/training/:type/:duration", async ({ paystack_Transaction, user, set, params: { type, duration } }) => {
        try {
            const billing = await Billing.findOne({ user: user._id });

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
            const finalPrice = billing.isMember
                ? basePrice - (basePrice * (billing.bills.membershipBill.discount / 100))
                : basePrice;

            const paystackResponse = await paystack_Transaction({
                reference: `${user.username}-training-${type}-${duration}-${Date.now()}`,
                amount: (finalPrice * 100).toString(),
                currency: "NGN",
                callback_url: `${process.env.ACTIVE_ORIGIN}/u/bills/training/${type}/${duration}`,
                email: user.email,
            });

            set.status = 200;
            return { paystackResponse };
        } catch (err) {
            console.error(err);
            set.status = 500;
            return { message: "Error during payment processing" };
        }
    })
    .get("/pay/callback/:type/:subType/:duration", async ({
        paystack_VerifyTransaction,
        mailConfig,
        generateAtpEmail,
        set,
        user,
        query,
        params: { type, subType, duration }
    }) => {
        try {

            if (!query.tx_ref) {
                set.status = 400;
                return { message: "Transaction reference is missing" };
            }

            // // Check if this transaction was already processed
            // const existingTransaction = getBilling.billingHistory.find(
            //     history => history.transactionRef === query.tx_ref
            // );

            // if (existingTransaction) {
            //     set.status = 400;
            //     return { message: "Transaction has already been processed" };
            // }

            const paystackResponse = await paystack_VerifyTransaction(query.tx_ref);

            if (!paystackResponse.status) {
                set.status = 400;
                return { message: "Payment transaction error" };
            }

            

            set.status = 200;
            return { message: "Payment Successful" };
        } catch (err) {
            console.error("Error checking payment status:", err);

            // Create error notification
            await Notify.create({
                userID: user._id,
                title: "Payment Processing Error",
                message: "We encountered an issue processing your payment. Please contact support for assistance.",
                type: "error"
            }).catch(notifyErr => console.error("Failed to create error notification:", notifyErr));

            set.status = 500;
            return { message: "Error during payment validation check" };
        }
    });

export default userAction;