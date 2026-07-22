import Elysia from "elysia";
import PAYSTACK from "../config/paystack.config";


export const paystack = (app: Elysia) => app
    .derive(async function handler({ set }) {

        async function paystack_Transaction(payConfig: {
            amount: string,
            email: string,
            currency?: string,
            reference?: string,
            callback_url?: string
        }) {
            if (!process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_")) {
                throw new Error("PAYSTACK_SECRET_KEY must be a Paystack secret key (sk_test_... or sk_live_...).");
            }
            const paystackResponse = await PAYSTACK.post("/transaction/initialize", payConfig)
            return paystackResponse.data
        }

        async function paystack_VerifyTransaction(reference: string) {
            const paystackResponse = await PAYSTACK.get(`/transaction/verify/${reference}`)
            return paystackResponse.data
        }

        // for auto renewal subscriptions
        async function paystack_Transaction_Subscriptions(payConfig: {
            amount: string,
            email: string,
            authorization_code: string,
        }) {
            if (!process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_")) {
                throw new Error("PAYSTACK_SECRET_KEY must be a Paystack secret key (sk_test_... or sk_live_...).");
            }
            const paystackResponse = await PAYSTACK.post("/transaction/charge_authorization", payConfig)
            return paystackResponse.data
        }


        return {
            paystack_Transaction,
            paystack_VerifyTransaction,
            paystack_Transaction_Subscriptions
        }
    })
