import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";
import Plan from "../model";
import Coach from "../../coach/model";
import dayjs from "dayjs";
import User from "../../user/model";
import { sendMail } from "../../../middleware/sendMail";
import Notify from "../../notifications/model";

const adminHandlePlan = new Elysia({
    prefix: "/admin"
})
    .use(isAdmin_Authenticated)
    .use(sendMail)
    .post("/createPlan", async ({ set, body }) => {
        const { planType, planName, priceInfo, description, note, planImage, planPrice, filterPrams } = body;

        try {
            
            const existingPlan = await Plan.findOne({ planName });

            if (existingPlan) {
                set.status = 400;
                return { message: "This plan name is already taken" };
            }

            const newPlan = await Plan.create({
                planType,
                planName,
                priceInfo,
                description,
                note: note == "" ? "" : note,
                planImage,
                planPrice,
                filterPrams
            });

            return { message: "Plan created successfully", plan: newPlan }

        } catch (err) {
            set.status = 500;
            console.log(err);
            return { message: "Error while creating plan" };
        }
    })
    .post("/createBillingPlan/:planId", async ({ set, body, params: { planId } }) => {
        const { billingName, interval, currency, discountPercentage } = body;

        try {

            // Ensure interval and amount are positive numbers
            if (parseInt(interval) <= 0) {
                set.status = 400;
                return { message: "Interval must be a positive number" };
            }

            // Check if the plan exists in the database
            const existingPlan = await Plan.findById(planId);

            if (!existingPlan) {
                set.status = 404;
                return { message: "Plan not found" };
            }


            const monthlyBasePrice = existingPlan.planPrice// assuming a base monthly price
            const basePrice = monthlyBasePrice * parseInt(interval);

            // Apply discount
            const discountFactor = discountPercentage ? (1 - discountPercentage / 100) : 1;
            const billingPrice = basePrice * discountFactor;


            // Add the billing plan to the existing plan's billingPlans array
            existingPlan.billingPlans.push({
                billingName,
                interval: parseInt(interval),
                currency,
                discountPercentage,
                billingPrice
            });

            // Save the updated plan
            await existingPlan.save();

            return { message: "Billing plan created successfully", plan: existingPlan };

        } catch (err) {
            // Log and return server error
            set.status = 500;
            console.log(err);
            return { message: "Error while creating billing plan", error: err.message };
        }
    })
    .get('/deletePlan', async ({ set, params: { title } }) => {
        const delPlan = await Plan.findOneAndDelete({ title })

        if (delPlan) {
            set.status = 200
            return {
                message: "Plan deleted",
                data: delPlan
            }
        }
    })

export default adminHandlePlan;
