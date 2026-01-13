import { FC } from "react";

import { tw } from "@/tailwind";

export type FormErrorProps = {
  className?: string;
  errorText?: FormErrorType;
};

export type FormErrorType = false | null | string;

export const FormError: FC<FormErrorProps> = ({ className, errorText }) => (
  <p className={tw("text-foreground text-regular-caption", className)}>{errorText || " "}</p>
);
