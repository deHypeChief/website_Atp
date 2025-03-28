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
            const paystackResponse = await PAYSTACK.post("/transaction/initialize", payConfig)
            console.log(payConfig)
            return paystackResponse.data
        }

        async function paystack_VerifyTransaction(reference: string) {
            const paystackResponse = await PAYSTACK.get(`/transaction/verify/${reference}`)
            return paystackResponse.data
        }

        return {
            paystack_Transaction,
            paystack_VerifyTransaction
        }
    })