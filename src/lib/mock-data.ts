import type { User, Skill, SwapRequest } from './types';

export const skills: Skill[] = [
  { id: '1', name: 'Photoshop', category: 'Creative' },
  { id: '2', name: 'Excel', category: 'Business' },
  { id: '3', name: 'React', category: 'Tech' },
  { id: '4', name: 'Guitar', category: 'Lifestyle' },
  { id: '5', name: 'Copywriting', category: 'Creative' },
  { id: '6', name: 'Next.js', category: 'Tech' },
  { id: '7', name: 'SEO', category: 'Business' },
  { id: '8', name: 'Yoga', category: 'Lifestyle' },
  { id: '9', name: 'Illustration', category: 'Creative' },
  { id: '10', name: 'Node.js', category: 'Tech' },
];

export const users: User[] = [
  {
    id: '1',
    name: 'Alex Doe',
    email: 'alex@example.com',
    isAdmin: false,
    isBanned: false,
    location: 'San Francisco, CA',
    avatarUrl: 'https://placehold.co/100x100.png',
    skillsOffered: [skills[0], skills[2], skills[5]],
    skillsWanted: [skills[3], skills[7]],
    availability: 'Evenings & Weekends',
    isPublic: true,
    interests: 'I am a web developer looking to get into music production and mindfulness practices. I love building beautiful and functional web applications.'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    isAdmin: false,
    isBanned: false,
    location: 'New York, NY',
    avatarUrl: 'https://placehold.co/100x100.png',
    skillsOffered: [skills[3], skills[4], skills[8]],
    skillsWanted: [skills[0], skills[1]],
    availability: 'Weekdays',
    isPublic: true,
    interests: 'Marketing specialist and musician. I want to improve my design skills for creating marketing assets.'
  },
  {
    id: '3',
    name: 'Sam Wilson',
    email: 'sam@example.com',
    isAdmin: false,
    isBanned: true,
    location: 'Chicago, IL',
    avatarUrl: 'https://placehold.co/100x100.png',
    skillsOffered: [skills[1], skills[6]],
    skillsWanted: [skills[9]],
    availability: 'Weekends',
    isPublic: false,
    interests: 'Business analyst who wants to learn backend development to build my own startup ideas.'
  },
  {
    id: '4',
    name: 'Admin User',
    email: 'admin@example.com',
    isAdmin: true,
    isBanned: false,
    location: 'Control Room',
    avatarUrl: 'https://placehold.co/100x100.png',
    skillsOffered: [],
    skillsWanted: [],
    availability: '24/7',
    isPublic: false,
    interests: 'Overseeing the SkillHub platform.'
  }
];

// This is no longer the single source of truth for the current user.
// Auth context will manage the logged-in user.
// export const currentUser: User = users[0];

export const swapRequests: SwapRequest[] = [
  {
    id: 'swap1',
    fromUser: users[1],
    toUser: users[0],
    offeredSkill: skills[3],
    wantedSkill: skills[2],
    status: 'pending',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
  },
  {
    id: 'swap2',
    fromUser: users[0],
    toUser: users[2],
    offeredSkill: skills[5],
    wantedSkill: skills[9],
    status: 'pending',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: 'swap3',
    fromUser: users[2],
    toUser: users[1],
    offeredSkill: skills[1],
    wantedSkill: skills[4],
    status: 'accepted',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
  },
    {
    id: 'swap4',
    fromUser: users[0],
    toUser: users[1],
    offeredSkill: skills[0],
    wantedSkill: skills[8],
    status: 'completed',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
    fromUserRating: 5,
    fromUserFeedback: "Jane was a fantastic and patient teacher!",
    toUserRating: 4,
    toUserFeedback: "Alex was great, very knowledgeable."
  },
  {
    id: 'swap5',
    fromUser: users[1],
    toUser: users[0],
    offeredSkill: skills[4],
    wantedSkill: skills[5],
    status: 'completed',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 8)),
    fromUserRating: 5,
    fromUserFeedback: "Great experience!",
  },
];