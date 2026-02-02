import { CustomInput } from "@/components/CustomInput"
import { ColorDraft, PhotoDraft } from "./types"
import { ChangeEvent } from "react"

export function ColorForm({
  colorVariant,
  setColor,
  setQuantity,
  setPhotos,
}: {
  colorVariant: ColorDraft,
  setColor: (colorId: string, colorHex: string) => void,
  setQuantity: (colorId: string, size: string, quantity: number) => void
  setPhotos: (colorId: string, photos: PhotoDraft[]) => void
}) {
  const onPhotosChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    setPhotos(colorVariant.clientId, files.map((file, Order) => ({
      FileName: file.name,
      file,
      Order,
      IsMain: Order === 0,
    })))
  }

  return (
    <div className="flex flex-col gap-2 p-2 outline-2 outline-outline">
      <CustomInput
        placeholder="colorHex"
        defaultValue={colorVariant.ColorHex}
        onChange={e => setColor(colorVariant.clientId, e.currentTarget.value)}
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
            onChange={e => setQuantity(colorVariant.clientId, cs.Size, parseInt(e.currentTarget.value))}
          />
        </div>
      )}

      <input
        type="file"
        multiple
        onChange={onPhotosChange}
      />
    </div>
  )
}
