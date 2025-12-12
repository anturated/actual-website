"use client"

import { login } from "@/app/actions/login";
import { register } from "@/app/actions/register";
import { CustomInput } from "@/components/CustomInput";
import { ButtonHTMLAttributes, forwardRef, useRef, useState } from "react";

export default function Tools() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex flex-col grow justify-between md:justify-around">

      <div className="grid grid-rows-[1fr_3fr] grid-cols-2">
        <BunButton onClick={() => setIsLogin(true)} disabled={isLogin} >Login</BunButton>
        <BunButton onClick={() => setIsLogin(false)} disabled={!isLogin} >Register</BunButton>

        {/* Form switcher + container */}
        <div className="border-2 border-t-0 border-outline col-span-2 p-2 rounded-b-xl ">
          {isLogin &&
            <CustomForm action={login} buttonText="Login" />
          }
          {!isLogin &&
            <CustomForm action={register} buttonText="Register" />
          }
        </div>
      </div>
    </div>
  )
}

const BunButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
  const { ...rest } = props;

  return (
    <button
      className={`
        border-2 border-outline border-b-0 rounded-t-xl
      `}
      ref={ref}
      {...rest}
    />
  )
})

function CustomForm({
  action,
  buttonText
}: {
  action: any,
  buttonText: string
}) {
  const loginRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  return (
    <form
      className="flex flex-col items-start gap-3"
      action={action}
    >
      <CustomInput
        placeholder="Login"
        type="text"
        name="username"
        ref={loginRef}
      />

      <CustomInput
        placeholder="Password"
        type="password"
        name="password"
        ref={passwordRef}
      />

      <button
        className={`
          rounded-lg p-2 w-full outline-2
          outline-secondary hover:outline-primary active:outline-outline
          bg-secondary-container hover:bg-primary-container active:bg-surface-container-highest
          text-on-secondary-container hover:text-on-primary-container active:text-outline
        `}
        type="submit"
      >
        {buttonText}
      </button>
    </form >
  )
}
