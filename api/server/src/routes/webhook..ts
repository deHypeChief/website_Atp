import Elysia from "elysia";
import crypto from 'crypto';
import User from "./user/model";
import Notify from "./notifications/model";
import { sendMail } from "../middleware/sendMail";
import { Subscription } from "./subscriptions/model";
import CoachAssignment from "./coachAssigments/model";
import Transaction from "./transactions/model";

const verifySignature = (signature: string, payload: any, secretKey: string): boolean => {
    const hash = crypto.createHmac('sha512', secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');

    return hash === signature;
};

const webhook = new Elysia({
    prefix: "/webhook",
})
    .use(sendMail)
    .post("/paystack", async ({ set, headers, body, mailConfig, generateAtpEmail }) => {
        try {
            const signature = headers['x-paystack-signature'];
            const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

            if (!signature || !PAYSTACK_SECRET_KEY) {
                set.status = 401
                return { error: 'Invalid signature or missing secret key' };
            }

            // Verify the signature
            const isValidSignature = verifySignature(signature, body, Bun.env.PAYSTACK_SECRET_KEY as string);

            if (!isValidSignature) {
                set.status = 401
                return { error: 'Invalid signature' };
            }

            // Extract the event and data
            const { event, data } = body;
            console.log(event)


            // Process different event types
            switch (event) {
                case 'charge.success':
                    await handleChargeSuccess(data, mailConfig, generateAtpEmail);
                    break;


                default:
                    console.log(`Unhandled event type: ${event}`);
            }

            set.status = 200;
            return { message: "Webhook Response Successful" };
        } catch (err) {
            console.error('Error processing webhook:', err);
            set.status = 500;
            return { message: "Error during webhook response" };
        }
    })

export default webhook

function parseReference(reference: string) {
    // asher04-membership-monthly-1751175591198
    // asher04-membership-quarterly-1751175683345
    // asher04-membership-yearly-1751175683345

    // asher04-training-standard-1months-1751175764059
    // asher04-training-standard-3months-1751175764059
    try {
        console.log(`DEBUG: parseReference called with: "${reference}"`);
        const parts = reference.split('-');
        console.log(`DEBUG: Split parts:`, parts);

        let paymentType = 'unknown';
        let planType = 'unknown';
        let duration = 1;

        if (parts.length >= 2) {
            paymentType = parts[1];
        }

        if (parts.length >= 3) {
            planType = parts[2];
        }

        console.log(`DEBUG: Initial values - paymentType: "${paymentType}", planType: "${planType}"`);

        // For membership plans, duration is determined by the plan type (parts[2])
        // For training plans, duration might be in parts[3]
        if (paymentType.toLowerCase() === 'membership') {
            console.log(`DEBUG: Processing membership plan`);
            // Handle membership duration based on plan type
            switch (planType.toLowerCase()) {
                case 'monthly':
                    duration = 1;
                    break;
                case 'quarterly':
                    duration = 3;
                    break;
                case 'yearly':
                    duration = 12;
                    break;
                default:
                    duration = 1;
                    break;
            }
            console.log(`DEBUG: Membership duration set to: ${duration}`);
        } else if (paymentType.toLowerCase() === 'training' && parts.length >= 4) {
            console.log(`DEBUG: Processing training plan`);
            // For training, check parts[3] for duration
            const durationPart = parts[3];
            console.log(`DEBUG: Training duration part: "${durationPart}"`);

            // Match formats like "1months" or "3months"
            const numericMonthMatch = durationPart.match(/(\d+)months?/);
            console.log(`DEBUG: Numeric match result:`, numericMonthMatch);
            
            if (numericMonthMatch && numericMonthMatch[1]) {
                duration = parseInt(numericMonthMatch[1]);
                console.log(`DEBUG: Training duration parsed from numeric: ${duration}`);
            } else {
                // Handle word-based durations for training
                switch (durationPart.toLowerCase()) {
                    case 'monthly':
                        duration = 1;
                        break;
                    case 'quarterly':
                        duration = 3;
                        break;
                    case 'yearly':
                        duration = 12;
                        break;
                    default:
                        duration = 1;
                        break;
                }
                console.log(`DEBUG: Training duration set from word-based: ${duration}`);
            }
        } else {
            console.log(`DEBUG: No special processing - paymentType: "${paymentType}", parts.length: ${parts.length}`);
        }

        const result = {
            paymentType,
            planType,
            duration
        };
        console.log(`DEBUG: Final parseReference result:`, result);
        return result;
    } catch (error) {
        console.error('Error parsing reference:', error);
        return {
            paymentType: 'unknown',
            planType: 'unknown',
            duration: 1
        };
    }
}


function addGracePeriod(date: Date, days: number = 7): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

async function handleChargeSuccess(data: any, mailConfig: any, generateAtpEmail: any) {
    const { reference, amount, customer } = data;
    const amountInNaira = amount / 100;

    console.log(`DEBUG: Webhook received data:`, JSON.stringify(data, null, 2));
    console.log(`DEBUG: Reference from webhook: "${reference}"`);

    const user = await User.findOne({ email: customer.email }) as { _id: string; email: string; fullName: string };

    try {
        console.log(`DEBUG: Processing reference: "${reference}"`);
        const { paymentType, planType, duration } = parseReference(reference);
        console.log(`DEBUG: Parsed result - Type=${paymentType}, Plan=${planType}, Duration=${duration} months`);

        if (!user) {
            console.error(`User not found for email: ${customer.email}`);
            return;
        }

        const billing = await Subscription.findOne({ user: user._id });

        if (!billing) {
            console.error(`Subscription record not found for user: ${user._id}`);
            return;
        }

        let billName = '';
        let pType = "ticket";
        const normalizedPlanType = planType.toLowerCase();

        switch (paymentType.toLowerCase()) {
            case 'membership': {
                billing.membership.status = 'Paid';
                const allowedPlans = ["monthly", "quarterly", "yearly", "none"] as const;
                billing.membership.plan = allowedPlans.includes(normalizedPlanType as any)
                    ? normalizedPlanType as typeof allowedPlans[number]
                    : "none";

                const renewalDate = new Date();
                renewalDate.setMonth(renewalDate.getMonth() + duration);
                billing.membership.endDate = renewalDate;
                billing.membership.gracePeriod = addGracePeriod(renewalDate);

                const label = billing.membership.plan === "none" ? "Basic" : capitalize(billing.membership.plan);
                billName = `${label} Membership (${duration} month${duration > 1 ? 's' : ''})`;

                pType = "membership";
                break;
            }

            case 'training': {
                billing.training.status = 'Paid';
                const allowedTrainingPlans = ["none", "regular", "standard", "premium", "family", "couples"] as const;
                billing.training.plan = allowedTrainingPlans.includes(normalizedPlanType as any)
                    ? normalizedPlanType as typeof allowedTrainingPlans[number]
                    : "none";

                const trainingRenewalDate = new Date();
                trainingRenewalDate.setMonth(trainingRenewalDate.getMonth() + duration);
                billing.training.endDate = trainingRenewalDate;
                billing.training.gracePeriod = addGracePeriod(trainingRenewalDate);

                const label = billing.training.plan === "none" ? "Basic" : capitalize(billing.training.plan);
                billName = `${label} Training (${duration} month${duration > 1 ? 's' : ''})`;

                pType = "training";

                try {
                    const coachAssignment = await CoachAssignment.create({
                        status: "Pending",
                        playerId: user._id.toString()
                    });

                    if (coachAssignment) {
                        await Notify.create({
                            userID: user._id,
                            title: "Coach Assignment Pending",
                            message: "Your training payment was successful. A coach will be assigned to you shortly.",
                            type: "info"
                        });
                    } else {
                        console.warn(`Coach assignment not created for user: ${user._id}`);
                    }
                } catch (coachErr) {
                    console.error(`Error assigning coach for user ${user._id}:`, coachErr);
                }

                break;
            }

            default: {
                console.log(`Unknown payment type: ${paymentType}`);
                billName = `Payment (${reference})`;
                break;
            }
        }

        billing.paymentHistory.push({
            type: paymentType,
            date: new Date(),
            amount: amountInNaira,
            status: 'paid',
            transactionRef: reference
        });

        await billing.save();

        await Transaction.create({
            amount: amountInNaira,
            type: pType,
            date: new Date(),
            status: "Complete",
            user: user._id
        });

        await Notify.create({
            userID: user._id,
            title: "Payment Successful",
            message: `Your payment of ₦${amountInNaira.toLocaleString()} for ${billName} was successful.`,
            type: "success"
        });

        mailConfig(
            user.email,
            "Payment Confirmation",
            generateAtpEmail({
                title: "Payment Successful",
                content: `
                <p>Hi ${user.fullName},</p>
                <p>Your payment of <strong>₦${amountInNaira.toLocaleString()}</strong> for ${billName} has been successfully processed.</p>
                <p>Transaction Reference: ${reference}</p>
                <p>Thank you for your payment!</p>
              `
            })
        );

        console.log(`Successfully processed payment for ${user.fullName}: ${billName}, Amount: ₦${amountInNaira}`);

    } catch (error) {
        if (user) {
            await Notify.create({
                userID: user._id,
                title: "Payment Processing Error",
                message: "We encountered an issue processing your payment. Please contact support for assistance.",
                type: "error"
            }).catch(notifyErr => console.error("Failed to create error notification:", notifyErr));
        }
        console.error('Error handling charge.success:', error);
    }
}

function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
