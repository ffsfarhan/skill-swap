export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isBanned?: boolean;
  location?: string;
  avatarUrl?: string;
  skillsOffered: Skill[];
  skillsWanted: Skill[];
  availability: string;
  isPublic: boolean;
  interests: string;
}

export interface Skill {
  id: string;
  name:string;
  category: 'Tech' | 'Creative' | 'Business' | 'Lifestyle' | 'Other';
}

export type SwapStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface SwapRequest {
  id: string;
  fromUser: User;
  toUser: User;
  offeredSkill: Skill;
  wantedSkill: Skill;
  status: SwapStatus;
  createdAt: Date;
  message?: string;
  fromUserRating?: number;
  fromUserFeedback?: string;
  toUserRating?: number;
  toUserFeedback?: string;
}
