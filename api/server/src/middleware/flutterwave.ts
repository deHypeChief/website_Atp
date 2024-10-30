import Elysia from "elysia";
import flw from "../config/flutterwave.config";

export const flutterwave = (app: Elysia) => app
    .derive(async function handler({ set }) {

        async function flwPay(payConfig: {}){
            const flwResponse = await flw.post("/payments", payConfig)
            return flwResponse.data
        }

        return {
            flwPay
        }
    })