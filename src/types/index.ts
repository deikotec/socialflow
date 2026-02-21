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
  aiStrategy?: FullStrategy; // AI-generated full strategy
  team?: TeamMember[];
  leadMagnets?: LeadMagnet[];
  settings?: {
    instagram?: string;
    website?: string;
    brandColor?: string;
    weeklyPostCount?: number;
    aiProvider?: "gemini" | "claude" | "openai";
    aiApiKey?: string; // User-provided API key for Claude or OpenAI
    // New Fields for AI Context
    targetNetworks?: string[]; // e.g. ["instagram", "tiktok"]
    contentResources?: string; // e.g. "con trabajadores", "con modelos"
    contentPlan?: string; // e.g. "3 posts semanales pro"
    manychatAutomations?: string; // e.g. "Comenta PDF para recibir guía"
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

// ── AI-Generated Full Strategy ─────────────────────────────────────────────

export interface ContentIdea {
  idea: string;
  channel: "instagram" | "tiktok" | "linkedin" | "youtube";
  format: "carousel" | "reel" | "static" | "linkedin_post" | "story";
  pillar: string;
}

export interface CalendarPost {
  time?: string;
  channel: "instagram" | "tiktok" | "linkedin";
  type: "carousel" | "reel" | "static" | "linkedin_post" | "story";
  title: string;
}

export interface CalendarDay {
  day: string;
  posts: CalendarPost[];
}

export interface KpiTarget {
  icon: string;
  label: string;
  value: string;
  target: string;
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  period: string;
  items: string[];
  color: string;
}

export interface CarouselSlide {
  num: string;
  role: string;
  text: string;
  subtext?: string;
  cta?: string;
  bg: string;
}

export interface ReelScene {
  sceneNum: number;
  timeRange: string;
  phase: string;
  what: string;
  how: string;
  textOverlay: string;
}

export interface ContentLibraryItem {
  id: string;
  title: string;
  type: "carousel" | "reel" | "linkedin";
  channels: string[];
  pillar: string;
  strategyNote: string;
  engTargets: { icon: string; label: string; desc: string }[];
  slides?: CarouselSlide[];
  duration?: string;
  ratio?: string;
  music?: string;
  scenes?: ReelScene[];
  script?: { hook: string; body: string; cta: string };
  linkedinPost?: string;
  linkedinHashtags?: string;
  caption: string;
  hashtags: string;
  isUsed?: boolean; // If true, the idea was used/published
}

export interface StoriesFunnelPhase {
  phase: string;
  title: string;
  objective: string;
  description: string;
  days: string[];
  color: string;
}

export interface FullStrategy {
  generatedAt: string;
  summary: string;
  targetChannels: string[];
  insights: { icon: string; label: string; value: string; sub: string }[];
  pillars: {
    icon: string;
    name: string;
    desc: string;
    percentage: number;
    examples: string[];
    color: string;
  }[];
  contentIdeas: ContentIdea[];
  weeklyCalendar: CalendarDay[];
  kpis: KpiTarget[];
  roadmap: RoadmapPhase[];
  contentLibrary: ContentLibraryItem[];
  storiesFunnel: StoriesFunnelPhase[];
  pastUsedIdeas?: string[]; // History of used ideas
}

// Phase 7: Dashboard Advanced Interfaces

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

