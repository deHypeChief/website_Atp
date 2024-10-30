import Elysia from "elysia";
import { oauth2 } from "elysia-oauth2";
import User from "../model";
import { jwtUser } from "../../../middleware/jwt";

const socialAuth = new Elysia({
    prefix: "/social"
})
    .use(jwtUser)
    .use(
        oauth2({
            Google: [
                Bun.env.GOOGLE_CLIENT_ID as string,       // Replace with your actual client ID
                Bun.env.GOOGLE_CLIENT_SECRET as string,   // Replace with your actual client secret
                `http://localhost:${Bun.env.PORT || 3002}/social/google/callback`,
            ],
        })
    )
    .get("/google", async ({ oauth2, redirect, cookie }) => {
        const url = await oauth2.createURL("Google");
        
        // Log the generated state before redirect
        console.log("Generated state: ", url.searchParams.get("state"));

        // Add the "email" and "profile" scopes explicitly
        url.searchParams.set("scope", "openid profile email");
        url.searchParams.set("access_type", "offline");
        
        return redirect(url.href);
    })
    .get("/google/callback", async ({ oauth2, query, cookie, userJwt }) => {
        const stateFromQuery = query.state;
        const stateFromCookie = cookie.state.value;
        
        // Log both states to debug the mismatch
        console.log("State from query: ", stateFromQuery);
        console.log("State from cookie: ", stateFromCookie);

        if (stateFromCookie !== stateFromQuery) {
            throw new Error("state mismatch");
        }

        try {
            const token = await oauth2.authorize("Google");

            // Get user info from Google using the token
            const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: {
                    Authorization: `Bearer ${token.accessToken}`,
                },
            });

            if (!userInfoResponse.ok) {
                const errorData = await userInfoResponse.json();
                console.error("Error fetching user info:", errorData);
                throw new Error("Failed to fetch user info");
            }

            const userInfo = await userInfoResponse.json();
            console.log("User info from Google:", userInfo);

            // Check if the user already exists in your database
            let user = await User.findOne({ email: userInfo.email });

            if (!user) {
                // Create a new user
                user = new User({
                    username: userInfo.email.split('@')[0], // Using email prefix as username
                    email: userInfo.email,
                    fullName: userInfo.name,
                    socialAuth: true,
                    socialType: "google",
                    socialToken: token.accessToken,
                    picture: userInfo.picture
                });
                await user.save();
            }

            const authToken = await userJwt.sign({
                userId: user._id.toString(),
                email: user.email,
            });
            return { user, token: authToken };

        } catch (error) {
            console.error("Error during Google callback:", error.message);
            return { error: "Authentication failed." };
        }
    })
    .get("/google/logout", async ({user, set, params: { token } }) => {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${user.socialToken}`, {
            method: "POST",
        }).then(()=>{
            set.status = 200;
            return {
                message: "Google account logout done",
            };
        }).catch((err)=>{
            console.log(err);
        })      
    });

export default socialAuth;
