"use client"

import { CustomButton } from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";
import { MaterialIcon } from "@/components/MaterialIcon";
import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TranslationForm } from "./TranslationForm";
import { ColorForm } from "./ColorForm";
import { ColorDraft, CreateItemRequest, CreateItemTranslationDto, PhotoDraft, PhotoDto } from "./types";


function sendError(text: string) {
  console.error(text);
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
    Photos: [],
  };
}

export default function EditorView() {
  const articleRef = useRef<HTMLInputElement | null>(null);
  const categoryRef = useRef<HTMLInputElement | null>(null);
  const priceRef = useRef<HTMLInputElement | null>(null);
  const newPriceRef = useRef<HTMLInputElement | null>(null);
  const [colors, setColors] = useState<ColorDraft[]>([genEmptyColor()]);
  const [translations, setTranslations] = useState<CreateItemTranslationDto[]>([
    { LanguageCode: "en", Name: "", Description: "", Material: "" },
    { LanguageCode: "de", Name: "", Description: "", Material: "" },
  ]);

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

  const setPhotos = (colorId: string, photos: PhotoDraft[]) => {
    setColors(crs => crs.map(c =>
      c.id === colorId
        ? { ...c, Photos: photos, }
        : c
    ))
  }

  const onCreate = async () => {
    const article = articleRef.current?.value;
    const category = categoryRef.current?.value;
    const price = priceRef.current?.value;
    const newPrice = newPriceRef.current?.value;

    // sanity checks
    if (!article || !price || !category) return;
    if (colors.length < 1) return;

    // add item info
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

    // add photos
    colors.forEach(c =>
      c.Photos.forEach(p => formData.append("files", p.file))
    );

    // send request
    const res = await fetch("http://localhost:5000/api/items", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const j = await res.json();
      redirect("/tools/playground/" + j.slug);
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
            setPhotos={setPhotos}
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

