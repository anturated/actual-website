import '@material-symbols/font-400';
import { ReactNode } from "react";

export default function MaterialIcon({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <span className={"material-symbols-outlined " + className}>
      {children}
    </span>
  )
}
