import { ReactNode } from "react";

export default function Section({ children, className = "" }:
  { children: ReactNode, className?: string }) {
  return (
    <section className={"w-full max-w-[1200px] mx-auto" + className}>
      {children}
    </section>
  )
}
