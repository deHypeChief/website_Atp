import type { Elysia } from "elysia";
import Admin from "../routes/admin/model";
import { jwtAdmin } from "./jwt";

export const isAdmin_Authenticated = (app: Elysia) =>
  app
    .use(jwtAdmin)
    .derive(async function handler({ adminJwt, set, request: { headers }, error }) {
      const authorization = headers.get("authorization");
      const token = authorization?.split(" ")[1];
      if (!token) {
        set.status = 401
        throw new Error('Unauthorized Admin');
      }

      // Type the payload as AdminJWTPayload
      const payload = await adminJwt.verify(token);
      if (!payload || !payload.adminId) {
        set.status = 401
        throw new Error('Invalid admin token');
      }

      const { adminId } = payload;
      const admin = await Admin.findById(adminId).select('-pin');
      if (!admin) {
        set.status = 401
        throw new Error('Admin not found');
      }

      return {
        admin,
      };
    })
