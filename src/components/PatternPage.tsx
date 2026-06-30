import { Link, useSearch } from "@tanstack/react-router";
import { DEFAULT_IMAGE, PATTERN_BY_SLUG, type PatternSlug } from "#/lib/ogp";

export function PatternPage({ pattern }: { pattern: PatternSlug }) {
  const search = useSearch({ strict: false }) as {
    image?: string;
    title?: string;
    description?: string;
  };
  const info = PATTERN_BY_SLUG[pattern];
  const image = search.image && search.image.length > 0 ? search.image : DEFAULT_IMAGE;

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <Link to="/" className="text-sm text-blue-600 hover:underline">
        ← back to all patterns
      </Link>
      <h1 className="mt-3 text-3xl font-bold">{info.label}</h1>
      <p className="mt-2 text-neutral-600">{info.description}</p>

      <section className="mt-6 rounded-lg border border-neutral-200 p-4">
        <h2 className="text-sm font-semibold text-neutral-500">Resolved image</h2>
        <p className="mt-1 break-all font-mono text-xs">{image}</p>
        <img
          src={image}
          alt="OGP preview"
          className="mt-3 max-h-80 w-full rounded-md border border-neutral-200 object-cover"
        />
      </section>
    </main>
  );
}
