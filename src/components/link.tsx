import type { AnchorHTMLAttributes, CSSProperties, ReactNode } from "react";

// Drop-in replacement for next/link in a static build. Renders a plain <a>.
// Next-only props (prefetch, scroll) are accepted and ignored.
export default function Link({
  href,
  children,
  className,
  style,
  ...rest
}: {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
  scroll?: boolean;
  className?: string;
  style?: CSSProperties;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <a href={href} className={className} style={style} {...rest}>
      {children}
    </a>
  );
}
