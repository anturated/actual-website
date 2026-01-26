"use client"

import { CustomButton } from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";
import { MaterialIcon } from "@/components/MaterialIcon";
import { redirect } from "next/navigation";
import { FormHTMLAttributes, forwardRef, useRef, useState } from "react";

interface CreateItemRequest {
  article: string,
  translations: CreateItemTranslationDto[],
  category: string,

  price: number,
  newPrice?: number,

  colorVariants: CreateItemColorVariantDto[],
}

interface CreateItemColorVariantDto {
  colorHex: string,
  sizes: CreateItemSizeVariantDto[],
}

interface CreateItemSizeVariantDto {
  size: string,
  quantity: number,
}

interface CreateItemTranslationDto {
  languageCode: string,

  name: string,
  description: string,
  material: string,
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
    colorHex: "#000000",
    sizes: [
      { size: "XS", quantity: 0 },
      { size: "S", quantity: 0 },
      { size: "M", quantity: 0 },
      { size: "L", quantity: 0 },
      { size: "XL", quantity: 0 },
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
    { languageCode: "en", name: "", description: "", material: "" },
    { languageCode: "de", name: "", description: "", material: "" },
  ]);

  const setTranslation = (translation: CreateItemTranslationDto) => {
    setTranslations(trs => trs.map(tr =>
      tr.languageCode === translation.languageCode
        ? translation
        : tr
    ));
  }

  const setQuantity = (colorId: string, size: string, quantity: number) => {
    setColors(crs => crs.map(c =>
      c.id === colorId
        ? {
          ...c,
          sizes: c.sizes.map(cs =>
            cs.size === size
              ? { ...cs, quantity: quantity }
              : cs
          ),
        }
        : c
    ));
  }

  const setColor = (colorId: string, colorHex: string) => {
    setColors(crs => crs.map(c =>
      c.id === colorId
        ? { ...c, colorHex }
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
      article,
      category,
      price: parseFloat(price),
      newPrice: newPrice ? parseFloat(newPrice) : undefined,
      translations,
      colorVariants: colors,
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
        {translations.map(tr => <TranslationForm translation={tr} setTranslation={setTranslation} key={tr.languageCode} />)}
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
    </div>
  )
}

function TranslationForm({ translation, setTranslation }: { translation: CreateItemTranslationDto, setTranslation: any }) {
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
      const name = nameRef.current?.value ?? "";
      const description = descRef.current?.value ?? "";
      const material = matRef.current?.value ?? "";

      setTranslation({
        languageCode: translation.languageCode,
        name,
        description,
        material,
      });
    }, 300);
  }

  return (
    <div className="flex flex-col gap-2 outline-2 outline-outline p-2">
      <p>{translation.languageCode}</p>

      <CustomInput
        placeholder="product name"
        defaultValue={translation.name}
        ref={nameRef}
        onChange={debounceUpdate}
      />
      <CustomInput
        placeholder="description"
        defaultValue={translation.name}
        ref={descRef}
        onChange={debounceUpdate}
      />
      <CustomInput
        placeholder="material"
        defaultValue={translation.name}
        ref={matRef}
        onChange={debounceUpdate}
      />
    </div>
  )
}

function ColorForm({ colorVariant, setColor, setQuantity }: { colorVariant: ColorDraft, setColor: any, setQuantity: any }) {
  return (
    <div className="flex flex-col gap-2 p-2 outline-2 outline-outline">
      <CustomInput
        placeholder="colorHex"
        defaultValue={colorVariant.colorHex}
        onChange={e => setColor(e.currentTarget.value)}
      />

      {colorVariant.sizes.map(cs =>
        <div
          className="flex flex-row justify-between items-center gap-3"
          key={cs.size}
        >
          <p>{cs.size}</p>
          <CustomInput
            placeholder={cs.size}
            defaultValue={cs.quantity}
            onChange={e => setQuantity(colorVariant.id, cs.size, parseInt(e.currentTarget.value))}
          />
        </div>
      )}
    </div>
  )
}
