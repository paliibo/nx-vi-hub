"use client";

/**
 * Our useForm wrapper adds touch-and-validate-on-submit. These are named
 * explicitly rather than star-exported because an explicit export overrides a
 * star export, whereas two star exports of the same name are ambiguous and the
 * name silently disappears.
 */
export { useForm } from "./custom-use-form";

export type {
  SetTouchedConfig,
  UseFormProps,
  UseFormReturn,
  UseFormSetTouched,
} from "./custom-use-form";
export { zodResolver } from "@hookform/resolvers/zod";

/**
 * Re-exports react-hook-form through the design system so consumers depend on
 * one module rather than on the form library directly.
 *
 * This used to enumerate every exported type by hand — around 140 names that
 * had to be kept in step with each react-hook-form release. A star export says
 * the same thing and cannot fall behind.
 */
export * from "react-hook-form";

/**
 * @hookform/resolvers v5 stopped re-exporting `Resolver` from its zod entry
 * point. It is the same type react-hook-form declares, so it is aliased from
 * there and existing `ZodResolver` usages keep working.
 */
export type { Resolver as ZodResolver } from "react-hook-form";
