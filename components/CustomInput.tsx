import { forwardRef, InputHTMLAttributes } from "react";

export const CustomInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  const { className, ...rest } = props;

  return (
    <input
      className={`bg-surface-container disabled:bg-background
                  text-on-background disabled:text-outline
                  outline-outline-variant focus:outline-primary
                  outline-2
                  rounded-lg px-2 py-2
                  ${className}`}
      ref={ref}
      {...rest}
    />
  )
})
