import Elysia, { t } from "elysia";

export const createPlanModel = new Elysia().model({
    createPlanModel: t.Object({
        title: t.String({
            error: {
                message: "No title provided"
            }
        }),
        price: t.String({
            error: {
                message: "The plan needs a price"
            }
        }),
        info: t.String({
            error: {
                message: "No info provided"
            }
        }),
        activePerks: t.String({
            error: {
                message: "Add an active feature for the plan"
            }
        }),
        inActivePerks: t.String({
            error: {
                message: "Add what they are missing out on"
            }
        }),
    })
})
