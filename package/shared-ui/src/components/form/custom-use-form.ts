"use client";

import { useCallback } from "react";
import {
  FieldPath,
  FieldValues,
  SetValueConfig,
  UseFormHandleSubmit,
  useForm as useOriginalForm,
  UseFormProps as UseOriginalFormProps,
  UseFormReturn as UseOriginalFormReturn,
} from "react-hook-form";

export type SetTouchedConfig = Omit<SetValueConfig, "shouldTouch">;

export interface UseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
> extends UseOriginalFormProps<TFieldValues, TContext, TTransformedValues> {
  // This is custom behaviour. `useForm` DOES NOT touch and validate forms on submit,
  // which is a super bad UX: user presses submit button and nothing happens,
  // instead of showing validation error.
  /**
   * By default fields are automatically touched and validated on submit. However you can disable
   * this behaviour by setting `shouldValidateOnSubmit` to false.
   *
   * @default true
   */
  shouldValidateOnSubmit?: boolean;
}

export interface UseFormReturn<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
> extends UseOriginalFormReturn<TFieldValues, TContext, TTransformedValues> {
  /**
   * This function allows you to dynamically touch a registered field and have the options to
   * validate and update the form state.
   */
  setTouched: UseFormSetTouched<TFieldValues>;
}

export type UseFormSetTouched<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
  options?: SetTouchedConfig,
) => void;

/**
 * TTransformedValues is what the resolver produces, which is not always what the
 * fields hold. A Zod schema with `.default()` makes those two types differ — the
 * field is optional going in and guaranteed coming out — and without the third
 * generic the resolver cannot be assigned to the form.
 */
export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
>({
  mode = "onTouched",
  shouldValidateOnSubmit = true,
  ...props
}: UseFormProps<TFieldValues, TContext, TTransformedValues> = {}): UseFormReturn<
  TFieldValues,
  TContext,
  TTransformedValues
> {
  // `useOriginalForm` always returns the same object reference, so it is safe
  //  to use it as a useCallback dependency
  const form = useOriginalForm<TFieldValues, TContext, TTransformedValues>({
    mode,
    ...props,
  });

  const setTouched = useCallback<UseFormSetTouched<TFieldValues>>(
    (name, options = {}) => {
      const value = form.getValues(name);
      form.setValue(name, value, {
        ...options,
        shouldTouch: true,
      });
    },
    [form],
  );

  const handleSubmit = useCallback<UseFormHandleSubmit<TFieldValues, TTransformedValues>>(
    (...args) =>
      (...eventArgs) => {
        if (shouldValidateOnSubmit) {
          for (const key of Object.keys(form.getValues())) {
            setTouched(key as FieldPath<TFieldValues>);
          }
        }

        return form.handleSubmit(...args)(...eventArgs);
      },
    [setTouched, shouldValidateOnSubmit, form],
  );

  return {
    ...form,
    handleSubmit,
    setTouched,
  };
}
