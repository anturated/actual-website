import { CustomInput } from "@/components/CustomInput"
import { ChangeEvent, useRef } from "react"
import { ClientColor, ClientPhoto, ClientSize, EditItemColorVariantDto, ItemColorDto, ItemSizeDto } from "./types"
import { CustomButton } from "@/components/CustomButton";

const OPERATION = [
  "reserve", "release"
] as const;

type Operation = (typeof OPERATION)[number];

export function ColorForm({
  colorVariant,
  itemId,
  setColor,
  setQuantity,
  setPhotos,
  editing = false,
}: {
  colorVariant: ClientColor,
  itemId?: string,
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

  const onStockEdited = (size: string, quantity: number) => {
    setQuantity(colorVariant.clientId, size, quantity);
  }

  return (
    <div className="flex flex-col gap-2 p-2 outline-2 outline-outline">
      <CustomInput
        placeholder="colorHex"
        defaultValue={colorVariant.colorHex}
        onChange={e => setColor(colorVariant.clientId, e.currentTarget.value)}
      />

      {colorVariant.sizes.map(cs =>
        <div
          className="flex flex-row justify-between items-center gap-3"
          key={cs.size}
        >
          <p>{editing ? `${cs.size}: ${cs.quantity}` : cs.size}</p>
          {!editing ? (
            <CustomInput
              placeholder="Stock"
              defaultValue={cs.quantity}
              onChange={e => setQuantity(colorVariant.clientId, cs.size, parseInt(e.currentTarget.value))}
            />
          ) : (
            <EditStockRow
              itemId={itemId}
              sizeVariant={cs}
              setQuantity={onStockEdited}
            />
          )}
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

interface EditStockRequest {
  Size: string,
  Quantity: number,
}

function EditStockRow({
  sizeVariant,
  itemId,
  setQuantity
}: {
  sizeVariant: ClientSize,
  itemId?: string,
  setQuantity: (size: string, quantity: number) => void
}) {
  const stockRef = useRef<HTMLInputElement | null>(null);

  const onStock = async (operation: Operation) => {
    const quantity = parseInt(stockRef.current?.value ?? "0");
    if (!quantity) return;

    const res = await fetch(`http://localhost:5000/api/items/${itemId}/stock/${operation}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Size: sizeVariant.size,
        Quantity: quantity,
      } satisfies EditStockRequest)
    });

    if (!res.ok) {
      console.error(res.body);
      return;
    }
    const cv: ItemSizeDto = await res.json();

    setQuantity(cv.size, cv.quantity);
  }

  return <>
    <CustomInput
      placeholder="Stock"
      ref={stockRef}
    />
    <CustomButton onClick={e => onStock("reserve")}>Reserve</CustomButton>
    <CustomButton onClick={e => onStock("release")}>Release</CustomButton>
  </>
}
