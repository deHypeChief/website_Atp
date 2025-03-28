import Elysia from "elysia";
import { paystack } from "../../../middleware/paystack";
import { BillingConfig } from "./billingContent";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import Billing from "../model";
import { billingSchema } from "../setup";

const userAction = new Elysia()
    .use(paystack)
    .use(billingSchema)
    .use(isUser_Authenticated)
    .get("/pay/me", async ({set, user})=>{
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
                callback_url: `${process.env.ACTIVE_ORIGIN}/u/bills/${billing._id}/registration/none/none`,
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
                callback_url: `${process.env.ACTIVE_ORIGIN}/u/bills/${billing._id}/membership/${type}/${membershipConfig.duration}`,
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
                callback_url: `${process.env.ACTIVE_ORIGIN}/u/bills/${billing._id}/training/${type}/${duration}`,
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
        set,
        user, 
        query,
        params: { type, subType, duration }
    }) => {
        try {
            const getBilling = await Billing.findById(user._id);

            if (!getBilling) {
                set.status = 400;
                return {
                    message: 'User Billing not found',
                };
            }
            
            if (!query.tx_ref) {
                set.status = 400;
                return { message: "Transaction reference is missing" };
            }
            const paystackResponse = await paystack_VerifyTransaction(query.tx_ref);

            if (!paystackResponse.status) {
                set.status = 400;
                return { message: "Payment transaction error" };
            }


            const amount = paystackResponse.data.amount / 100;
            const date = new Date();

            // Update billing based on type
            if (type === 'registration') {
                await Billing.findByIdAndUpdate(getBilling._id, {
                    'bills.registrationBill': {
                        status: 'Paid',
                        date: date,
                        amount: amount
                    },
                });
            } else if (type === 'membership') {
            const membershipType = subType;
            const membershipConfig = BillingConfig.dues[membershipType as keyof typeof BillingConfig.dues];
                const durationMap = {
                    monthly: 1,
                    quarterly: 3,
                    biAnnually: 6,
                    yearly: 12
                };
                
                await Billing.findByIdAndUpdate(getBilling._id, {
                    'bills.membershipBill': {
                        status: 'Paid',
                        duration: durationMap[membershipType as keyof typeof BillingConfig.dues],
                        amount: amount,
                        renewAt: new Date(date.setMonth(date.getMonth() + durationMap[membershipType as keyof typeof BillingConfig.dues])),
                        gracePeriod: new Date(date.setDate(date.getDate() + 7)),
                        discount: membershipConfig.discount
                    }
                });
            } else if (type === 'training') {
            const trainingPackage = subType;
            const trainingConfig = BillingConfig.packages[trainingPackage as keyof typeof BillingConfig.packages];
                const trainingDuration = duration === '1month' ? 1 : 3;
                
                await Billing.findByIdAndUpdate(getBilling._id, {
                    'bills.trainingBill': {
                        status: 'Paid',
                        trainingType: trainingPackage,
                        duration: trainingDuration,
                        amount: amount,
                        renewAt: new Date(date.setMonth(date.getMonth() + trainingDuration)),
                        gracePeriod: new Date(date.setDate(date.getDate() + 7))
                    }
                });
            }

            // Update billing history
            await Billing.findByIdAndUpdate(getBilling._id, {
                $push: {
                    billingHistory: {
                        name: type,
                        date: date,
                        amount: amount,
                        status: 'Paid'
                    }
                }
            });

            set.status = 200;
            return { message: "Payment callback received" };
        } catch (err) {
            console.error("Error checking payment status:", err);
            set.status = 500;
            return { message: "Error during payment validation check" };
        }
    }, {
        body: "billingSchema"
    });

export default userAction;