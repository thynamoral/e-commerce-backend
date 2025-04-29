import { z } from "zod";

export const verificationCodeIdSchema = z.string().uuid();
