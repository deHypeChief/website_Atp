import Elysia from "elysia";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import Tournament from "../model";
import { paystack } from "../../../middleware/paystack";

const registerTour = new Elysia()
    .use(isUser_Authenticated)
    .use(paystack)
    .get("/register/:tourId", async ({ paystack_Transaction, set, user, params: { tourId } }) => {
        try {
            const tour = await Tournament.findById(tourId);
            console.log(tour)

            if (!tour) {
                set.status = 400;
                return {
                    message: "Invalid tour ID"
                };
            }

            const paystackResponse = await paystack_Transaction({
                reference: `${user.username}-ticket-${Date.now()}`,
                amount: (Number(tour.price) * 100).toString(),
                currency: "NGN",
                callback_url: `${process.env.ACTIVE_ORIGIN}/u/ticket/${tourId}`,
                email: user.email,
            })

            // Returning the response to the client
            set.status = 200;
            return {
                paystackResponse
            };

        } catch (err) {
            // Error handling and logging
            set.status = 500;
            console.log(err)
            return { message: "Error while making payment", error: err };
        }
    });


export default registerTour