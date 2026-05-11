import { memo, ReactNode } from "react";

import { tw } from "@/tailwind";

import {
  HeaderCenter,
  HeaderCenterProps,
  HeaderLeft,
  HeaderLeftProps,
  HeaderRight,
  HeaderRightProps,
} from "./header-parts";

export type HeaderProps = HeaderCenterProps &
  HeaderLeftProps &
  HeaderRightProps & {
    header?: ReactNode;
    headerClassName?: string;
    isHeaderShown?: boolean;
  };

export const Header = memo(
  ({
    header,
    headerCenter,
    headerCenterClassName,
    headerClassName,
    headerLeft,
    headerRight,
    isHeaderCenterShown,
    isHeaderRightShown,
    isHeaderShown,
  }: HeaderProps) => {
    if (!isHeaderShown) return null;
    return header ? (
      header
    ) : (
      <header
        className={tw(
          "h-header border-border-strong bg-background sticky top-0 z-50 flex w-full items-center border-b-2 p-5",
          headerClassName,
        )}
      >
        <HeaderLeft headerLeft={headerLeft} />
        <HeaderCenter
          headerCenter={headerCenter}
          headerCenterClassName={headerCenterClassName}
          isHeaderCenterShown={isHeaderCenterShown}
        />
        <HeaderRight headerRight={headerRight} isHeaderRightShown={isHeaderRightShown} />
      </header>
    );
  },
);
Header.displayName = "Header";
