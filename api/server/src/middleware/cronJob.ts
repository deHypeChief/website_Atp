import {cron, Patterns } from "@elysiajs/cron";
import Elysia from "elysia";
import axios from "axios"; // Use axios or any HTTP client to call the endpoint
import { sendMail } from "./sendMail";

export const membershipJob = new Elysia({
    name: "cron_Membership"
})
    .use(
        cron({
            name: 'membershipCleanup',
            pattern: Patterns.EVERY_DAY_AT_MIDNIGHT, // Runs daily at midnight; adjust as necessary
            async run() {
                console.log('Running membership cleanup job...');
                try {
                    // Call the existing endpoint to remove expired memberships
                    const response = await axios.post(`${process.env.ACTIVE_API_ORIGIN}/jobs/removeExpiredMemberships`);
                    
                    console.log('Membership Cleanup')
                    console.log(response.data.message);
                } catch (err) {
                    console.error("Error while calling the removeExpiredMemberships endpoint:", err);
                }
            }
        })
    );
