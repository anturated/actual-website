"use client"

import { CustomButton } from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";
import { MaterialIcon } from "@/components/MaterialIcon";
import { redirect } from "next/navigation";
import { FormHTMLAttributes, forwardRef, useEffect, useRef, useState } from "react";

interface CreateItemRequest {
  Article: string,
  Translations: CreateItemTranslationDto[],
  Category: string,

  Price: number,
  NewPrice?: number,

  ColorVariants: CreateItemColorVariantDto[],
}

interface CreateItemColorVariantDto {
  ColorHex: string,
  Sizes: CreateItemSizeVariantDto[],
}

interface CreateItemSizeVariantDto {
  Size: string,
  Quantity: number,
}

interface CreateItemTranslationDto {
  LanguageCode: string,

  Name: string,
  Description: string,
  Material: string,
}

function sendError(text: string) {
  console.error(text);
}

interface ColorDraft extends CreateItemColorVariantDto {
  id: string,
}

function genEmptyColor(): ColorDraft {
  return {
    id: crypto.randomUUID(),
    ColorHex: "#000000",
    Sizes: [
      { Size: "XS", Quantity: 0 },
      { Size: "S", Quantity: 0 },
      { Size: "M", Quantity: 0 },
      { Size: "L", Quantity: 0 },
      { Size: "XL", Quantity: 0 },
    ],
  };
}

export default function Editor() {
  const articleRef = useRef<HTMLInputElement | null>(null);
  const categoryRef = useRef<HTMLInputElement | null>(null);
  const priceRef = useRef<HTMLInputElement | null>(null);
  const newPriceRef = useRef<HTMLInputElement | null>(null);
  const [colors, setColors] = useState<ColorDraft[]>([genEmptyColor()]);
  const [translations, setTranslations] = useState<CreateItemTranslationDto[]>([
    { LanguageCode: "en", Name: "", Description: "", Material: "" },
    { LanguageCode: "de", Name: "", Description: "", Material: "" },
  ]);

  useEffect(() => {
    const tr = translations.find(t => t.LanguageCode === "en")?.Name;
    console.log(`translations changed ${tr}`)
  }, [translations])

  const setTranslation = (translation: CreateItemTranslationDto) => {
    setTranslations(trs => trs.map(tr =>
      tr.LanguageCode === translation.LanguageCode
        ? translation
        : tr
    ));
  }

  const setQuantity = (colorId: string, size: string, quantity: number) => {
    setColors(crs => crs.map(c =>
      c.id === colorId
        ? {
          ...c,
          Sizes: c.Sizes.map(cs =>
            cs.Size === size
              ? { ...cs, Quantity: quantity }
              : cs
          ),
        }
        : c
    ));
  }

  const setColor = (colorId: string, colorHex: string) => {
    setColors(crs => crs.map(c =>
      c.id === colorId
        ? { ...c, ColorHex: colorHex }
        : c
    ));
  }

  const addColor = () => {
    setColors(crs => [...crs, genEmptyColor()]);
  }

  const onCreate = async () => {
    const article = articleRef.current?.value;
    const category = categoryRef.current?.value;
    const price = priceRef.current?.value;
    const newPrice = newPriceRef.current?.value;

    if (!article || !price || !category) return;
    if (colors.length < 1) return;

    const formData = new FormData();

    const payload = {
      Article: article,
      Category: category,
      Price: parseFloat(price),
      NewPrice: newPrice ? parseFloat(newPrice) : undefined,
      Translations: translations,
      ColorVariants: colors,
    } satisfies CreateItemRequest;

    formData.append("item", JSON.stringify(payload));

    const res = await fetch("http://localhost:5000/api/items", {
      method: "POST",
      // headers: { "Content-Type": "application/json" },
      body: formData,
    });

    if (res.ok) {
      const j = await res.json();
      redirect("/playground/" + j.slug);
    } else {
      sendError(await res.json())
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <CustomInput ref={articleRef} placeholder="article" />
      <CustomInput ref={categoryRef} placeholder="category" />
      <CustomInput ref={priceRef} placeholder="price" />
      <CustomInput ref={newPriceRef} placeholder="new price" />

      <div className="flex flex-row gap-2">
        {translations.map(tr => <TranslationForm translation={tr} setTranslation={setTranslation} key={tr.LanguageCode} />)}
      </div>

      <div className="flex flex-row gap-2">
        {colors.map(c =>
          <ColorForm
            colorVariant={c}
            setColor={setColor}
            setQuantity={setQuantity}
            key={c.id}
          />
        )}
        <CustomButton className="h-min w-20" onClick={addColor}>
          <MaterialIcon>Add</MaterialIcon>
        </CustomButton>
      </div>

      <CustomButton onClick={onCreate}>Submit</CustomButton>
    </div>
  )
}

function TranslationForm({
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
        defaultValue={translation.Name}
        ref={descRef}
        onChange={debounceUpdate}
      />
      <CustomInput
        placeholder="material"
        defaultValue={translation.Name}
        ref={matRef}
        onChange={debounceUpdate}
      />
    </div>
  )
}

function ColorForm({
  colorVariant,
  setColor,
  setQuantity
}: {
  colorVariant: ColorDraft,
  setColor: (colorId: string, colorHex: string) => void,
  setQuantity: (colorId: string, size: string, quantity: number) => void
}) {
  return (
    <div className="flex flex-col gap-2 p-2 outline-2 outline-outline">
      <CustomInput
        placeholder="colorHex"
        defaultValue={colorVariant.ColorHex}
        onChange={e => setColor(colorVariant.id, e.currentTarget.value)}
      />

      {colorVariant.Sizes.map(cs =>
        <div
          className="flex flex-row justify-between items-center gap-3"
          key={cs.Size}
        >
          <p>{cs.Size}</p>
          <CustomInput
            placeholder={cs.Size}
            defaultValue={cs.Quantity}
            onChange={e => setQuantity(colorVariant.id, cs.Size, parseInt(e.currentTarget.value))}
          />
        </div>
      )}
    </div>
  )
}
