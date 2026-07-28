export type PrintableFilterSelectionMode =
  | "single"
  | "multiple"
  | "hierarchical";

export type PrintableTitleSlot =
  | "prefix"
  | "core"
  | "resource_noun"
  | "format_suffix"
  | "context_suffix"
  | "price_suffix";

export type PrintableFilterOption = {
  id: string;
  groupSlug: string;
  groupLabel: string;
  slug: string;
  label: string;
  sortOrder: number;
  urlOrder: number;
  parentId: string | null;
  titleText: string;
  titleSlot: PrintableTitleSlot;
  titleOrder: number;
  includeParentUrl: boolean;
  isIndexable: boolean;
};

export type PrintableFilterGroup = {
  id: string;
  slug: string;
  label: string;
  displayOrder: number;
  urlOrder: number;
  titleOrder: number;
  selectionMode: PrintableFilterSelectionMode;
  options: PrintableFilterOption[];
};

export type PrintablePreviewImage = {
  url: string;
  alt: string;
};

export type PrintableProductFile = {
  slug: string;
  label: string;
  fileName: string;
  fileSizeBytes: number | null;
  isPrimary: boolean;
};

export type PrintableProduct = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  priceCents: number;
  currency: "USD";
  audience: string;
  difficulty: string;
  puzzleCount: number;
  answerKeyCount: number;
  totalPages: number;
  differencesPerPuzzle: number;
  previewImage: string;
  previewImages: PrintablePreviewImage[];
  badge: string;
  features: string[];
  keywordSignals: string[];
  isPremiumIncluded: boolean;
  salesCount: number;
  publishedAt: string;
  filterOptions: PrintableFilterOption[];
};

export type PrintablePremiumPlan = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  priceCents: number;
  currency: "USD";
  accessDays: number;
  features: string[];
  badge: string;
};

const option = (
  groupSlug: string,
  groupLabel: string,
  slug: string,
  label: string,
  sortOrder: number,
  config: Partial<
    Pick<
      PrintableFilterOption,
      | "urlOrder"
      | "parentId"
      | "titleText"
      | "titleSlot"
      | "titleOrder"
      | "includeParentUrl"
      | "isIndexable"
    >
  > = {},
): PrintableFilterOption => ({
  id: `${groupSlug}:${slug}`,
  groupSlug,
  groupLabel,
  slug,
  label,
  sortOrder,
  urlOrder: config.urlOrder ?? sortOrder,
  parentId: config.parentId ?? null,
  titleText: config.titleText ?? label,
  titleSlot: config.titleSlot ?? "core",
  titleOrder: config.titleOrder ?? sortOrder,
  includeParentUrl: config.includeParentUrl ?? false,
  isIndexable: config.isIndexable ?? true,
});

const fallbackOptions = {
  audience: [
    option("audience", "Audience", "preschool", "Preschool", 10),
    option("audience", "Audience", "kids", "Kids", 20),
    option("audience", "Audience", "adults-teens", "Adults & Teens", 30, {
      titleText: "Adult & Teen",
    }),
  ],
  theme: [
    option("theme", "Theme", "animals", "Animals", 10, {
      titleText: "Animal",
    }),
    option("theme", "Theme", "seasonal", "Seasonal", 20),
    option("theme", "Theme", "classroom", "Classroom", 30, {
      titleText: "Classroom-Themed",
    }),
    option("theme", "Theme", "geometric", "Geometric", 40),
  ],
  difficulty: [
    option("difficulty", "Difficulty", "easy", "Easy", 10),
    option("difficulty", "Difficulty", "easy-medium", "Easy to Medium", 20),
    option("difficulty", "Difficulty", "hard", "Hard", 30),
  ],
  price: [
    option("price", "Price", "free", "Free", 10, {
      titleSlot: "prefix",
      titleOrder: 0,
    }),
    option("price", "Price", "under-5", "Under $5", 20, {
      titleSlot: "price_suffix",
      titleOrder: 10,
    }),
    option("price", "Price", "5-to-10", "$5 to $10", 30, {
      titleText: "From $5 to $10",
      titleSlot: "price_suffix",
      titleOrder: 20,
    }),
    option("price", "Price", "premium", "Included with Premium", 40, {
      titleSlot: "price_suffix",
      titleOrder: 30,
    }),
  ],
  format: [
    option("format", "Format", "pdf", "Printable PDF", 10, {
      titleText: "in PDF Format",
      titleSlot: "format_suffix",
    }),
    option("format", "Format", "answer-keys", "Answer Keys Included", 20, {
      titleText: "with Answer Keys",
      titleSlot: "format_suffix",
    }),
  ],
  useCase: [
    option("use-case", "Use case", "worksheets", "Worksheets", 10, {
      titleText: "Spot the Difference Worksheets",
      titleSlot: "resource_noun",
    }),
    option("use-case", "Use case", "classroom-use", "Classroom", 20, {
      titleText: "for the Classroom",
      titleSlot: "context_suffix",
    }),
    option("use-case", "Use case", "homeschool", "Homeschool", 30, {
      titleText: "for Homeschool",
      titleSlot: "context_suffix",
    }),
    option(
      "use-case",
      "Use case",
      "travel-quiet-time",
      "Travel & Quiet Time",
      40,
      {
        titleText: "for Travel & Quiet Time",
        titleSlot: "context_suffix",
      },
    ),
    option(
      "use-case",
      "Use case",
      "senior-activities",
      "Senior Activities",
      50,
      {
        titleText: "for Senior Activities",
        titleSlot: "context_suffix",
      },
    ),
  ],
};

