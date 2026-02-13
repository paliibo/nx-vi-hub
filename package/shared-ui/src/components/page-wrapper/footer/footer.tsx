import { memo, ReactNode } from "react";

import { tw } from "@/tailwind";

export type FooterProps = {
  footer?: ReactNode;
  footerClassName?: string;
  isFooterShown?: boolean;
};

export const Footer = memo(({ footer, footerClassName, isFooterShown }: FooterProps) => {
  return isFooterShown ? (
    <footer className={tw("bg-surface desktop:hidden z-50 flex w-full p-5", footerClassName)}>
      {footer}
    </footer>
  ) : null;
});
Footer.displayName = "Footer";
