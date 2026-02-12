import type { Listing } from "../../types/listing";

const emptyLocation = {
  state: "",
  district: "",
  pincode: "",
};

export const normalizeListing = (input: Partial<Listing>): Listing => {
  const cropName = input.cropName ?? input.cropType ?? "Unknown Crop";

  return {
    _id: input._id ?? `${cropName}-${Date.now()}`,
    sellerId: input.sellerId,
    seller: input.seller,
    type: input.type,
    cropName,
    cropType: cropName,
    quantity: input.quantity ?? 0,
    unit: input.unit ?? "kg",
    pricePerUnit: input.pricePerUnit ?? 0,
    location: {
      ...emptyLocation,
      ...(input.location ?? {}),
    },
    harvestDate: input.harvestDate,
    description: input.description,
    images: input.images ?? [],
    status: input.status ?? "active",
    views: input.views ?? 0,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
};

export const normalizeListings = (items: Partial<Listing>[]) => items.map(normalizeListing);
