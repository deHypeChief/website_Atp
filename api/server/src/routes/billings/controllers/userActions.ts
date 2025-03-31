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
            const getBilling = await Billing.findOne({ user: user._id });

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

            // Check if this transaction was already processed
            const existingTransaction = getBilling.billingHistory.find(
                history => history.transactionRef === query.tx_ref
            );

            if (existingTransaction) {
                set.status = 400;
                return { message: "Transaction has already been processed" };
            }

            const paystackResponse = await paystack_VerifyTransaction(query.tx_ref);

            if (!paystackResponse.status) {
                set.status = 400;
                return { message: "Payment transaction error" };
            }

            const amount = paystackResponse.data.amount / 100;
            const date = new Date();
            let notificationTitle = "";
            let notificationMessage = "";
            let emailTitle = "";
            let emailContent = "";

            // Update billing based on type
            if (type === 'registration') {
                if (getBilling.bills.registrationBill.status === 'Paid') {
                    set.status = 400;
                    return { message: "Registration fee already paid" };
                }
                await Billing.findByIdAndUpdate(getBilling._id, {
                    'bills.registrationBill': {
                        status: 'Paid',
                        date: date,
                        amount: amount
                    },
                });

                notificationTitle = "Registration Payment Successful";
                notificationMessage = `Your registration fee of ${amount} has been received. Welcome to ATP!`;
                emailTitle = "ATP Registration Confirmed";
                emailContent = `
                    <div class="content">
                        <h2>ATP Registration Successful</h2>
                        <p>Hi ${user.fullName},</p>
                        <p>Thank you for completing your registration with ATP. Your payment of ${amount} has been confirmed.</p>
                        <br/>
                        <p>You now have full access to ATP services. We're excited to have you join our tennis community!</p>
                        <p>Log in to your account to set up your profile and start exploring everything ATP has to offer.</p>
                        <br/>
                        <p>If you have any questions, please don't hesitate to contact our support team.</p>
                        <p>Welcome to the ATP family!</p>
                    </div>
                `;
            } else if (type === 'membership') {
                const membershipType = subType;
                const membershipConfig = BillingConfig.dues[membershipType as keyof typeof BillingConfig.dues];
                const durationMap = {
                    monthly: 1,
                    quarterly: 3,
                    biAnnually: 6,
                    yearly: 12
                };
                const durationMonths = durationMap[membershipType as keyof typeof BillingConfig.dues];
                const renewDate = new Date(date);
                renewDate.setMonth(renewDate.getMonth() + durationMonths);

                const gracePeriodDate = new Date(renewDate);
                gracePeriodDate.setDate(gracePeriodDate.getDate() + 7);

                await Billing.findByIdAndUpdate(getBilling._id, {
                    'bills.membershipBill': {
                        status: 'Paid',
                        duration: durationMonths,
                        amount: amount,
                        renewAt: renewDate,
                        gracePeriod: gracePeriodDate,
                        discount: membershipConfig.discount
                    },
                    isMember: true
                });

                notificationTitle = "Membership Payment Successful";
                notificationMessage = `Your ${membershipType} membership has been activated. Valid until ${renewDate.toLocaleDateString()}.`;
                emailTitle = "ATP Membership Confirmed";
                emailContent = `
                    <div class="content">
                        <h2>Your ATP Membership is Active!</h2>
                        <p>Hi ${user.fullName},</p>
                        <p>Great news! Your payment of ${amount} for the ${membershipType} membership plan has been processed successfully.</p>
                        <br/>
                        <p><strong>Membership Details:</strong></p>
                        <ul>
                            <li>Plan: ${membershipType} membership</li>
                            <li>Duration: ${durationMonths} month${durationMonths > 1 ? 's' : ''}</li>
                            <li>Valid until: ${renewDate.toLocaleDateString()}</li>
                            ${membershipConfig.discount ? `<li>Applied discount: ${membershipConfig.discount}%</li>` : ''}
                        </ul>
                        <br/>
                        <p>As a valued member, you now have access to exclusive content, special events, and member-only benefits.</p>
                        <p>We'll send you a reminder before your membership expires on ${renewDate.toLocaleDateString()}.</p>
                        <br/>
                        <p>Thank you for your support, and welcome to the ATP membership community!</p>
                    </div>
                `;
            } else if (type === 'training') {
                const trainingPackage = subType;
                const trainingConfig = BillingConfig.packages[trainingPackage as keyof typeof BillingConfig.packages];
                const trainingDuration = duration === '1month' ? 1 : 3;

                const renewDate = new Date(date);
                renewDate.setMonth(renewDate.getMonth() + trainingDuration);

                const gracePeriodDate = new Date(renewDate);
                gracePeriodDate.setDate(gracePeriodDate.getDate() + 7);

                await Billing.findByIdAndUpdate(getBilling._id, {
                    'bills.trainingBill': {
                        status: 'Paid',
                        trainingType: trainingPackage,
                        duration: trainingDuration,
                        amount: amount,
                        renewAt: renewDate,
                        gracePeriod: gracePeriodDate
                    }
                });

                notificationTitle = "Training Package Activated";
                notificationMessage = `Your ${trainingPackage} training package (${trainingDuration} month${trainingDuration > 1 ? 's' : ''}) is now active!`;
                emailTitle = "ATP Training Package Confirmed";
                emailContent = `
                    <div class="content">
                        <h2>Your ATP Training Package is Ready</h2>
                        <p>Hi ${user.fullName},</p>
                        <p>Your payment of ${amount} for the ${trainingPackage} training package has been confirmed.</p>
                        <br/>
                        <p><strong>Training Package Details:</strong></p>
                        <ul>
                            <li>Package: ${trainingPackage}</li>
                            <li>Duration: ${trainingDuration} month${trainingDuration > 1 ? 's' : ''}</li>
                            <li>Valid until: ${renewDate.toLocaleDateString()}</li>
                        </ul>
                        <br/>
                        <p>Your training materials and resources are now available in your account. Log in to access your personalized training schedule and materials.</p>
                        <p>Our coaches look forward to working with you on improving your tennis skills!</p>
                        <br/>
                        <p>If you have any questions about your training package, please contact our coaching team.</p>
                    </div>
                `;
            }

            // Update billing history with transaction reference
            await Billing.findByIdAndUpdate(getBilling._id, {
                $push: {
                    billingHistory: {
                        name: type,
                        date: date,
                        amount: amount,
                        status: 'Paid',
                        transactionRef: query.tx_ref
                    }
                }
            });

            // Create notification
            await Notify.create({
                userID: user._id,
                title: notificationTitle,
                message: notificationMessage,
                type: "success"
            });

            // Send email
            mailConfig(
                user.email,
                emailTitle,
                generateAtpEmail({
                    title: emailTitle,
                    content: emailContent
                })
            );

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