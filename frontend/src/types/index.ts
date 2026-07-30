export type Role = 'ADMIN' | 'USER';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export interface AttractionImage {
  id: string;
  url: string;
  publicId: string | null;
  isCover: boolean;
  altText: string | null;
  position: number;
}

export interface Attraction {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  history: string | null;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  entryFee: string;
  contactPhone: string | null;
  contactEmail: string | null;
  estimatedVisitDuration: string | null;
  bestVisitingTime: string | null;
  safetyInfo: string | null;
  accessibilityInfo: string | null;
  visitorTips: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  category: Category;
  images: AttractionImage[];
}

export interface ReviewAuthor {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  attractionId: string;
  user: ReviewAuthor;
}

export interface PaginatedReviews {
  items: Review[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Favorite {
  id: string;
  createdAt: string;
  attraction: Attraction;
}

export interface PaginatedAttractions {
  items: Attraction[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AttractionListParams {
  q?: string;
  category?: string;
  district?: string;
  featured?: boolean;
  sort?: 'newest' | 'name';
  page?: number;
  pageSize?: number;
}
