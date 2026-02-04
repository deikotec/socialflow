export interface Company {
  id: string;
  name: string;
  drive_folder_id: string; // Creates a folder in Drive or uses an existing one
  portalToken: string; // Secure token for public access
  createdAt: Date;
  ownerId: string; // The user (agency/freelancer) who manages this company
  // Potentially add settings for AI tone, branding, etc.
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
  drive_file_id?: string;
  feedback?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  owned_companies: string[]; // Array of Company IDs managed by this user
  role: "admin" | "editor" | "viewer"; 
}
