export interface ISoilHealthCard {
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  pH: number | null;
  lastUpdated?: string;
}

export interface ILocation {
  state?: string;
  district?: string;
  pincode?: string;
}

export interface IFarmDetails {
  farmName?: string;
  totalLandArea?: number;
  landUnit: "acre" | "hectare" | "bigha";
  irrigationType?: "rainfed" | "canal" | "well" | "drip" | "sprinkler";
  primaryCrops: string[];
  farmingType?: "organic" | "conventional" | "mixed";
  farmLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
}

export interface IBusinessDetails {
  businessName?: string;
  gstNumber?: string;
  businessType?: string;
  purchaseVolume?: number;
}

export interface IBankDetails {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branch?: string;
  isVerified: boolean;
}

export interface IDocument {
  _id: string;
  type: "aadhaar" | "kisan_credit_card" | "land_record" | "bank_passbook" | "other";
  documentName: string;
  documentUrl: string;
  verificationStatus: "pending" | "verified" | "rejected";
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface IActivity {
  action: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface INotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketingEmails: boolean;
  priceAlerts: boolean;
  newMessages: boolean;
  listingUpdates: boolean;
}

export interface IAchievement {
  name: string;
  earnedAt: string;
  description: string;
}

export interface IProfileStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalRevenue: number;
  totalQuantitySold: number;
  averageRating: number;
  totalReviews: number;
  profileViews: number;
  lastActiveAt: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "farmer" | "buyer" | "admin";
  language: string;
  location?: ILocation;
  soilHealthCard?: ISoilHealthCard;
  isVerified: boolean;
  createdAt: string;
}

export interface IUserProfile {
  profileCompletion: number;
  farmDetails?: IFarmDetails;
  businessDetails?: IBusinessDetails;
  kycStatus: "not_started" | "pending" | "verified" | "rejected";
  stats: IProfileStats;
  badges: string[];
  achievements: IAchievement[];
  preferences: {
    language: string;
    currency: "INR";
    timezone: string;
    notifications: INotificationPreferences;
  };
}

export interface IProfileData {
  user: IUser;
  profile: IUserProfile;
}

export interface IAnalytics {
  period: string;
  summary: {
    totalListings: number;
    activeListings: number;
    soldListings: number;
    totalRevenue: number;
    averageListingPrice: number;
    conversionRate: string;
  };
  listingsOverTime: {
    _id: string;
    count: number;
    revenue: number;
  }[];
  cropDistribution: {
    _id: string;
    count: number;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  topPerformingCrops: {
    _id: string;
    count: number;
    totalQuantity: number;
    totalRevenue: number;
  }[];
}

export interface IListing {
  _id: string;
  sellerId: string;
  type: "sell" | "buy";
  cropName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  images: string[];
  description?: string;
  location: {
    state?: string;
    district?: string;
  };
  status: "active" | "sold" | "expired";
  expiryDate?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}
