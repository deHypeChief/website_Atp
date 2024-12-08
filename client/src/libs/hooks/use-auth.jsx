// import { login, register } from "@/apis/auth";

import { login, register, verify } from "../api/api.endpoints";

export const useAuth = () => {
    async function userLogout() {
        localStorage.removeItem('user-payload');
    };

    async function userRegister(payload) {
        const data = await register(payload);
        return data
    };

    async function userLogin(payload) {
        const data = await login(payload);
        localStorage.setItem('user-payload', JSON.stringify(data.data.data));
        return data.data
    };

    async function isAuthenticated() {
        const storedPayload = localStorage.getItem('user-payload');

        if (!storedPayload) {
            // No token stored, so admin is not authenticated
            return false;
        }
        try {
            const data = await verify({ token: await JSON.parse(storedPayload)?.auth.token })
            console.log(data)
            if (data.isValid) {
                // Token is valid, return the admin details
                return JSON.parse(storedPayload);
            } else {
                // Token is invalid, log out the admin
                await userLogout();
                return false;
            }
        } catch (error) {
            console.error("Error verifying token:", error);
            await userLogout(); // Logout if an error occurs during token verification
            return false;
        }
    }

    function user() {
        const storedPayload = localStorage.getItem('user-payload');

        if (!storedPayload) {
            userLogout();
            return null;
        }

        try {
            const isAuth = JSON.parse(storedPayload);
            
            if (!isAuth?.user) {
                userLogout();
                return null;
            }
            return isAuth.user; // Return admin details if authenticated
        } catch (error) {
            console.error("Error parsing user payload:", error);
            userLogout();
            return null;
        }
    }

    return { isAuthenticated, userLogout, userLogin, userRegister, user };
};
