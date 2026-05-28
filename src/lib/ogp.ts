export const PATTERNS = [
  {
    slug: "both",
    label: "OGP + Twitter (large image)",
    description: "og:* と twitter:* の両方を設定。twitter:card は summary_large_image。",
  },
  {
    slug: "twitter-only",
    label: "Twitter only (large image)",
    description: "twitter:* のみ設定。og:* タグなし。",
  },
  {
    slug: "twitter-summary",
    label: "Twitter summary (small image)",
    description: "twitter:card=summary。小さい正方形カード。",
  },
  {
    slug: "ogp-only",
    label: "OGP only (no Twitter tags)",
    description: "og:* のみ。twitter:* タグなし。X は og:image にフォールバックするか確認。",
  },
  {
    slug: "ogp-no-twitter-image",
    label: "OGP + Twitter (no twitter:image)",
    description: "og:* 完備。twitter:card / title / description はあるが twitter:image を省略。",
  },
] as const;

export type PatternSlug = (typeof PATTERNS)[number]["slug"];

export const PATTERN_BY_SLUG = Object.fromEntries(PATTERNS.map((p) => [p.slug, p])) as Record<
  PatternSlug,
  (typeof PATTERNS)[number]
>;

export const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=630&fit=crop";

export type OgpSearch = {
  image?: string;
  title?: string;
  description?: string;
};

export const validateOgpSearch = (search: Record<string, unknown>): OgpSearch => ({
  image: typeof search.image === "string" ? search.image : undefined,
  title: typeof search.title === "string" ? search.title : undefined,
  description: typeof search.description === "string" ? search.description : undefined,
});

type MetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

type BuildArgs = {
  pattern: PatternSlug;
  image: string;
  title: string;
  description: string;
  url: string;
};

export function buildMeta({ pattern, image, title, description, url }: BuildArgs): Array<MetaTag> {
  const og: Array<MetaTag> = [
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
  ];
  const twitterLarge: Array<MetaTag> = [
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
  const twitterSummary: Array<MetaTag> = [
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
  const twitterNoImage: Array<MetaTag> = [
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];

  const head: Array<MetaTag> = [{ title }];

  switch (pattern) {
    case "both":
      return [...head, ...og, ...twitterLarge];
    case "twitter-only":
      return [...head, ...twitterLarge];
    case "twitter-summary":
      return [...head, ...twitterSummary];
    case "ogp-only":
      return [...head, ...og];
    case "ogp-no-twitter-image":
      return [...head, ...og, ...twitterNoImage];
  }
}

export function resolveSearch(search: OgpSearch, pattern: PatternSlug) {
  return {
    image: search.image && search.image.length > 0 ? search.image : DEFAULT_IMAGE,
    title: search.title ?? `OGP Test — ${pattern}`,
    description:
      search.description ??
      `Pattern "${pattern}". Use ?image=<URL> to set the OGP image and share this URL on X to preview.`,
  };
}
