export interface Company {
  id: string;
  name: string;
  drive_folder_id: string; // Creates a folder in Drive or uses an existing one
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
  | "posted"
  | "rejected";

export interface ContentPiece {
  id: string;
  topic: string;
  title?: string;
  script: string;
  status: ContentStatus;
  platform: "instagram" | "tiktok" | "youtube";
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
  avatarUrl?: string; // Optional URL for profile picture
}

export interface LeadMagnet {
  id: string;
  keyword: string;
  title: string;
  subtitle: string;
  type: "pdf" | "checklist" | "webinar" | "other" | "excel";
}

