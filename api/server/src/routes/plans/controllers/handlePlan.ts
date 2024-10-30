import Elysia from "elysia";
import Plan from "../model";

const plans = new Elysia()
    .get("/getPlans", async ({ set }) => {
        try {
            const plans = await Plan.find()

            set.status = 200
            return {
                message: "Plans found",
                plans
            }
        } catch (err) {
            set.status = 500;
            console.log(err)
            return { message: "Error while getting " };
        }
    })
    .get("/getPlans/:planType", async ({ set, params: { planType } }) => {
        try {
            const plans = planType === "all" ? await Plan.find() : await Plan.find({ planType });

            set.status = 200;
            return {
                message: `Plans found${planType !== "all" ? ` with ${planType} type` : ""}`,
                plans
            };
        } catch (err) {
            set.status = 500;
            console.log(err)
            return { message: "Error while getting plans" };
        }
    })

export default plans