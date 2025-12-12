import { ButtonHTMLAttributes, forwardRef } from "react"

export const CustomButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
  const { className, ...rest } = props;

  return (
    <button
      className={`border-2 border-primary bg-primary text-on-primary hover:bg-secondary hover:text-on-secondary p-2 rounded-lg font-bold ${className}`}
      ref={ref}
      {...rest}
    />
  )
})
