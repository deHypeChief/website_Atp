import Elysia, { t } from 'elysia'

export const createAdminModel = new Elysia().model({
    createAdminModel: t.Object({
        adminName: t.String({
            error: {
                message: "No admin name provided"
            }
        }),
        pin: t.String({
            minLength: 6,
            error(error) {
                return {
                    message: "Pin must be more than 6 chars"
                }
            }
        }),
        adminEmail: t.String({
            format: 'email',
            error: {
                message: "An email is required"
            }
        })
    })
});


export const loginAdminModel = new Elysia().model({
    loginAdminModel: t.Object({
        adminEmail: t.String({
            format: 'email',
            error: {
                message: "Email not provided"
            }
        }),
        pin: t.String({
            error(error) {
                return {
                    message: "Pin not provided"
                }
            }
        })
    })
})
