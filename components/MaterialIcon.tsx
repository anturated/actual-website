import '@material-symbols/font-400';
import React, { forwardRef, ReactNode } from "react";

// export default function MaterialIcon({ children, className = "" }: { children: ReactNode, className?: string }) {
export const MaterialIcon = forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>((props, ref) => {
  const { className, ...rest } = props;

  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      ref={ref}
      {...rest}
    />
  )
})

