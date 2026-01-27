export interface CreateItemRequest {
  Article: string,
  Translations: CreateItemTranslationDto[],
  Category: string,

  Price: number,
  NewPrice?: number,

  ColorVariants: CreateItemColorVariantDto[],
}

export interface CreateItemColorVariantDto {
  ColorHex: string,
  Sizes: CreateItemSizeVariantDto[],
}

export interface CreateItemSizeVariantDto {
  Size: string,
  Quantity: number,
}

export interface CreateItemTranslationDto {
  LanguageCode: string,

  Name: string,
  Description: string,
  Material: string,
}

export interface PhotoDto {
  clientId: string,
  order: number,
  isMain: boolean,
}

export interface PhotoDraft extends PhotoDto {
  file: File,
}

export interface ColorDraft extends CreateItemColorVariantDto {
  id: string,
  photos: PhotoDraft[],
}