export const printableFilterGroups: PrintableFilterGroup[] = [
  {
    id: "audience",
    slug: "audience",
    label: "Audience",
    displayOrder: 10,
    urlOrder: 10,
    titleOrder: 10,
    selectionMode: "single",
    options: fallbackOptions.audience,
  },
  {
    id: "theme",
    slug: "theme",
    label: "Theme",
    displayOrder: 20,
    urlOrder: 20,
    titleOrder: 20,
    selectionMode: "single",
    options: fallbackOptions.theme,
  },
  {
    id: "difficulty",
    slug: "difficulty",
    label: "Difficulty",
    displayOrder: 30,
    urlOrder: 30,
    titleOrder: 30,
    selectionMode: "single",
    options: fallbackOptions.difficulty,
  },
  {
    id: "price",
    slug: "price",
    label: "Price",
    displayOrder: 40,
    urlOrder: 50,
    titleOrder: 50,
    selectionMode: "single",
    options: fallbackOptions.price,
  },
  {
    id: "format",
    slug: "format",
    label: "Format",
    displayOrder: 50,
    urlOrder: 40,
    titleOrder: 70,
    selectionMode: "single",
    options: fallbackOptions.format,
  },
  {
    id: "use-case",
    slug: "use-case",
    label: "Use case",
    displayOrder: 60,
    urlOrder: 60,
    titleOrder: 60,
    selectionMode: "single",
    options: fallbackOptions.useCase,
  },
];

function optionsFor(...keys: Array<[keyof typeof fallbackOptions, string[]]>) {
  return keys.flatMap(([group, slugs]) =>
    fallbackOptions[group].filter((item) => slugs.includes(item.slug)),
  );
}

