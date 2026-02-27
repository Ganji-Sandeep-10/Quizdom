import type{ ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
    return (req: any, res: any, next: any) => {
        try {
            schema.parse(req.body);
            next();
        } catch (err: any) {
            return res.status(400).json({
                message: "Validation error",
                errors: err.errors,
            });
        }
    };
};