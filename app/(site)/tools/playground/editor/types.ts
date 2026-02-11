//
//    ITEM
//
export interface ItemFullDto {
  id: string,
  article: string,
  category: string,

  title: string,
  description: string,
  material: string,
  slug: string,

  price: number,
  newPrice: number,

  colors: ItemColorDto[],
}

export interface ItemEditDto {
  id: string,
  article: string,
  category: string,

  translations: TranslationDto[],

  price: number,
  newPrice: number,

  colors: ItemColorDto[],
}

export interface CreateItemRequest {
  Article: string,
  Translations: CreateItemTranslationDto[],
  Category: string,

  Price: number,
  NewPrice?: number,

  ColorVariants: CreateItemColorVariantDto[],
}

export interface EditItemRequest {
  Article: string,
  Category: string,
  Price: number,
  NewPrice?: number,
  Translations: EditItemTranslationDto[]
  ColorVariants: EditItemColorVariantDto[],
}

//
//    COLOR
//
export interface ItemColorDto {
  id: string,
  colorHex: string,
  sizes: ItemSizeDto[],
  photos: PhotoDto[],
}

export interface ClientColor {
  clientId: string,
  serverId?: string,
  colorHex: string,
  photos: ClientPhoto[],
  sizes: ClientSize[],
}

export interface CreateItemColorVariantDto {
  ColorHex: string,
  Sizes: CreateItemSizeVariantDto[],
  Photos: CreatePhotoDto[],
}

export interface EditItemColorVariantDto {
  // id is non-null on existing/old objects
  Id?: string,
  ColorHex: string,
  // NOTE: can't edit sizes here
  // but can add
  Sizes?: CreateItemSizeVariantDto[],
  Photos: EditPhotoDto[],
}

//
//    TRANSLATION
//
export interface ClientTranslation {
  LanguageCode: string,
  Name: string,
  Description: string,
  Material: string,
}

export interface TranslationDto {
  languageCode: string,
  name: string,
  description: string,
  material: string,
}

export interface CreateItemTranslationDto {
  LanguageCode: string,
  Name: string,
  Description: string,
  Material: string,
}

export interface EditItemTranslationDto {
  LanguageCode: string,
  Name: string,
  Description: string,
  Material: string,
}

//
//    SIZE
//
export interface ItemSizeDto {
  size: string,
  quantity: number,
}

export interface ClientSize {
  size: string,
  quantity: number,
}

export interface CreateItemSizeVariantDto {
  Size: string,
  Quantity: number,
}

export interface EditItemSizeVariantDto {
  // id is non-null on existing/old objects
  Id?: string,
  Size: string,
  Quantity: number
}

//
//    PHOTO
//
export interface PhotoDto {
  id: string,
  url: string,
  isMain: boolean,
  sortOrder: number,
}

export interface ClientPhoto {
  serverId?: string,
  clientId: string,
  isMain: boolean,
  // only new photos have file stuff
  file?: File,
  fileName?: string,
  // existing photos have urls
  url?: string,
  sortOrder: number,
}

export interface CreatePhotoDto {
  FileName: string,
  SortOrder: number,
  IsMain: boolean,
}

export interface EditPhotoDto {
  // id is non-null on existing/old objects
  Id?: string,
  // New photos must have a filename specified.
  FileName?: string,
  SortOrder: number,
  IsMain: boolean,
}
