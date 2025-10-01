export const haikyuuCharacters = [
  {
    id: 1,
    name: "Kei Tsukishima",
    rarity: "SSR",
    playerType: "Blocking Specialist",
    school: "Karasuno High",
    position: "Middle Blocker",

    // Basic Attack Stats
    basicAttack: {
      quickAttack: 530,
      powerAttack: 107,
      set: 464,
      serve: 488,
    },

    // Bonus Attack Stats (percentages)
    bonusAttack: {
      awareness: 0,
      strength: 0,
      attackTechnique: 0,
    },

    // Basic Defense Stats
    basicDefense: {
      receive: 473,
      block: 560,
      save: 445,
    },

    // Bonus Defense Stats (percentages)
    bonusDefense: {
      reflex: 5,
      spirit: 0,
      defenseTechnique: 0,
    },

    // Potential System
    potential: {
      slots: 6,
      recommended: ["block", "quick attack"],
      recommendedSets: ["precise block", "block movement"],
    },

    // Memory System
    memories: {
      count: 1,
      recommended: ["block boost kei tsukishima"],
    },

    // Bond System
    bonds: [
      {
        name: "Master and Apprentice",
        characters: ["Kei Tsukishima", "Tetsuro Kuroo"],
        description: "Enhanced coordination and blocking effectiveness",
      },
      {
        name: "Shield and Spear",
        characters: ["Kei Tsukishima", "Tadashi Yamaguchi"],
        description: "Improved defensive positioning and attack support",
      },
    ],

    // Recommended Lineup
    recommendedLineup: [
      { name: "Shoyo Hinata", rarity: "SSR" },
      { name: "Tobio Kageyama", rarity: "SSR" },
      { name: "Kei Tsukishima", rarity: "SSR" },
      { name: "Yu Nishinoya", rarity: "SR" },
    ],

    // Character Description
    description:
      "A strategic middle blocker with exceptional read blocking abilities. Excels at shutting down opponent attacks and providing defensive stability for the team.",

    // Gameplay Tips
    gameplayTips: [
      "Use blocking specialist type advantage against power-type attacks",
      "Focus on block and quick attack potential for optimal performance",
      "Coordinate with bond partners for enhanced team effectiveness",
    ],
  },

  {
    id: 2,
    name: "Shoyo Hinata",
    rarity: "SSR",
    playerType: "Quick Attack Type",
    school: "Karasuno High",
    position: "Wing Spiker",

    // Basic Attack Stats
    basicAttack: {
      quickAttack: 580,
      powerAttack: 320,
      set: 150,
      serve: 280,
    },

    // Bonus Attack Stats (percentages)
    bonusAttack: {
      awareness: 15,
      strength: 8,
      attackTechnique: 12,
    },

    // Basic Defense Stats
    basicDefense: {
      receive: 380,
      block: 290,
      save: 320,
    },

    // Bonus Defense Stats (percentages)
    bonusDefense: {
      reflex: 20,
      spirit: 10,
      defenseTechnique: 5,
    },

    // Potential System
    potential: {
      slots: 6,
      recommended: ["quick attack", "awareness"],
      recommendedSets: ["quick attack boost", "awareness enhancement"],
    },

    // Memory System
    memories: {
      count: 1,
      recommended: ["quick attack boost shoyo hinata"],
    },

    // Bond System
    bonds: [
      {
        name: "Quick Attack Duo",
        characters: ["Shoyo Hinata", "Tobio Kageyama"],
        description: "Enhanced quick attack timing and coordination",
      },
    ],

    // Recommended Lineup
    recommendedLineup: [
      { name: "Shoyo Hinata", rarity: "SSR" },
      { name: "Tobio Kageyama", rarity: "SSR" },
      { name: "Kei Tsukishima", rarity: "SSR" },
      { name: "Yu Nishinoya", rarity: "SR" },
    ],

    // Character Description
    description:
      "A dynamic quick attack specialist with exceptional jumping ability and speed. Excels at fast-paced offensive plays and can deal increased damage when opponents attempt to block.",

    // Gameplay Tips
    gameplayTips: [
      "Use quick attack type advantage for increased damage against blocks",
      "Focus on quick attack and awareness potential for optimal performance",
      "Coordinate with setter for maximum quick attack effectiveness",
    ],
  },

  {
    id: 3,
    name: "Tobio Kageyama",
    rarity: "SSR",
    playerType: "Setter Specialist",
    school: "Karasuno High",
    position: "Setter",

    // Basic Attack Stats
    basicAttack: {
      quickAttack: 180,
      powerAttack: 420,
      set: 650,
      serve: 520,
    },

    // Bonus Attack Stats (percentages)
    bonusAttack: {
      awareness: 25,
      strength: 5,
      attackTechnique: 30,
    },

    // Basic Defense Stats
    basicDefense: {
      receive: 350,
      block: 280,
      save: 380,
    },

    // Bonus Defense Stats (percentages)
    bonusDefense: {
      reflex: 15,
      spirit: 8,
      defenseTechnique: 20,
    },

    // Potential System
    potential: {
      slots: 6,
      recommended: ["set", "attack technique"],
      recommendedSets: ["precision setting", "technique enhancement"],
    },

    // Memory System
    memories: {
      count: 1,
      recommended: ["set boost tobio kageyama"],
    },

    // Bond System
    bonds: [
      {
        name: "Quick Attack Duo",
        characters: ["Tobio Kageyama", "Shoyo Hinata"],
        description: "Enhanced quick attack timing and coordination",
      },
    ],

    // Recommended Lineup
    recommendedLineup: [
      { name: "Shoyo Hinata", rarity: "SSR" },
      { name: "Tobio Kageyama", rarity: "SSR" },
      { name: "Kei Tsukishima", rarity: "SSR" },
      { name: "Yu Nishinoya", rarity: "SR" },
    ],

    // Character Description
    description:
      "A precision setter with exceptional technique and court vision. Excels at setting up teammates for optimal attacks and controlling the pace of the game.",

    // Gameplay Tips
    gameplayTips: [
      "Focus on set and attack technique potential for optimal performance",
      "Coordinate with quick attack players for maximum effectiveness",
      "Use awareness bonus to read opponent positioning",
    ],
  },

  {
    id: 4,
    name: "Yu Nishinoya",
    rarity: "SR",
    playerType: "Defensive Specialist",
    school: "Karasuno High",
    position: "Libero",

    // Basic Attack Stats
    basicAttack: {
      quickAttack: 120,
      powerAttack: 180,
      set: 200,
      serve: 250,
    },

    // Bonus Attack Stats (percentages)
    bonusAttack: {
      awareness: 10,
      strength: 3,
      attackTechnique: 8,
    },

    // Basic Defense Stats
    basicDefense: {
      receive: 620,
      block: 180,
      save: 680,
    },

    // Bonus Defense Stats (percentages)
    bonusDefense: {
      reflex: 35,
      spirit: 25,
      defenseTechnique: 30,
    },

    // Potential System
    potential: {
      slots: 5,
      recommended: ["receive", "save"],
      recommendedSets: ["defensive positioning", "reflex enhancement"],
    },

    // Memory System
    memories: {
      count: 1,
      recommended: ["receive boost yu nishinoya"],
    },

    // Bond System
    bonds: [
      {
        name: "Defensive Wall",
        characters: ["Yu Nishinoya", "Kei Tsukishima"],
        description: "Enhanced defensive coordination and positioning",
      },
    ],

    // Recommended Lineup
    recommendedLineup: [
      { name: "Shoyo Hinata", rarity: "SSR" },
      { name: "Tobio Kageyama", rarity: "SSR" },
      { name: "Kei Tsukishima", rarity: "SSR" },
      { name: "Yu Nishinoya", rarity: "SR" },
    ],

    // Character Description
    description:
      "An exceptional defensive specialist with outstanding receiving and saving abilities. Excels at keeping the ball in play and providing defensive stability.",

    // Gameplay Tips
    gameplayTips: [
      "Focus on receive and save potential for optimal defensive performance",
      "Use defensive specialist type advantage for enhanced positioning",
      "Coordinate with blocking players for complete defensive coverage",
    ],
  },
];
