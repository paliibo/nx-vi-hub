import { ReactElement } from "react";

import { Control, FieldPathByValue, FieldValues, PathValue, useController } from "../form";
import { Select, SelectProps } from "./select";

export type FormSelectProps<
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, boolean | null | number | string | undefined>,
> = Omit<SelectProps, "defaultValue" | "onBlur" | "onChange" | "value"> & {
  containerClassName?: string;
} & {
  control: Control<TFieldValues>;
  defaultValue?: PathValue<TFieldValues, TPath>;
  name: TPath;
};

export const FormSelect = <
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, boolean | null | number | string | undefined>,
>({
  children,
  control,
  defaultValue,
  name,
  ...props
}: FormSelectProps<TFieldValues, TPath>): null | ReactElement => {
  const { field, fieldState } = useController({
    control,
    defaultValue,
    name,
  });

  return (
    <Select
      {...props}
      defaultValue={field.value}
      error={fieldState.isTouched && (fieldState.error?.message ?? fieldState.error?.type)}
      onValueChange={field.onChange}
    >
      {children}
    </Select>
  );
};
