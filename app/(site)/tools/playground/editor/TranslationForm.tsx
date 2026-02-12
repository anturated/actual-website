"use client"

import { useRef } from "react";
import { CustomInput } from "@/components/CustomInput";
import { CreateItemTranslationDto } from "./types";


export function TranslationForm({
  translation,
  setTranslation
}: {
  translation: CreateItemTranslationDto,
  setTranslation: (translation: CreateItemTranslationDto) => void
}) {
  const nameRef = useRef<HTMLInputElement | null>(null);
  const descRef = useRef<HTMLInputElement | null>(null);
  const matRef = useRef<HTMLInputElement | null>(null);

  const editTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimer = () => {
    if (!editTimerRef.current) return;
    clearTimeout(editTimerRef.current);
    editTimerRef.current = null;
  }

  const debounceUpdate = () => {
    clearTimer();

    editTimerRef.current = setTimeout(() => {
      const Name = nameRef.current?.value ?? "";
      const Description = descRef.current?.value ?? "";
      const Material = matRef.current?.value ?? "";
      console.log(`saving translation ${translation.LanguageCode} ${Name}`)

      setTranslation({
        LanguageCode: translation.LanguageCode,
        Name,
        Description,
        Material,
      });
    }, 300);
  }

  return (
    <div className="flex flex-col gap-2 outline-2 outline-outline p-2">
      <p>{translation.LanguageCode}</p>

      <CustomInput
        placeholder="product name"
        defaultValue={translation.Name}
        ref={nameRef}
        onChange={debounceUpdate}
      />
      <CustomInput
        placeholder="description"
        defaultValue={translation.Description}
        ref={descRef}
        onChange={debounceUpdate}
      />
      <CustomInput
        placeholder="material"
        defaultValue={translation.Material}
        ref={matRef}
        onChange={debounceUpdate}
      />
    </div>
  )
}
