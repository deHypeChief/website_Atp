import Elysia from "elysia";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import Tournament from "../model";
import flw from "../../../config/flutterwave.config";
import { flutterwave } from "../../../middleware/flutterwave";

const registerTour = new Elysia()
    .use(isUser_Authenticated)
    .use(flutterwave)
    .get("/register/:tourId", async ({flwPay, set, user, params: { tourId } }) => {
        try {
            const tour = await Tournament.findById(tourId);

            if (!tour) {
                set.status = 400;
                return {
                    message: "Invalid tour ID"
                };
            }

            const flwResponse = await flwPay({
                tx_ref: `${user.username}-${Date.now()}`,
                amount: parseFloat(tour.price),
                currency: "NGN",
                redirect_url: `${process.env.ACTIVE_ORIGIN}/u/ticket/${tourId}`,
                customer: {
                    email: user.email,
                    name: user.fullName,
                    phonenumber: user.phoneNumber
                },
                customizations: {
                    title: tour.name.toUpperCase(),
                }
            })

            // Returning the response to the client
            set.status = 200;
            return {
                flwResponse
            };

        } catch (err) {
            // Error handling and logging
            set.status = 500;
            console.log(err)
            return { message: "Error while making payment", error: err };
        }
    });


export default registerTour