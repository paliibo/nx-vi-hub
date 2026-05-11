import { ReactElement } from "react";

import { Control, FieldPathByValue, FieldValues, PathValue, useController } from "../form";
import { Switch, SwitchProps } from "./switch";

export type FormSwitchProps<
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, boolean | null | number | string | undefined>,
> = Omit<SwitchProps, "defaultValue" | "onBlur" | "onChange" | "value"> & {
  containerClassName?: string;
} & {
  control: Control<TFieldValues>;
  defaultValue?: PathValue<TFieldValues, TPath>;
  name: TPath;
};

export const FormSwitch = <
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, boolean | null | number | string | undefined>,
>({
  // containerClassName is intentionally left in ...props so it reaches the
  // underlying component, which uses it to style the field wrapper.
  control,
  defaultValue,
  name,
  ...props
}: FormSwitchProps<TFieldValues, TPath>): null | ReactElement => {
  const { field, fieldState } = useController({
    control,
    defaultValue,
    name,
  });

  return (
    <Switch
      {...props}
      {...field}
      checked={field.value}
      error={fieldState.isTouched && (fieldState.error?.message ?? fieldState.error?.type)}
      onCheckedChange={field.onChange}
    />
  );
};
