import type { Elysia } from "elysia";
import { jwtUser } from "./jwt";
import User from "../routes/user/model";

export const isUser_Authenticated = (app: Elysia) =>
    app
        .use(jwtUser)
        .derive(async function handler({ userJwt, set, request: { headers } }) {
            const authorization = headers.get("authorization");
            const token = authorization?.split(" ")[1];
            if (!token) {
                throw new Error('Unauthorized User');
            }

            // Type the payload as UserJWTPayload
            const payload = await userJwt.verify(token);
            if (!payload || !payload.userId) {
                throw new Error('Invalid user token');
            }

            const { userId } = payload;
            const user = await User.findById(userId).select('-password');
            if (!user) {
                throw new Error('User not found');
            }

            return {
                user,
            };
        })
