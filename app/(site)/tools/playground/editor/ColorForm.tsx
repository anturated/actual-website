import { CustomInput } from "@/components/CustomInput"
import { ChangeEvent } from "react"
import { ClientColor, ClientPhoto } from "./types"

export function ColorForm({
  colorVariant,
  setColor,
  setQuantity,
  setPhotos,
  editing = false,
}: {
  colorVariant: ClientColor,
  setColor: (colorId: string, colorHex: string) => void,
  setQuantity: (colorId: string, size: string, quantity: number) => void
  setPhotos: (colorId: string, photos: ClientPhoto[]) => void
  editing?: boolean,
}) {
  const onPhotosChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    setPhotos(colorVariant.clientId, files.map((file, sortOrder) => ({
      clientId: crypto.randomUUID(),
      fileName: file.name,
      file,
      sortOrder,
      isMain: sortOrder === 0,
    }) satisfies ClientPhoto));
  }

  return (
    <div className="flex flex-col gap-2 p-2 outline-2 outline-outline">
      <CustomInput
        placeholder="colorHex"
        defaultValue={colorVariant.colorHex}
        onChange={e => setColor(colorVariant.clientId, e.currentTarget.value)}
      />

      {!editing && colorVariant.sizes.map(cs =>
        <div
          className="flex flex-row justify-between items-center gap-3"
          key={cs.size}
        >
          <p>{cs.size}</p>
          <CustomInput
            placeholder={cs.size}
            defaultValue={cs.quantity}
            onChange={e => setQuantity(colorVariant.clientId, cs.size, parseInt(e.currentTarget.value))}
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
