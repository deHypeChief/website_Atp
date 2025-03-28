import Elysia, { t } from "elysia";

export const billingSchema = new Elysia().model({
    billingSchema: t.Object({
        tx_ref: t.String({
            error: {
                message: "No transaction reference provided",
            },
        }),
        type: t.String({
            error: {
                message: "No type provided",
            },
        }),
        membershipType: t.String({
            error: {
                message: "No membership type provided",
            },
        }),
        trainingPackage: t.String({
            error: {
                message: "No training package provided",
            },
        }),
        duration: t.Number({
            error: {
                message: "No duration provided",
            },
        })
    })
})