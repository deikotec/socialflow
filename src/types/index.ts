export interface Company {
  id: string;
  name: string;
  drive_folder_id: string; // Creates a folder in Drive or uses an existing one
  drive_link?: string; // Direct URL to the Drive folder
  drive_refresh_token?: string; // Stored securely to access Drive API
  portalToken: string; // Secure token for public access,
  createdAt: Date;
  ownerId: string; // The user (agency/freelancer) who manages this company
  // Extended Data
  strategy?: StrategyBlock[];
  team?: TeamMember[];
  leadMagnets?: LeadMagnet[];
  settings?: {
    instagram?: string;
    website?: string;
    brandColor?: string;
    weeklyPostCount?: number;
  };
  // Detailed Profile
  sector?: string;
  description?: string;
  targetAudience?: string;
  usp?: string;
  tone?: string;
  socialConnections?: {
    instagram?: {
      accessToken: string;
      instagramUserId: string; // The IG Business Account ID
      pageId: string; // The Facebook Page ID
      username?: string; // For display
      updatedAt: Date;
    };
    tiktok?: {
      accessToken: string;
      refreshToken: string; // For refreshing access
      expiresIn: number;
      openId: string; // TikTok User ID
      username?: string; // For display
      updatedAt: Date;
    };
  };
  products?: ProductService[];
}

export interface ProductService {
  id: string;
  name: string;
  price: string;
  description: string;
  type: "product" | "service" | "info";
}

export type ContentStatus =
  | "idea"
  | "scripting"
  | "filming"
  | "editing"
  | "review"
  | "approved"
  | "scheduled"
  | "posted"
  | "rejected";

export interface ContentPiece {
  id: string;
  topic: string;
  title?: string;
  script: string;
  status: ContentStatus;
  platforms: ("instagram" | "tiktok" | "youtube")[];
  scheduledDate?: Date;
  recordingDate?: Date;
  drive_file_id?: string;
  feedback?: string;
  referenceLink?: string;
  caption?: string;
  format?: "reel" | "carousel" | "static" | "story";
  assignedTo?: string; // ID of the TeamMember
  createdAt: Date;
  updatedAt: Date;
  drive_link?: string; // Web accessible link
  carouselFiles?: {
    drive_file_id: string;
    drive_link: string;
    mimeType: string;
    order: number;
    name?: string;
  }[];
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  owned_companies: string[]; // Array of Company IDs managed by this user
  role: "admin" | "editor" | "viewer" | "freelancer" | "agency"; 
  createdAt?: Date;
}

// Phase 7: Dashboard Advanced Interfaces
export interface StrategyBlock {
  title: string;
  percentage: number;
  type: string; // Changed from fixed union to string for custom pillars
  keywords: string[];
  formats?: ("reel" | "carousel" | "static" | "story")[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  avatarUrl?: string; // Optional URL for profile picture
}

export interface LeadMagnet {
  id: string;
  keyword: string;
  title: string;
  subtitle: string;
  type: "pdf" | "checklist" | "webinar" | "other" | "excel";
}

