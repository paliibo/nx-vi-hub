import { ReactElement } from "react";

import { Control, FieldPathByValue, FieldValues, PathValue, useController } from "../form";
import { TextArea, TextAreaProps } from "./text-area";

export type FormTextAreaProps<
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, boolean | null | number | string | undefined>,
> = Omit<TextAreaProps, "defaultValue" | "onBlur" | "onChange" | "value"> & { containerClassName?: string } & {
  control: Control<TFieldValues>;
  defaultValue?: PathValue<TFieldValues, TPath>;
  name: TPath;
};

export const FormTextArea = <
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, boolean | null | number | string | undefined>,
>({
  // containerClassName is intentionally left in ...props so it reaches the
  // underlying component, which uses it to style the field wrapper.
  control,
  defaultValue,
  name,
  ...props
}: FormTextAreaProps<TFieldValues, TPath>): null | ReactElement => {
  const { field, fieldState } = useController({
    control,
    defaultValue,
    name,
  });

  return (
    <TextArea
      {...props}
      {...field}
      error={fieldState.isTouched && (fieldState.error?.message ?? fieldState.error?.type)}
    />
  );
};
