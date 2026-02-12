export interface ListingLocation {
  state?: string;
  district?: string;
  pincode?: string;
}

export interface ListingSeller {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
}

export interface Listing {
  _id: string;
  sellerId?: string;
  seller?: ListingSeller;
  type?: "sell" | "buy";
  cropName: string;
  cropType?: string; // compatibility alias
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location?: ListingLocation;
  harvestDate?: string;
  description?: string;
  images?: string[];
  status?: "active" | "sold" | "expired";
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateListingInput {
  type?: "sell" | "buy";
  cropName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: {
    state: string;
    district: string;
    pincode: string;
  };
  harvestDate?: string;
  description?: string;
}
