import type { FC, HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export const Card: FC<CardProps> = ({ children, className, interactive = false, ...rest }) => (
  <div
    className={cn(
      "surface-card p-5 md:p-6",
      interactive && "surface-card-hover",
      className
    )}
    {...rest}
  >
    {children}
  </div>
);
