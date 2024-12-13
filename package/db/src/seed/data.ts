/**
 * Seed content for the demo catalog.
 *
 * Playable sources are the Blender Foundation open movies and the Google sample
 * clips that ship with them — all Creative Commons, all hosted publicly. The app
 * works without them; a video with no `source` simply renders its poster and the
 * player reports that no source is attached.
 */

const SAMPLE_BASE = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample";

export const SAMPLE_SOURCES = [
  `${SAMPLE_BASE}/BigBuckBunny.mp4`,
  `${SAMPLE_BASE}/ElephantsDream.mp4`,
  `${SAMPLE_BASE}/ForBiggerBlazes.mp4`,
  `${SAMPLE_BASE}/ForBiggerEscapes.mp4`,
  `${SAMPLE_BASE}/ForBiggerFun.mp4`,
  `${SAMPLE_BASE}/ForBiggerJoyrides.mp4`,
  `${SAMPLE_BASE}/ForBiggerMeltdowns.mp4`,
  `${SAMPLE_BASE}/Sintel.mp4`,
  `${SAMPLE_BASE}/SubaruOutbackOnStreetAndDirt.mp4`,
  `${SAMPLE_BASE}/TearsOfSteel.mp4`,
  `${SAMPLE_BASE}/VolkswagenGTIReview.mp4`,
  `${SAMPLE_BASE}/WeAreGoingOnBullrun.mp4`,
  `${SAMPLE_BASE}/WhatCarCanYouGetForAGrand.mp4`,
] as const;

export type SeedCategory = {
  accentColor: string;
  description: string;
  name: string;
  slug: string;
};

export const CATEGORIES: SeedCategory[] = [
  {
    accentColor: "#a3e635",
    description: "Architecture, tooling and the long tail of things that break in production.",
    name: "Engineering",
    slug: "engineering",
  },
  {
    accentColor: "#38bdf8",
    description: "Interface craft, type, motion and the arguments behind them.",
    name: "Design",
    slug: "design",
  },
  {
    accentColor: "#f472b6",
    description: "Sessions, sound design and studio walkthroughs.",
    name: "Music",
    slug: "music",
  },
  {
    accentColor: "#fb923c",
    description: "Playthroughs, retrospectives and the occasional speedrun.",
    name: "Gaming",
    slug: "gaming",
  },
  {
    accentColor: "#818cf8",
    description: "Explainers that take the long way round on purpose.",
    name: "Science",
    slug: "science",
  },
  {
    accentColor: "#fbbf24",
    description: "Technique first, recipes second.",
    name: "Cooking",
    slug: "cooking",
  },
  {
    accentColor: "#2dd4bf",
    description: "Slow routes, small towns and what the guidebooks leave out.",
    name: "Outdoors",
    slug: "outdoors",
  },
];

export type SeedChannel = {
  accentColor: string;
  bio: string;
  description: string;
  displayName: string;
  email: string;
  handle: string;
  name: string;
  username: string;
};

export const CHANNELS: SeedChannel[] = [
  {
    accentColor: "#a3e635",
    bio: "Backend engineer. I like boring technology and fast build times.",
    description:
      "Long-form engineering talks about the parts of a system nobody puts on the architecture diagram.",
    displayName: "Ada Sorokina",
    email: "ada@vihub.dev",
    handle: "coldstart",
    name: "Cold Start",
    username: "ada",
  },
  {
    accentColor: "#38bdf8",
    bio: "Designer, recovering typographer.",
    description: "Interface teardowns, type experiments and opinions about spacing.",
    displayName: "Ines Marchetti",
    email: "ines@vihub.dev",
    handle: "eightpoint",
    name: "Eight Point Grid",
    username: "ines",
  },
  {
    accentColor: "#f472b6",
    bio: "Producer. Mostly hardware, occasionally regrettable.",
    description: "Studio sessions recorded in one take, mistakes included.",
    displayName: "Teo Varlamov",
    email: "teo@vihub.dev",
    handle: "roomtone",
    name: "Room Tone",
    username: "teo",
  },
  {
    accentColor: "#fb923c",
    bio: "I finish games so you do not have to.",
    description: "Retrospectives on games that deserved better, and a few that did not.",
    displayName: "Marek Dvořák",
    email: "marek@vihub.dev",
    handle: "secondplay",
    name: "Second Playthrough",
    username: "marek",
  },
  {
    accentColor: "#818cf8",
    bio: "Physicist by training, explainer by accident.",
    description: "Twenty minute explainers for questions that sound like they need five.",
    displayName: "Priya Raghunathan",
    email: "priya@vihub.dev",
    handle: "slowlight",
    name: "Slow Light",
    username: "priya",
  },
  {
    accentColor: "#fbbf24",
    bio: "Cook. Formerly a line cook, still tired.",
    description: "Technique-first cooking. Fewer ingredients, more heat control.",
    displayName: "Joaquín Rey",
    email: "joaquin@vihub.dev",
    handle: "hardsear",
    name: "Hard Sear",
    username: "joaquin",
  },
  {
    accentColor: "#2dd4bf",
    bio: "Walking somewhere, slowly.",
    description: "Unhurried films about long walks and the places at the end of them.",
    displayName: "Nora Lindqvist",
    email: "nora@vihub.dev",
    handle: "longway",
    name: "The Long Way",
    username: "nora",
  },
];

