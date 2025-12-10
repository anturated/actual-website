"use client"

import { encryptCustom } from "@/app/actions/encryptCustom";
import { forwardRef, InputHTMLAttributes, useEffect, useRef, useState } from "react"

export default function CreateCustom() {
  const nameRef = useRef<HTMLInputElement | null>(null);
  const textRef = useRef<HTMLInputElement | null>(null);

  const [link, setLink] = useState("");

  const updateLink = (() => {
    let timer: NodeJS.Timeout;

    return () => {
      clearTimeout(timer);

      timer = setTimeout(async () => {
        const text = textRef.current?.value ?? "";
        const name = nameRef.current?.value ?? "";

        if (!text && !name) {
          setLink("");
          return;
        }

        const encrypted = await encryptCustom({ text, name });
        setLink(encrypted);
      }, 300);
    };
  })();

  const onLinkClick = (() => {
    if (!link) return;
    navigator.clipboard.writeText(link);
  })

  return (
    <div className="flex flex-col md:flex-row gap-[8px] w-full grow" >
      <div className="flex flex-col gap-3 my-auto">
        <CustomInput ref={nameRef} placeholder="Name" onChange={updateLink} />
        <CustomInput ref={textRef} placeholder="Text" onChange={updateLink} />

        <div
          className="flex flex-col gap-2 mt-[64px]"
          onClick={onLinkClick}
        >
          <p className="ml-2">
            Click to copy
          </p>
          <CustomInput
            value={link}
            placeholder="Link"
            disabled
          />
        </div>
      </div>
      {/* preview */}
      <div className="flex flex-col justify-around items-center bg-surface-container rounded-lg w-full grow">
        <p className="italic text-outline">Preview coming soon!</p>
      </div>
    </div >
  )
}

const CustomInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
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
