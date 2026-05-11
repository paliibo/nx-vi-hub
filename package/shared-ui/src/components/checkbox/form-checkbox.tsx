import { ReactElement } from "react";

import { Control, FieldPathByValue, FieldValues, PathValue, useController } from "../form";
import { Checkbox, CheckboxProps } from "./checkbox";

export type FormCheckboxProps<
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, boolean | null | number | string | undefined>,
> = Omit<CheckboxProps, "defaultValue" | "onBlur" | "onChange" | "value"> & {
  containerClassName?: string;
} & {
  control: Control<TFieldValues>;
  defaultValue?: PathValue<TFieldValues, TPath>;
  name: TPath;
};

export const FormCheckbox = <
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, boolean | null | number | string | undefined>,
>({
  control,
  defaultValue,
  name,
  ...props
}: FormCheckboxProps<TFieldValues, TPath>): null | ReactElement => {
  const { field, fieldState } = useController({
    control,
    defaultValue,
    name,
  });

  return (
    <Checkbox
      {...props}
      {...field}
      checked={field.value}
      error={fieldState.isTouched && (fieldState.error?.message ?? fieldState.error?.type)}
      onCheckedChange={field.onChange}
    />
  );
};