export const printableProducts: PrintableProduct[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    slug: "free-printable-starter-pack",
    title: "Free Printable Starter Pack",
    shortDescription:
      "Three colorful spot-the-difference worksheets with complete answer keys.",
    description:
      "A no-cost sampler for families and teachers who want a quick, screen-free activity. Each page is printer-friendly and includes a matching answer key.",
    priceCents: 0,
    currency: "USD",
    audience: "Kids ages 4+",
    difficulty: "Easy",
    puzzleCount: 3,
    answerKeyCount: 3,
    totalPages: 7,
    differencesPerPuzzle: 5,
    previewImage: "/printables/previews/free-printable-starter-pack.png",
    previewImages: [
      {
        url: "/printables/previews/free-printable-starter-pack.png",
        alt: "Sample Sunny Park spot the difference puzzle page",
      },
      {
        url: "/printables/previews/free-printable-starter-pack-answer.png",
        alt: "Sample Sunny Park answer key page",
      },
      {
        url: "/printables/previews/free-printable-starter-pack-cover.png",
        alt: "Cover of the Free Printable Starter Pack",
      },
    ],
    badge: "Free",
    features: [
      "3 original full-page puzzles",
      "3 clearly marked answer keys",
      "US Letter and A4-friendly printing",
      "Instant PDF download with a free account",
    ],
    keywordSignals: [
      '"free printable spot the difference" - 140 US searches/month',
      '"spot the difference worksheets pdf free download" - 70/month',
    ],
    isPremiumIncluded: false,
    salesCount: 860,
    publishedAt: "2026-07-25T00:00:00.000Z",
    filterOptions: optionsFor(
      ["audience", ["kids"]],
      ["theme", ["classroom"]],
      ["difficulty", ["easy"]],
      ["price", ["free"]],
      ["format", ["pdf", "answer-keys"]],
      ["useCase", ["worksheets", "classroom-use", "homeschool", "travel-quiet-time"]],
    ),
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    slug: "preschool-animal-adventures",
    title: "Preschool Animal Adventures",
    shortDescription:
      "Twelve easy, colorful puzzles designed for preschool and kindergarten learners.",
    description:
      "Friendly visual puzzles with generous spacing and five changes per page. Designed for quiet time, early-finisher work, travel, and visual-discrimination practice.",
    priceCents: 349,
    currency: "USD",
    audience: "Ages 3-6",
    difficulty: "Easy",
    puzzleCount: 12,
    answerKeyCount: 12,
    totalPages: 25,
    differencesPerPuzzle: 5,
    previewImage: "/printables/previews/preschool-animal-adventures.png",
    previewImages: [
      {
        url: "/printables/previews/preschool-animal-adventures.png",
        alt: "Cover of Preschool Animal Adventures",
      },
    ],
    badge: "Best for little learners",
    features: [
      "12 original preschool-friendly puzzles",
      "12 complete answer keys",
      "Five differences on every puzzle",
      "Personal and single-classroom license",
    ],
    keywordSignals: [
      '"spot the difference for kids" - 390 US searches/month',
      '"preschool spot the difference" keyword family - steady demand',
    ],
    isPremiumIncluded: true,
    salesCount: 342,
    publishedAt: "2026-07-25T00:00:00.000Z",
    filterOptions: optionsFor(
      ["audience", ["preschool", "kids"]],
      ["theme", ["animals"]],
      ["difficulty", ["easy"]],
      ["price", ["under-5", "premium"]],
      ["format", ["pdf", "answer-keys"]],
      ["useCase", ["worksheets", "classroom-use", "homeschool", "travel-quiet-time"]],
    ),
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    slug: "classroom-seasons-bundle",
    title: "Classroom Seasons Bundle",
    shortDescription:
      "Twenty ready-to-print seasonal worksheets for class, homeschool, and parties.",
    description:
      "A year-round collection of spring, summer, autumn, winter, and school-themed challenges. Each worksheet works as a brain break, early-finisher activity, or party game.",
    priceCents: 599,
    currency: "USD",
    audience: "Ages 5-10",
    difficulty: "Easy to Medium",
    puzzleCount: 20,
    answerKeyCount: 20,
    totalPages: 41,
    differencesPerPuzzle: 7,
    previewImage: "/printables/previews/classroom-seasons-bundle.png",
    previewImages: [
      {
        url: "/printables/previews/classroom-seasons-bundle.png",
        alt: "Cover of the Classroom Seasons Bundle",
      },
    ],
    badge: "Best value",
    features: [
      "20 seasonal and classroom puzzles",
      "20 complete answer keys",
      "Seven differences on every puzzle",
      "Print repeatedly for one household or classroom",
    ],
    keywordSignals: [
      '"spot the difference worksheets" - 480 US searches/month',
      "Seasonal and classroom bundles show strong Etsy review signals",
    ],
    isPremiumIncluded: true,
    salesCount: 514,
    publishedAt: "2026-07-25T00:00:00.000Z",
    filterOptions: optionsFor(
      ["audience", ["kids"]],
      ["theme", ["seasonal", "classroom"]],
      ["difficulty", ["easy-medium"]],
      ["price", ["5-to-10", "premium"]],
      ["format", ["pdf", "answer-keys"]],
      ["useCase", ["worksheets", "classroom-use", "homeschool"]],
    ),
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    slug: "adult-hard-visual-challenge",
    title: "Adult Hard Visual Challenge",
    shortDescription:
      "Thirty dense printable puzzles for adults, teens, and senior activity groups.",
    description:
      "A high-volume challenge pack with smaller details and ten differences per puzzle. Ideal for screen-free focus practice, activity groups, travel, and rainy afternoons.",
    priceCents: 499,
    currency: "USD",
    audience: "Teens and adults",
    difficulty: "Hard",
    puzzleCount: 30,
    answerKeyCount: 30,
    totalPages: 61,
    differencesPerPuzzle: 10,
    previewImage: "/printables/previews/adult-hard-visual-challenge.png",
    previewImages: [
      {
        url: "/printables/previews/adult-hard-visual-challenge.png",
        alt: "Cover of the Adult Hard Visual Challenge",
      },
    ],
    badge: "Most challenging",
    features: [
      "30 original high-density puzzles",
      "30 complete answer keys",
      "Ten subtle differences per puzzle",
      "Great for adults, teens, and senior groups",
    ],
    keywordSignals: [
      '"adult spot the difference printable" - 110 US searches/month',
      '"spot the difference hard printable" - 140/month',
    ],
    isPremiumIncluded: true,
    salesCount: 268,
    publishedAt: "2026-07-25T00:00:00.000Z",
    filterOptions: optionsFor(
      ["audience", ["adults-teens"]],
      ["theme", ["geometric"]],
      ["difficulty", ["hard"]],
      ["price", ["under-5", "premium"]],
      ["format", ["pdf", "answer-keys"]],
      ["useCase", ["travel-quiet-time", "senior-activities"]],
    ),
  },
];

export const printablePremiumPlan: PrintablePremiumPlan = {
  id: "20000000-0000-4000-8000-000000000001",
  slug: "premium-annual",
  title: "SpotDiffs Premium",
  shortDescription: "One purchase unlocks every Premium printable for 31 days.",
  description:
    "Download every current Premium-included PDF and every new Premium printable published during your access period.",
  priceCents: 2999,
  currency: "USD",
  accessDays: 31,
  badge: "Best for frequent users",
  features: [
    "All current Premium printable PDFs",
    "New Premium releases during your access period",
    "31 days of secure download access",
    "Use in one household or one classroom",
  ],
};

export function formatPrintablePrice(
  item: Pick<PrintableProduct | PrintablePremiumPlan, "priceCents" | "currency">,
) {
  if (item.priceCents === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: item.currency,
  }).format(item.priceCents / 100);
}
