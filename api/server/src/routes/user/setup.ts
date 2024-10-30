import Elysia, { t } from "elysia";

export const userSchemas = new Elysia().model({
    signUpSchema: t.Object({
        username: t.String({
            minLength: 2,
            error: {
                message: "No username provided"
            }
        }),
        password: t.String({
            minLength: 2,
            error: {
                message: "No password provided"
            }
        }),
        email: t.String({
            error: {
                message: "No email provided"
            }
        }),
        fullName: t.String({
            error: {
                message: "No name provided"
            }
        }),
        phoneNumber: t.String({
            error: {
                message: "No phone number provided"
            }
        }),
        dob: t.Date({
            error: {
                message: "No date of birth provided"
            }
        }),
        level: t.String({
            error: {
                message: "No level provided"
            }
        })
    }),
    loginSchema: t.Object({
        password: t.String({
            error: {
                message: "No password provided"
            }
        }),
        email: t.String({
            error: {
                message: "No email provided"
            }
        })
    })
})