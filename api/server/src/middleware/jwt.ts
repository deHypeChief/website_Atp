import { jwt } from '@elysiajs/jwt';
import Elysia, { t } from 'elysia'

export const jwtAdmin = new Elysia({
    name: "adminJwt",
}).use(
    jwt({
        name: "adminJwt",
        secret: Bun.env.ADMIN_JWT as string,
        exp: "1d",
    })
);




export const jwtUser = new Elysia({
    name: "userJwt",
}).use(
    jwt({
        name: 'userJwt',
        secret: Bun.env.USER_JWT as string,
        exp: "7d",
    })
)





export interface UserJWTPayload {
    userId: string;
    email: string;
}