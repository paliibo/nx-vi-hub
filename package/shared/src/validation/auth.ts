import { z } from "zod";

import { publicUserSchema, sessionUserSchema, tokensSchema, userPasswordSchema } from "../types/db";

export type SignInBodySchema = z.infer<typeof signInBodySchema>;
export const signInBodySchema = z.object({
  email: z.string().min(1, "Email is required").email("That does not look like an email"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpBodySchema = z.infer<typeof signUpBodySchema>;
export const signUpBodySchema = z.object({
  displayName: z.string().min(2, "Use at least 2 characters").max(48).optional(),
  email: z.string().min(1, "Email is required").email("That does not look like an email"),
  password: userPasswordSchema,
  username: z
    .string()
    .min(3, "Use at least 3 characters")
    .max(24, "That is longer than 24 characters")
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers and underscores only"),
});

/**
 * Form-only extension of the sign-up body. The confirmation field and the terms
 * checkbox are checked in the browser and never reach the API, so they are kept
 * out of the wire schema.
 */
export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;
export const signUpFormSchema = signUpBodySchema
  .extend({
    agree: z.literal(true, {
      errorMap: () => ({ message: "Please accept the terms to continue" }),
    }),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type AuthResponseSchema = z.infer<typeof authResponseSchema>;
export const authResponseSchema = z.object({
  user: sessionUserSchema,
});

export type MeResponseSchema = z.infer<typeof meResponseSchema>;
export const meResponseSchema = sessionUserSchema;

export type RefreshResponseSchema = z.infer<typeof refreshResponseSchema>;
export const refreshResponseSchema = tokensSchema.partial().extend({
  user: sessionUserSchema,
});

export type UpdateProfileBodySchema = z.infer<typeof updateProfileBodySchema>;
export const updateProfileBodySchema = z.object({
  avatarUrl: z.string().url("Enter a valid URL").nullable().optional(),
  bio: z.string().max(400, "Keep it under 400 characters").nullable().optional(),
  displayName: z.string().min(2, "Use at least 2 characters").max(48).optional(),
});

export type ChangePasswordBodySchema = z.infer<typeof changePasswordBodySchema>;
export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: userPasswordSchema,
});

export type PublicProfileResponseSchema = z.infer<typeof publicProfileResponseSchema>;
export const publicProfileResponseSchema = publicUserSchema;
