"use client"

import { CustomButton } from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";
import { MaterialIcon } from "@/components/MaterialIcon";
import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TranslationForm } from "./TranslationForm";
import { ColorForm } from "./ColorForm";
import { ClientColor, ClientPhoto, ClientSize, ClientTranslation, CreateItemColorVariantDto, CreateItemRequest, CreateItemSizeVariantDto, CreateItemTranslationDto, CreatePhotoDto, ItemFullDto } from "./types";



function sendError(text: string) {
  console.error(text);
}

function genEmptyColor(): ClientColor {
  return {
    clientId: crypto.randomUUID(),
    colorHex: "#000000",
    sizes: [
      { size: "XS", quantity: 0 },
      { size: "S", quantity: 0 },
      { size: "M", quantity: 0 },
      { size: "L", quantity: 0 },
      { size: "XL", quantity: 0 },
    ],
    photos: [],
  };
}

export default function EditorView({ slug }: { slug?: string }) {
  const articleRef = useRef<HTMLInputElement | null>(null);
  const categoryRef = useRef<HTMLInputElement | null>(null);
  const priceRef = useRef<HTMLInputElement | null>(null);
  const newPriceRef = useRef<HTMLInputElement | null>(null);
  const [colors, setColors] = useState<ClientColor[]>([genEmptyColor()]);
  const [translations, setTranslations] = useState<ClientTranslation[]>([
    { LanguageCode: "en", Name: "", Description: "", Material: "" },
    { LanguageCode: "de", Name: "", Description: "", Material: "" },
  ]);

  useEffect(() => {
    if (!slug) return;

    fetch("http://localhost:5000/api/items/by-slug/" + slug)
      .then(r => r.json())
      .then(j => {
        const dto = j as ItemFullDto;

        setColors(dto.colors.map(c => ({
          serverId: c.id,
          clientId: c.id,
          colorHex: c.colorHex,
          sizes: c.sizes.map(cs => ({
            size: cs.size,
            quantity: cs.quantity,
          }) satisfies ClientSize),
          photos: c.photos.map(p => ({
            serverId: p.id,
            clientId: p.id,
            url: p.url,
            isMain: p.isMain,
            sortOrder: p.sortOrder,
          }) satisfies ClientPhoto),
        })));
      });
  }, [slug])

  const setTranslation = (translation: CreateItemTranslationDto) => {
    setTranslations(trs => trs.map(tr =>
      tr.LanguageCode === translation.LanguageCode
        ? translation
        : tr
    ));
  }

  const setQuantity = (colorId: string, size: string, quantity: number) => {
    setColors(crs => crs.map(c =>
      c.clientId === colorId
        ? {
          ...c,
          Sizes: c.sizes.map(cs =>
            cs.size === size
              ? { ...cs, Quantity: quantity }
              : cs
          ),
        }
        : c
    ));
  }

  const setColor = (colorId: string, colorHex: string) => {
    setColors(crs => crs.map(c =>
      c.clientId === colorId
        ? { ...c, ColorHex: colorHex }
        : c
    ));
  }

  const addColor = () => {
    setColors(crs => [...crs, genEmptyColor()]);
  }

  const setPhotos = (colorId: string, photos: ClientPhoto[]) => {
    setColors(crs => crs.map(c =>
      c.clientId === colorId
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

    const payload = { // jesus
      Article: article,
      Category: category,
      Price: parseFloat(price),
      NewPrice: newPrice ? parseFloat(newPrice) : undefined,
      Translations: translations,
      ColorVariants: colors.map(c => ({
        ColorHex: c.colorHex,
        Sizes: c.sizes.map(cs => ({
          Size: cs.size,
          Quantity: cs.quantity,
        }) satisfies CreateItemSizeVariantDto),
        Photos: c.photos.map(p => ({
          FileName: p.fileName!,
          SortOrder: p.sortOrder,
          IsMain: p.isMain,
        }) satisfies CreatePhotoDto),
      }) satisfies CreateItemColorVariantDto),
    } satisfies CreateItemRequest;

    formData.append("item", JSON.stringify(payload));

    // add photos
    colors.forEach(c =>
      c.photos.forEach(p => formData.append("files", p.file!))
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
            key={c.clientId}
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

