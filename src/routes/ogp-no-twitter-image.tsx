import { createFileRoute } from "@tanstack/react-router";
import { PatternPage } from "#/components/PatternPage";
import { buildMeta, resolveSearch, validateOgpSearch } from "#/lib/ogp";

const PATTERN = "ogp-no-twitter-image" as const;

export const Route = createFileRoute("/ogp-no-twitter-image")({
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
