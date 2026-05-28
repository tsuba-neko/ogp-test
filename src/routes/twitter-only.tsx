import { createFileRoute } from "@tanstack/react-router";
import { PatternPage } from "#/components/PatternPage";
import { buildMeta, resolveSearch, validateOgpSearch } from "#/lib/ogp";

const PATTERN = "twitter-only" as const;

export const Route = createFileRoute("/twitter-only")({
  validateSearch: validateOgpSearch,
  head: ({ match }) => ({
    meta: buildMeta({
      pattern: PATTERN,
      ...resolveSearch(match.search, PATTERN),
      url: match.pathname,
    }),
  }),
  component: () => <PatternPage pattern={PATTERN} />,
});
