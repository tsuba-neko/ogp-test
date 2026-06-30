import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DEFAULT_IMAGE, PATTERNS, validateOgpSearch } from "#/lib/ogp";

export const Route = createFileRoute("/")({
  validateSearch: validateOgpSearch,
  component: Home,
});

function Home() {
  const search = Route.useSearch();
  const [image, setImage] = useState(search.image ?? "");

  const qs = image ? `?image=${encodeURIComponent(image)}` : "";

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <h1 className="text-3xl font-bold">OGP Test</h1>
      <p className="mt-2 text-neutral-600">
        各パターンページに <code className="rounded bg-neutral-100 px-1">?image=&lt;URL&gt;</code>{" "}
        を付けると、その画像が OGP / Twitter Card のプレビュー画像として配信されます。
      </p>

      <section className="mt-6">
        <label className="block text-sm font-medium" htmlFor="image-input">
          Image URL
        </label>
        <input
          id="image-input"
          type="url"
          placeholder={DEFAULT_IMAGE}
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-neutral-500">
          空のままなら各ページのデフォルト画像が使われます。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Patterns</h2>
        <ul className="mt-3 space-y-3">
          {PATTERNS.map((p) => (
            <li
              key={p.slug}
              className="rounded-lg border border-neutral-200 p-4 hover:border-neutral-400"
            >
              <Link
                to={`/${p.slug}` as "/both"}
                search={image ? { image } : undefined}
                className="font-medium text-blue-600 hover:underline"
              >
                /{p.slug}
                {qs}
              </Link>
              <div className="mt-1 text-sm font-medium">{p.label}</div>
              <p className="mt-1 text-sm text-neutral-600">{p.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