export type SeedVideo = {
  categorySlug: string;
  channelHandle: string;
  description: string;
  tags: string[];
  title: string;
};

export const VIDEOS: SeedVideo[] = [
  // --- Engineering ---------------------------------------------------------
  {
    categorySlug: "engineering",
    channelHandle: "coldstart",
    description:
      "Every service starts as one process and a database. This is a walk through the four rewrites that followed, what each one actually bought us, and the one we should have skipped.",
    tags: ["architecture", "postgres", "scaling"],
    title: "The four rewrites it took to stop paging ourselves at 3am",
  },
  {
    categorySlug: "engineering",
    channelHandle: "coldstart",
    description:
      "A monorepo is a build graph pretending to be a folder. Once you accept that, most of the tooling arguments answer themselves.",
    tags: ["monorepo", "tooling", "build"],
    title: "A monorepo is a build graph wearing a trench coat",
  },
  {
    categorySlug: "engineering",
    channelHandle: "coldstart",
    description:
      "We replaced every ORM call in a hot path with hand-written SQL, measured it, and put most of them back. Here is where the line actually is.",
    tags: ["postgres", "performance", "sql"],
    title: "We rewrote the ORM out of our hot path, then put half of it back",
  },
  {
    categorySlug: "engineering",
    channelHandle: "coldstart",
    description:
      "Types at the network boundary are the only ones that pay rent. A tour of contract-first APIs, and why the client should fail to compile.",
    tags: ["typescript", "api", "contracts"],
    title: "Contract-first APIs, or how to make the client fail to compile",
  },
  {
    categorySlug: "engineering",
    channelHandle: "coldstart",
    description:
      "Caching is easy. Invalidation is easy. Doing both at once, under load, with two writers, is the part nobody films.",
    tags: ["caching", "distributed-systems"],
    title: "Cache invalidation is fine, actually (it is the second writer)",
  },
  {
    categorySlug: "engineering",
    channelHandle: "coldstart",
    description:
      "Retries, timeouts and backoff look like three settings. They are one system, and getting one wrong quietly cancels the other two.",
    tags: ["reliability", "distributed-systems"],
    title: "Your retry policy is fighting your timeout",
  },

  // --- Design --------------------------------------------------------------
  {
    categorySlug: "design",
    channelHandle: "eightpoint",
    description:
      "Six interfaces that solve the same problem, ranked by how much they trust the person using them.",
    tags: ["ui", "teardown", "patterns"],
    title: "Six search bars, ranked by how much they trust you",
  },
  {
    categorySlug: "design",
    channelHandle: "eightpoint",
    description:
      "Dark mode is not an inverted stylesheet. A practical pass through contrast, elevation and the colours that stop working at 4% lightness.",
    tags: ["dark-mode", "color", "accessibility"],
    title: "Dark mode is not an inverted stylesheet",
  },
  {
    categorySlug: "design",
    channelHandle: "eightpoint",
    description:
      "Optical alignment beats mathematical alignment nearly every time, and here is the uncomfortable amount of nudging required to prove it.",
    tags: ["typography", "layout"],
    title: "Your centred text is not centred",
  },
  {
    categorySlug: "design",
    channelHandle: "eightpoint",
    description:
      "An eight point grid gives you fewer decisions, not fewer options. Building a spacing scale from scratch, live.",
    tags: ["spacing", "design-systems"],
    title: "Building a spacing scale you will not argue about",
  },
  {
    categorySlug: "design",
    channelHandle: "eightpoint",
    description:
      "Motion should explain where something came from. Most of it explains that the designer discovered easing curves.",
    tags: ["motion", "animation"],
    title: "Motion that explains, and motion that just happens",
  },
  {
    categorySlug: "design",
    channelHandle: "eightpoint",
    description:
      "Empty states are the first screen most people see and the last one anybody designs. A rework of five of them.",
    tags: ["ux", "empty-states"],
    title: "The empty state is the first screen, so design it first",
  },

  // --- Music ---------------------------------------------------------------
  {
    categorySlug: "music",
    channelHandle: "roomtone",
    description:
      "One take, four instruments, no click track. The whole session including the part where the take falls apart.",
    tags: ["live", "session"],
    title: "One take, four instruments, no click track",
  },
  {
    categorySlug: "music",
    channelHandle: "roomtone",
    description:
      "Reverb is a room you are inventing. Building three of them from scratch and finding out which one the song wanted.",
    tags: ["mixing", "reverb", "production"],
    title: "Building a room from scratch with three reverbs",
  },
  {
    categorySlug: "music",
    channelHandle: "roomtone",
    description:
      "Twelve dollars of guitar pedal against nine hundred dollars of plugin. Blind test, honest result.",
    tags: ["gear", "blind-test"],
    title: "A twelve dollar pedal against a nine hundred dollar plugin",
  },
  {
    categorySlug: "music",
    channelHandle: "roomtone",
    description:
      "Compression explained without a single diagram, using only the sound of a snare drum being made worse.",
    tags: ["mixing", "compression"],
    title: "Compression explained with one snare and no diagrams",
  },
  {
    categorySlug: "music",
    channelHandle: "roomtone",
    description:
      "Everything in the arrangement fights for the same 200 hertz. Clearing it out, one instrument at a time.",
    tags: ["mixing", "eq"],
    title: "Everything is fighting over 200 hertz",
  },

  // --- Gaming --------------------------------------------------------------
  {
    categorySlug: "gaming",
    channelHandle: "secondplay",
    description:
      "It reviewed badly, sold worse, and quietly invented three systems the genre still uses. A case for the defence.",
    tags: ["retrospective", "game-design"],
    title: "The game that flopped and then everyone copied it",
  },
  {
    categorySlug: "gaming",
    channelHandle: "secondplay",
    description:
      "A tutorial is a contract. Breaking down six openings that keep it and two famous ones that do not.",
    tags: ["game-design", "tutorials"],
    title: "The first ten minutes are a promise",
  },
  {
    categorySlug: "gaming",
    channelHandle: "secondplay",
    description:
      "Difficulty settings are a design failure most of the time and a kindness the rest. Sorting out which is which.",
    tags: ["difficulty", "accessibility"],
    title: "Difficulty settings are an admission of something",
  },
  {
    categorySlug: "gaming",
    channelHandle: "secondplay",
    description:
      "Fast travel solved a problem and created a better one. Twenty years of level designers arguing with themselves.",
    tags: ["level-design", "retrospective"],
    title: "Fast travel ruined the map it was built to fix",
  },
  {
    categorySlug: "gaming",
    channelHandle: "secondplay",
    description:
      "A full run at a game I have finished eleven times, narrating only the things I noticed on the eleventh.",
    tags: ["playthrough", "commentary"],
    title: "Eleventh playthrough, first time I noticed any of this",
  },

  // --- Science -------------------------------------------------------------
  {
    categorySlug: "science",
    channelHandle: "slowlight",
    description:
      "The answer takes eight minutes to arrive and about twenty to explain properly. Taking the twenty.",
    tags: ["physics", "light"],
    title: "Why light takes eight minutes and why that sentence is wrong",
  },
  {
    categorySlug: "science",
    channelHandle: "slowlight",
    description:
      "Entropy is not disorder, and the mug of coffee on my desk is going to help demonstrate why.",
    tags: ["thermodynamics", "entropy"],
    title: "Entropy is not disorder, and this coffee will prove it",
  },
  {
    categorySlug: "science",
    channelHandle: "slowlight",
    description:
      "Every measurement is a distribution wearing a number as a disguise. A gentle, thorough look at error bars.",
    tags: ["statistics", "measurement"],
    title: "The number is a disguise: reading error bars honestly",
  },
  {
    categorySlug: "science",
    channelHandle: "slowlight",
    description:
      "Half of what makes a material strong happens at a scale you will never see, and the other half is luck.",
    tags: ["materials", "engineering"],
    title: "What actually makes steel strong",
  },
  {
    categorySlug: "science",
    channelHandle: "slowlight",
    description:
      "A short history of the second, and why redefining it keeps turning out to be the hardest part of physics.",
    tags: ["metrology", "time"],
    title: "Nobody agrees what a second is",
  },

  // --- Cooking -------------------------------------------------------------
  {
    categorySlug: "cooking",
    channelHandle: "hardsear",
    description:
      "Heat control is the whole skill. Four proteins, one pan, and the temperatures nobody writes down.",
    tags: ["technique", "searing"],
    title: "Four proteins, one pan, and the temperatures nobody writes down",
  },
  {
    categorySlug: "cooking",
    channelHandle: "hardsear",
    description:
      "Salt earlier than you think, and considerably more of it. Testing the claim properly, with a scale.",
    tags: ["seasoning", "technique"],
    title: "Salt earlier, and more of it",
  },
  {
    categorySlug: "cooking",
    channelHandle: "hardsear",
    description:
      "A stock is an extraction, not a soup. Three of them side by side, timed and tasted.",
    tags: ["stock", "technique"],
    title: "A stock is an extraction, not a soup",
  },
  {
    categorySlug: "cooking",
    channelHandle: "hardsear",
    description:
      "The five knife cuts that actually change how food cooks, and the six that are there to look tidy.",
    tags: ["knife-skills", "technique"],
    title: "Five knife cuts that matter and six that are decoration",
  },
  {
    categorySlug: "cooking",
    channelHandle: "hardsear",
    description:
      "Bread with four ingredients and one variable. Changing the variable eight times to see what happens.",
    tags: ["bread", "baking"],
    title: "One dough, eight variables, eight loaves",
  },

  // --- Outdoors ------------------------------------------------------------
  {
    categorySlug: "outdoors",
    channelHandle: "longway",
    description:
      "Nine days on foot along a coastline, filmed mostly at walking pace because that is the pace it happened at.",
    tags: ["hiking", "coast", "slow-tv"],
    title: "Nine days along a coastline, at walking pace",
  },
  {
    categorySlug: "outdoors",
    channelHandle: "longway",
    description:
      "The town has a population of forty and a bus twice a week. I stayed for a month.",
    tags: ["travel", "portrait"],
    title: "Population forty, bus twice a week",
  },
  {
    categorySlug: "outdoors",
    channelHandle: "longway",
    description:
      "Everything I carried for two weeks, weighed, and the four things I would leave behind next time.",
    tags: ["gear", "hiking"],
    title: "Everything I carried for two weeks, weighed",
  },
  {
    categorySlug: "outdoors",
    channelHandle: "longway",
    description:
      "Winter light lasts four hours here. A film about working within that, rather than around it.",
    tags: ["winter", "photography"],
    title: "Four hours of light",
  },
  {
    categorySlug: "outdoors",
    channelHandle: "longway",
    description:
      "The route was closed, the weather turned, and the detour was better than the plan. Usually is.",
    tags: ["hiking", "detour"],
    title: "The detour was better than the plan",
  },
];

export const COMMENT_BODIES = [
  "The part at the halfway mark reframed something I have been stuck on for weeks. Thank you for taking the long route.",
  "Watched this twice. The second time I finally caught why the first example does not generalise.",
  "I disagree with the conclusion but the argument is the clearest version of it I have seen.",
  "Please do a follow-up on the case you skipped near the end — that is the one I keep hitting.",
  "Sent this to my whole team. Two of them have already changed their minds.",
  "The pacing here is excellent. No filler, no restating the thesis four times.",
  "Came for the title, stayed for the tangent about tooling.",
  "This answered a question I did not know how to ask.",
  "Small correction: the figure quoted around the two thirds mark has been revised since.",
  "Genuinely the best explanation of this on the internet right now.",
  "I have been doing the opposite of this for years and it has been fine, but I see the argument.",
  "More of this format please. The side-by-side comparison did all the work.",
];

export const REPLY_BODIES = [
  "Agreed — and it holds up even in the edge case they mention later.",
  "Same experience here, though our numbers were nowhere near as dramatic.",
  "There is a follow-up on the channel that covers exactly this.",
  "Worth noting this changed in the most recent version.",
  "This is the comment I was scrolling for.",
];
