
export type Group = {
  id: string;
  name: string;
  members: number;
  lastActivity: string;
  previewMembers: string[];
  createdBy: string;
  membersList?: {[key: string]: boolean};
  createdAt?: number;
};

// Sample group data for initial setup
export const sampleGroups = [
  {
    name: "European Adventure 2023",
    members: 4,
    createdBy: "system",
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
    lastActivity: '2 days ago',
    previewMembers: ['A', 'B', 'C', 'D'],
    membersList: { system: true }
  },
  {
    name: "Beach Weekend Getaway",
    members: 3,
    createdBy: "system",
    createdAt: Date.now() - 86400000 * 3, // 3 days ago
    lastActivity: '12 hours ago',
    previewMembers: ['E', 'F', 'G'],
    membersList: { system: true }
  },
  {
    name: "Hiking Trip Planning",
    members: 2,
    createdBy: "system",
    createdAt: Date.now() - 86400000, // 1 day ago
    lastActivity: 'Just now',
    previewMembers: ['H', 'I'],
    membersList: { system: true }
  }
];

// Sample messages for each group
export const sampleMessages: {[key: string]: any[]} = {
  "European Adventure 2023": [
    {
      text: "Hey everyone! I'm so excited for our trip to Europe next month!",
      senderId: "system",
      senderName: "TravelBuddy",
      timestamp: Date.now() - 86400000 * 6, // 6 days ago
    },
    {
      text: "Me too! I've been researching some great restaurants in Paris.",
      senderId: "user1",
      senderName: "Emma",
      timestamp: Date.now() - 86400000 * 5, // 5 days ago
    },
    {
      text: "Has anyone booked their flights yet? I found some good deals on Expedia.",
      senderId: "user2",
      senderName: "Jake",
      timestamp: Date.now() - 86400000 * 4, // 4 days ago
    }
  ],
  "Beach Weekend Getaway": [
    {
      text: "Who's bringing the beach umbrellas?",
      senderId: "user3",
      senderName: "Sophia",
      timestamp: Date.now() - 86400000 * 2, // 2 days ago
    },
    {
      text: "I'll bring them along with some coolers for drinks!",
      senderId: "system",
      senderName: "TravelBuddy",
      timestamp: Date.now() - 86400000 * 1.5, // 1.5 days ago
    },
    {
      text: "Great! I'll handle the snacks and sunscreen.",
      senderId: "user4",
      senderName: "David",
      timestamp: Date.now() - 86400000, // 1 day ago
    }
  ],
  "Hiking Trip Planning": [
    {
      text: "I found this amazing trail at Yosemite we should try!",
      senderId: "system",
      senderName: "TravelBuddy",
      timestamp: Date.now() - 43200000, // 12 hours ago
    },
    {
      text: "Looks challenging but fun! How long is the hike?",
      senderId: "user5",
      senderName: "Alex",
      timestamp: Date.now() - 21600000, // 6 hours ago
    },
    {
      text: "About 8 miles round trip. We should start early to avoid the afternoon heat.",
      senderId: "system",
      senderName: "TravelBuddy",
      timestamp: Date.now() - 7200000, // 2 hours ago
    }
  ]
};
