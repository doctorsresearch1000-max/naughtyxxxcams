export type StreamItem = {
  id: string;
  username: string;
  displayName: string;
  viewers: number;
  image: string;
  avatar: string;
  likes: string;
  comments: string[];
};

export type ExploreModel = {
  id: string;
  username: string;
  viewers: number;
  image: string;
  tag: string;
};

export type NearbyLive = {
  id: string;
  username: string;
  avatar: string;
  isLive: boolean;
};

export type FollowedModel = {
  id: string;
  username: string;
  platform: string;
  status: string;
  updatedAgo: string;
  image: string;
};

export const feedStreams: StreamItem[] = [
  {
    id: "1",
    username: "luna_neon",
    displayName: "Luna Neon",
    viewers: 12840,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    likes: "24.1K",
    comments: [
      "🔥 you look amazing tonight",
      "drop the link queen",
      "can we get a private?",
      "LIVE vibes are insane",
      "sent a tip 💖",
    ],
  },
  {
    id: "2",
    username: "mika_velvet",
    displayName: "Mika Velvet",
    viewers: 9320,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80",
    likes: "18.7K",
    comments: [
      "welcome back!!!",
      "that outfit 😍",
      "following from Berlin",
      "turn up the music",
      "goal unlocked?",
    ],
  },
  {
    id: "3",
    username: "ruby_afterdark",
    displayName: "Ruby Afterdark",
    viewers: 15602,
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=200&q=80",
    likes: "31.4K",
    comments: [
      "stream quality is crisp",
      "hello from Miami",
      "VIP room open?",
      "you made my night",
      "share the schedule pls",
    ],
  },
  {
    id: "4",
    username: "nova_cyber",
    displayName: "Nova Cyber",
    viewers: 7744,
    image:
      "https://images.unsplash.com/photo-1521577352947-9bb58764b69a?auto=format&fit=crop&w=900&q=80",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    likes: "12.9K",
    comments: [
      "cyber aesthetic on point",
      "muted — tap for sound",
      "new fan here",
      "latina night energy",
      "boosted 🚀",
    ],
  },
];

export const exploreCategories = [
  { id: "live", label: "LIVE NOW", accent: true },
  { id: "1821", label: "18-21" },
  { id: "latina", label: "LATINA" },
  { id: "milf", label: "MILF" },
  { id: "asian", label: "ASIAN" },
  { id: "couples", label: "COUPLES" },
  { id: "bbw", label: "BBW" },
  { id: "fetish", label: "FETISH" },
];

export const trendingModels: ExploreModel[] = [
  {
    id: "t1",
    username: "sasha_glow",
    viewers: 22100,
    image:
      "https://images.unsplash.com/photo-1524250502761-1ad6dcb3ae88?auto=format&fit=crop&w=600&q=80",
    tag: "LIVE",
  },
  {
    id: "t2",
    username: "valentina_x",
    viewers: 18440,
    image:
      "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=600&q=80",
    tag: "LIVE",
  },
  {
    id: "t3",
    username: "kira_moon",
    viewers: 15320,
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
    tag: "LIVE",
  },
  {
    id: "t4",
    username: "jade_vip",
    viewers: 9870,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    tag: "LIVE",
  },
  {
    id: "t5",
    username: "mia_flame",
    viewers: 11205,
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
    tag: "LIVE",
  },
  {
    id: "t6",
    username: "elena_star",
    viewers: 8640,
    image:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=600&q=80",
    tag: "LIVE",
  },
];

export const liveNearby: NearbyLive[] = [
  {
    id: "n1",
    username: "zoey_live",
    avatar:
      "https://images.unsplash.com/photo-1524250502761-1ad6dcb3ae88?auto=format&fit=crop&w=200&q=80",
    isLive: true,
  },
  {
    id: "n2",
    username: "cleo_heat",
    avatar:
      "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=200&q=80",
    isLive: true,
  },
  {
    id: "n3",
    username: "nina_wave",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    isLive: false,
  },
  {
    id: "n4",
    username: "aria_night",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    isLive: true,
  },
  {
    id: "n5",
    username: "demi_rose",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    isLive: false,
  },
];

export const yourModels: FollowedModel[] = [
  {
    id: "y1",
    username: "luna_neon",
    platform: "STREAMATE",
    status: "Watch now",
    updatedAgo: "2 min ago",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "y2",
    username: "mika_velvet",
    platform: "CHATURBATE",
    status: "Private show",
    updatedAgo: "8 min ago",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "y3",
    username: "ruby_afterdark",
    platform: "STRIPCHAT",
    status: "Watch now",
    updatedAgo: "14 min ago",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
  },
];

export const profileUser = {
  name: "Alex Morgan",
  handle: "@alexm_tg",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
};

export const continueWatching = {
  username: "luna_neon",
  lastWatched: "18 seconds ago",
  image:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
};

export function formatViewers(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(count);
}
