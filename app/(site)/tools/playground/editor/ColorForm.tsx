import { CustomInput } from "@/components/CustomInput"
import { ColorDraft } from "./types"

export function ColorForm({
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
