import Elysia from "elysia";
import Match from "../model";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import Tournament from "../../tournament/model";
import Notify from "../../notifications/model";
import { sendMail } from "../../../middleware/sendMail";
import { paystack } from "../../../middleware/paystack";
import Transaction from "../../transactions/model";

const createMatch = new Elysia()
    .use(paystack)
    .use(isUser_Authenticated)
    .use(sendMail)
    .get("/getUserMatches", async ({ set, user }) => {
        try {
            // Find matches for the authenticated user
            const matches = await Match.find({ user: user._id }).populate("tournament");

            // Initialize counters for match wins and each medal type
            let matchCount = 0;
            let goldCount = 0;
            let silverCount = 0;
            let bronzeCount = 0;

            // Loop through each match to count wins and each medal type
            matches.forEach((item) => {
                if (item.won) {
                    matchCount += 1;
                }
                // Count each medal type
                if (item.medal === "gold") {
                    goldCount += 1;
                } else if (item.medal === "silver") {
                    silverCount += 1;
                } else if (item.medal === "bronze") {
                    bronzeCount += 1;
                }
            });

            // Send successful response with match data and medal counts
            set.status = 200;
            return {
                message: "Matches found",
                matches,
                matchesWon: matchCount,
                medals: {
                    gold: goldCount,
                    silver: silverCount,
                    bronze: bronzeCount
                }
            };
        } catch (err) {
            console.log(err);
            set.status = 500;
            return {
                message: "Error retrieving matches" // Updated error message for clarity
            };
        }
    })
    .get("/:tournament/matchCallback", async ({
        paystack_VerifyTransaction,
        generateAtpEmail,
        mailConfig,
        set,
        user,
        query,
        params: { tournament }
    }) => {
        try {
            const existingMatch = await Match.findOne({ tournament, user: user._id });
            const tour = await Tournament.findById(tournament);

            if (existingMatch) {
                set.status = 200;
                return { message: "You have already registered for the tournament" };
            }

            if (!tour) {
                set.status = 404;
                return { message: "Tournament not found" };
            }

            if (!query.tx_ref) {
                set.status = 400;
                return { message: "Transaction reference is missing" };
            }
            const paystackResponse = await paystack_VerifyTransaction(query.tx_ref);

            if (!paystackResponse.status) {
                set.status = 400;
                return { message: "Payment transaction error" };
            }

            const match = new Match({
                tournament,
                user,
                flutterPaymentId: query.tx_ref,
            });

            await match.save();

            await Transaction.create({
                amount: tour.price,
                type: "Tournament Registration",
                date: new Date(),
                status: "Complete",
                user: user._id
            })
            await Notify.create({
                userID: user._id,
                title: `Tournament Registration Successful 🎉`,
                message: `Hey ${user.fullName}, you've successfully registered for the ${tour?.name}! Your unique registration code is: ${match.token}. Keep this code safe as it will be required to participate. Best of luck in the tournament! 🏆`,
                type: "info"
            });

            mailConfig(
                user.email,
                `The ATP Tournament! 🏅: ${tour?.name}`,
                generateAtpEmail({
                    title: "You're Officially Registered for the ATP Tournament! 🏅",
                    content: `
                        <p>Hi ${user.fullName},</p>
                        <p>We're excited to confirm that you've successfully registered for the <strong>${tour?.name}</strong> tournament! 🎉</p>
                        <p>Your unique tournament code is:</p>
                        <br/>
                        <h1 style="color: #FFD60A; font-size: 4rem">${match.token}</h1>
                        <br/>
                        <p>Please keep this code safe as you'll need it to join the tournament and check your match updates.</p>
                        <p>If you have any questions, feel free to reach out. We can't wait to see you in action! 💪</p>
                        <br/>
                        <p>Good luck and may the best player win!</p>
                        <p>Best regards,</p>
                        <p>The ATP Tournament Team</p>
                    `
                })
            );

            set.status = 201;
            return {
                message: "Ticket registration successfully",
                match,
                tournament: tour,
                user
            };

        } catch (err) {
            console.error("Error creating match:", err);
            set.status = 500;
            return { message: "Error during match registration" };
        }
    })
    .post("/matchCheck", async ({ set, body }) => {
        const { tournament, user } = body;

        try {
            const existingMatch = await Match.findOne({ tournament, user })
                .populate("user")
                .populate("tournament");

            if (existingMatch) {
                set.status = 200;
                return {
                    message: "User is already registered for this match.",
                    match: existingMatch
                };
            }

            set.status = 200;
            return { message: "User not found" };

        } catch (err) {
            console.error("Error checking match:", err);
            set.status = 500;
            return { message: "Error during match check" };
        }
    })

export default createMatch;