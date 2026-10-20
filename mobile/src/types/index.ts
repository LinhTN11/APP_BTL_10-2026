export interface User {
  id: string;
  email: string;
  hasProfile: boolean;
  profile?: Profile;
}

export interface Profile {
  id?: string;
  userId?: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate: string;
  age?: number;
  heightCm?: number | null;
  bio?: string | null;
  mbtiType?: string | null;
  dailyMood?: string | null;
  avatarUrl?: string | null;
  photos?: string[];
  distanceKm?: number;
  interests?: string[];
  latitude?: number;
  longitude?: number;
  isVirtualLocation?: boolean;
}

export interface CandidateProfile {
  id: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  heightCm?: number | null;
  bio?: string | null;
  mbtiType?: string | null;
  dailyMood?: string | null;
  avatarUrl?: string | null;
  photos: string[];
  distanceKm: number;
  interests: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isMe: boolean;
  isAiGenerated?: boolean;
  createdAt: string;
}

export interface Conversation {
  matchId: string;
  conversationId: string;
  createdAt: string;
  partner: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    mbtiType?: string | null;
    dailyMood?: string | null;
  };
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    isMe: boolean;
    createdAt: string;
  } | null;
}

export interface IcebreakerItem {
  style: 'Hài hước' | 'Tinh tế' | 'Trực diện';
  text: string;
}

export interface IcebreakerResponse {
  success: boolean;
  commonGround: string;
  icebreakers: IcebreakerItem[];
}
