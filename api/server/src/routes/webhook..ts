import Elysia from "elysia";
import crypto from 'crypto';
import User from "./user/model";
import Billing from "./billings/model";
import Notify from "./notifications/model";
import { sendMail } from "../middleware/sendMail";
import { Subscription } from "./subscriptions/model";
import CoachAssignment from "./coachAssigments/model";

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
    try {
        // Assuming format like: "hype7-training-regular-1month-1743438416284"
        const parts = reference.split('-');

        // Default values
        let paymentType = 'unknown';
        let planType = 'unknown';
        let duration = 1;

        if (parts.length >= 2) {
            paymentType = parts[1]; // "training"
        }

        if (parts.length >= 3) {
            planType = parts[2]; // "regular"
        }

        if (parts.length >= 4 && parts[3].includes('month')) {
            // Extract the numeric part from strings like "1month"
            const durationMatch = parts[3].match(/(\d+)month/);
            if (durationMatch && durationMatch[1]) {
                duration = parseInt(durationMatch[1]);
            }
        }

        return {
            paymentType,
            planType,
            duration
        };
    } catch (error) {
        console.error('Error parsing reference:', error);
        return {
            paymentType: 'unknown',
            planType: 'unknown',
            duration: 1
        };
    }
}

async function handleChargeSuccess(data: any, mailConfig: any, generateAtpEmail: any) {
    const { reference, amount, customer } = data;
    const amountInNaira = amount / 100; // Convert kobo to naira
    console.log(data)

    const user = await User.findOne({ email: customer.email }) as { _id: string; email: string; fullName: string };

    try {
        // Parse the reference to determine payment details
        const { paymentType, planType, duration } = parseReference(reference);
        console.log(`Payment: Type=${paymentType}, Plan=${planType}, Duration=${duration} months`);

        // Find the user by email

        if (!user) {
            console.error(`User not found for email: ${customer.email}`);
            return;
        }

        // Find the billing record
        const billing = await Subscription.findOne({ user: user._id });

        if (!billing) {
            console.error(`Subscription record not found for user: ${user._id}`);
            return;
        }

        let billName = '';

        switch (paymentType.toLowerCase()) {
            case 'membership':
                // Update membership bill
                billing.membership.status = 'Paid';
                // Map planType string to allowed literal types
                const allowedPlans = ["monthly", "quarterly", "yearly", "none"] as const;
                billing.membership.plan = allowedPlans.includes(planType as any) ? planType as typeof allowedPlans[number] : "none";

                // Calculate renewal date based on membership duration
                const renewalDate = new Date();
                renewalDate.setMonth(renewalDate.getMonth() + duration);
                billing.membership.endDate = renewalDate;

                // Calculate grace period (7 days after renewal)
                const gracePeriod = new Date(renewalDate);
                gracePeriod.setDate(gracePeriod.getDate() + 7);
                billing.membership.gracePeriod = gracePeriod;

                billName = `${planType.charAt(0).toUpperCase() + planType.slice(1)} Membership (${duration} month${duration > 1 ? 's' : ''})`;
                break;

            case 'training':
                billing.training.status = 'Paid';
                const allowedTrainingPlans = ["none", "regular", "standard", "premium", "family", "couples"] as const;
                billing.training.plan = allowedTrainingPlans.includes(planType as any) ? planType as typeof allowedTrainingPlans[number] : "none";


                // Calculate renewal date based on training duration
                const trainingRenewalDate = new Date();
                trainingRenewalDate.setMonth(trainingRenewalDate.getMonth() + duration);
                billing.training.endDate = trainingRenewalDate;

                // Calculate grace period (7 days after renewal)
                const trainingGracePeriod = new Date(trainingRenewalDate);
                trainingGracePeriod.setDate(trainingGracePeriod.getDate() + 7);
                billing.training.gracePeriod = trainingGracePeriod;

                billName = `${planType.charAt(0).toUpperCase() + planType.slice(1)} Training (${duration} month${duration > 1 ? 's' : ''})`;

                //create a coach assignment for the user and send a coach assignment notification
                const coachAssignment = await CoachAssignment.create({
                    status: "Pending",
                    playerId: user._id.toString()
                });
                if (!coachAssignment) {
                    console.error(`Failed to create coach assignment for user: ${user._id}`);
                    return;
                }
                await Notify.create({
                    userID: user._id,
                    title: "Coach Assignment Pending",
                    message: "Your training payment was successful. A coach will be assigned to you shortly.",
                    type: "info"
                });
                break;

            default:
                console.log(`Unknown payment type: ${paymentType}`);
                billName = `Payment (${reference})`;
        }

        // Add to billing history
        billing.paymentHistory.push({
            type: paymentType,
            date: new Date(),
            amount: amountInNaira,
            status: 'paid',
            transactionRef: reference
        });

        await billing.save();

        // Send notification
        await Notify.create({
            userID: user._id,
            title: "Payment Successful",
            message: `Your payment of ₦${amountInNaira.toLocaleString()} for ${billName} was successful.`,
            type: "success"
        });

        // Send email notification
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
        // Create error notification
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