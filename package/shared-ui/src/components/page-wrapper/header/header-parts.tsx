import { memo, ReactElement, ReactNode } from "react";

import { tw } from "@/tailwind";

export type HeaderLeftProps = {
  headerLeft?: ReactNode;
};

export const HeaderLeft = memo(({ headerLeft }: HeaderLeftProps): null | ReactElement => {
  return <div className={tw("mobile:w-1/3 flex items-center")}>{headerLeft}</div>;
});
HeaderLeft.displayName = "HeaderLeft";

export type HeaderCenterProps = {
  headerCenter?: ReactNode;
  headerCenterClassName?: string;
  isHeaderCenterShown?: boolean;
};

export const HeaderCenter = memo(
  ({
    headerCenter,
    headerCenterClassName,
    isHeaderCenterShown,
  }: HeaderCenterProps): null | ReactElement => {
    return isHeaderCenterShown ? (
      <div
        className={tw(
          "mobile:w-1/3 mobile:justify-center flex items-center",
          headerCenterClassName,
        )}
      >
        {headerCenter}
      </div>
    ) : null;
  },
);
HeaderCenter.displayName = "HeaderCenter";

export type HeaderRightProps = {
  headerRight?: ReactNode;
  isHeaderRightShown?: boolean;
};

export const HeaderRight = memo(
  ({ headerRight, isHeaderRightShown }: HeaderRightProps): null | ReactElement => {
    return isHeaderRightShown ? (
      <div className={tw("mobile:w-1/3 flex items-center justify-end")}>{headerRight}</div>
    ) : null;
  },
);
HeaderRight.displayName = "HeaderRight";
