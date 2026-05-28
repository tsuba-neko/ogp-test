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

      <section className="mt-6 rounded-lg bg-neutral-50 p-4 text-sm">
        <h2 className="font-semibold">How to test</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-neutral-700">
          <li>Deploy this app and open the canonical URL on the public origin.</li>
          <li>
            Paste it into{" "}
            <a
              className="text-blue-600 hover:underline"
              href="https://cards-dev.twitter.com/validator"
              target="_blank"
              rel="noreferrer"
            >
              Twitter Card Validator
            </a>{" "}
            or post the link in a draft on X to preview.
          </li>
          <li>
            Override via querystring: <code className="rounded bg-white px-1">?image=...</code>
          </li>
        </ol>
      </section>
    </main>
  );
}
