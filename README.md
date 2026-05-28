# ogp-test

OGP / Twitter Card のレンダリングを X (Twitter) 上で実際に検証するためのテスト用Webアプリ。

クエリパラメータで画像URLを差し替えるだけで、複数の meta タグパターンを使い分けて X に投稿し、どのカードがどう表示されるかを比較確認できる。

---

## このアプリで何ができるか

- 5種類の meta タグ構成を持つページが用意されている
- 各ページは `?image=<URL>` を受け取り、そのURLを `og:image` / `twitter:image` として SSR で埋め込む
- ページごとに「OGPだけ」「Twitterだけ」「両方」「Twitterはあるが画像なし」など、X クローラーの挙動を切り分けて検証できる
- デプロイ先のURLを X の投稿欄に貼ると、X が現在のmetaを読み取ってカードを描画する
- 同じ画像URLでパターンを切り替えて貼り直すことで、「どの構成でどんなカードが出るか」をスクショ比較できる

---

## 5つのパターン

| ルート                     | og:* タグ                                      | twitter:* タグ                                                                     | 用途                                                                              |
| -------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `/both`                    | type / url / title / description / image       | card=`summary_large_image` + title / description / image                           | OGP+Twitter両方フル装備。本番想定の標準構成。                                     |
| `/twitter-only`            | （なし）                                       | card=`summary_large_image` + title / description / image                           | OGPなし。Twitterタグだけで大画像カードが出るか確認。                              |
| `/twitter-summary`         | （なし）                                       | card=`summary` + title / description / image                                       | 小さい正方形カード（summaryカード）の見え方確認。                                 |
| `/ogp-only`                | type / url / title / description / image       | （なし）                                                                           | Twitterタグなし。Xが og:image にフォールバックして描画するか確認。                |
| `/ogp-no-twitter-image`    | type / url / title / description / image       | card=`summary_large_image` + title / description のみ（**twitter:image を省略**） | twitter:imageが無い時、Xが og:image にフォールバックするか確認。                  |

> X (Twitter) のクローラー仕様としては、`twitter:image` が無い場合 `og:image` を見にいく挙動が公式に書かれているが、実際に挙動が変わったケースもあるので **このアプリで実機検証する** のが目的。

実装は `src/routes/<pattern>.tsx` と、metaタグを組み立てる共通ヘルパー `src/lib/ogp.ts` を参照。

---

## クエリパラメータ仕様

すべてのパターンページで以下を受け付ける（`src/lib/ogp.ts` の `validateOgpSearch` 参照）。

| パラメータ      | 必須   | 役割                                                                                              |
| --------------- | ------ | ------------------------------------------------------------------------------------------------- |
| `image`         | 任意   | OGP/Twitterカードのプレビュー画像URL。指定がなければ `DEFAULT_IMAGE` (Unsplash の 1200x630 画像)。 |
| `title`         | 任意   | カードのタイトル。未指定なら `OGP Test — <pattern>`。                                             |
| `description`   | 任意   | カードの説明文。未指定なら固定文言。                                                              |

例:
```
/both?image=https%3A%2F%2Fexample.com%2Fmy-image.png
/twitter-summary?image=...&title=My%20Title&description=hello
```

`twitter-summary` パターンも `?image=` に渡されたURLをそのまま使う（小さい正方形領域に表示される）。

---

## 技術スタック

| 領域              | 採用                                                              |
| ----------------- | ----------------------------------------------------------------- |
| Framework         | **TanStack Start** (React 19, SSR必須 — X クローラーはJS実行しないため) |
| Router            | TanStack Router (file-based routing, `src/routes/*.tsx`)          |
| Bundler           | Vite 8                                                            |
| Runtime / Deploy  | **Cloudflare Workers** (`@cloudflare/vite-plugin` + `wrangler`)    |
| Styling           | Tailwind CSS 4 (`@tailwindcss/vite`)                              |
| Lint / Format     | **Biome 2.4** （ESLint + Prettier から完全移行済み）              |
| Package Manager   | **pnpm 10.32**（`packageManager` フィールドで固定）              |
| Test              | Vitest 4 + Testing Library + jsdom                                 |

### 重要な設計ポイント

- **SSRが必須**：X (Twitterbot) は JS を実行せず初期HTMLしか見ない。よって meta タグは必ず SSR で `<head>` に出ている必要がある。TanStack Router の `head: ({ match }) => ({ meta: [...] })` 関数で `match.search` を読みつつ動的にmetaを構築している。
- **`validateSearch`** を各ルートで使い、`?image=` などをタイプセーフに取り出している。
- **共通metaビルダー** (`src/lib/ogp.ts` の `buildMeta`) でパターンごとの差分を一元管理。新パターン追加は `PATTERNS` 配列と switch ケースの追加だけで済む。
- **`og:url` は相対パス**（例: `/both`）になっている。X はこれを実際に取得したURLで解決するため実用上は動くが、厳密な仕様準拠なら絶対URLにしたい（**TODO**）。

---

## ディレクトリ構成

```
.
├── biome.json                  ← Biome 設定（double quote / 2-space / semicolons / trailingComma all）
├── package.json                ← pnpm@10.32.0 で固定
├── pnpm-lock.yaml
├── vite.config.ts              ← TanStack Start + Cloudflare + Tailwind プラグイン
├── wrangler.jsonc              ← Cloudflare Workers 設定（name=ogp-test, entry=@tanstack/react-start/server-entry）
├── tsconfig.json
├── public/                     ← 静的アセット
└── src/
    ├── router.tsx              ← Router 作成
    ├── routeTree.gen.ts        ← TanStack Router 自動生成（コミット対象）
    ├── styles.css              ← Tailwind import
    ├── routes/
    │   ├── __root.tsx          ← ルートレイアウト (<html>/<head>/<body>)
    │   ├── index.tsx           ← トップページ（画像URL入力 + パターンリンク一覧）
    │   ├── both.tsx
    │   ├── twitter-only.tsx
    │   ├── twitter-summary.tsx
    │   ├── ogp-only.tsx
    │   └── ogp-no-twitter-image.tsx
    ├── components/
    │   └── PatternPage.tsx     ← 5パターン共通のUI
    └── lib/
        └── ogp.ts              ← PATTERNS定義 / validateSearch / buildMeta / resolveSearch
```

---

## コマンド

すべて pnpm 経由で実行。Corepack 有効なCI環境でも `packageManager` フィールドで pnpm 10.32.0 が自動選択される。

| コマンド            | 内容                                                                  |
| ------------------- | --------------------------------------------------------------------- |
| `pnpm install`      | 依存インストール                                                       |
| `pnpm dev`          | 開発サーバ起動（http://localhost:3000）                                |
| `pnpm build`        | 本番ビルド（`dist/` に client + Cloudflare Workers 用 server を出力）   |
| `pnpm preview`      | ビルド済みアプリのローカルプレビュー                                   |
| `pnpm test`         | Vitest 実行                                                            |
| `pnpm lint`         | Biome lint                                                             |
| `pnpm format`       | Biome format（書き込み）                                               |
| `pnpm check`        | Biome の lint + format + import sort のチェック（CI向け、書き込まない）|
| `pnpm fix`          | Biome の自動修正（`biome check --write .`）                            |
| `pnpm deploy`       | `pnpm build && wrangler deploy`（要 `wrangler login`）                |

---

## デプロイ

無料の Cloudflare Workers 上で動かす想定。

```bash
# 初回のみ
pnpm dlx wrangler login   # ブラウザでCloudflareに認証

# デプロイ
pnpm deploy
```

`wrangler.jsonc`:
- `name`: `ogp-test`
- `compatibility_date`: `2025-09-02`
- `compatibility_flags`: `["nodejs_compat"]`
- `main`: `@tanstack/react-start/server-entry` （TanStack Start が提供する Workers エントリ）

デプロイ後のURL（例）: `https://ogp-test.<account-subdomain>.workers.dev/both?image=https://...`

---

## X (Twitter) での動作確認の流れ

1. デプロイ完了後の本番URLをコピー
2. `https://<host>/<pattern>?image=<URL>` の形で確認したい URL を組み立てる
3. X の投稿欄に貼り、カードプレビューが出るのを待つ
4. パターンを切り替えて2〜3を繰り返し、表示差分を観察

### X仕様メモ

- 画像は **HTTPS必須**、推奨は 1200×630（large）/ 200×200以上（summary）
- `summary_large_image` カードはアスペクト比1.91:1、最大5MB（PNG/JPEG/WEBP/GIF）
- カードのキャッシュは結構しつこい。**URLの末尾に `&v=2` のようなダミークエリを足す** と再取得させやすい
- 旧 Twitter Card Validator (`cards-dev.twitter.com/validator`) は廃止済み。今は X に貼ってプレビューする以外の確実な方法は無い

---

## 現在の状態（セッション引き継ぎ向け）

### 完了済み

- TanStack Start プロジェクトのスキャフォールド（Cloudflare deploy 設定込み）
- 5パターン分のルート実装と SSR meta タグ出力の検証（`curl` 確認済み）
- インデックスページの実装
- Biome 導入（ESLint+Prettier 完全置き換え、lint/format クリーン）
- pnpm 化（`pnpm-lock.yaml` 生成、`packageManager` フィールド固定）
- `pnpm build` がCloudflare Workers 用バンドルを正常生成することを確認

### 未完了 / TODO

- [ ] **Git 初回コミットができていない**。`git init` は済み、27ファイル `git add` 済みだが、commit 実行時にバックグラウンド側のexit code 0だったにもかかわらず`git log`に何も残っていない状態。pre-commitフックか、Claudeの安全機構による何らかのブロックが原因の可能性。次セッションでまず `git status` → `git commit -m "..."` を手動で実行し、状況確認したい。
- [ ] **GitHubリポジトリ未作成・未push**。プッシュ先は `github.com/tsuba-neko`（個人アカウント）、visibility は **Private** で確定済み。コミット完了次第 `gh repo create tsuba-neko/ogp-test --private --source . --remote origin --push` などで一気にいける想定。
- [ ] **Cloudflareデプロイ未実施**。`wrangler login` も未。実機の本番URLをまだ取れていない。
- [ ] **X での実機検証未実施**。これが最終ゴール。
- [ ] **`og:url` が相対パス**。絶対URLにしたい（リクエストのhostヘッダから組み立てる対応が必要）。
- [ ] **テストコードがない**。Vitest 環境はあるが `*.test.ts` ファイル未作成。`buildMeta` の各パターンが期待通りの配列を返すユニットテストを書くと安心。
- [ ] **README に書いた仕様変更時の追従**。`PATTERNS` 配列を増やしたらこの README の「5つのパターン」表も更新する。

### 過去セッションで決定した方針（覚書）

- デプロイ先 = **Cloudflare Pages/Workers**
- クエリ仕様 = `?image=<URL>` をシンプルに採用（`title`/`description` は将来オプションで）
- ルート構成 = 静的に5ルート（`/pattern/[id]` のような動的ルートにはしない）
- Twitter `summary` カードの画像 = `?image=` をそのまま流用
- Biome のスタイル = double quote / 2-space / semicolons / trailingComma all
- パッケージマネージャ = pnpm（`packageManager` フィールドで固定）
- GitHubアカウント = `github.com/tsuba-neko` / Private repo

### 次セッション開始時の推奨アクション

1. `git status` で staged 状態の確認
2. `git log --oneline -5` で commit 有無の確認
3. なければ `git commit -m "Initial commit: ..."` を実行
4. `gh auth status` で github.com アカウントが active なことを確認
5. `gh repo create tsuba-neko/ogp-test --private --source . --remote origin --push` でリポジトリ作成 + push
6. `pnpm dlx wrangler login` → `pnpm deploy` で Cloudflare へ
7. デプロイ後のURLを X に貼って各パターンの見え方を比較

---

## 参考

- TanStack Start: https://tanstack.com/start
- TanStack Router file-based routing: https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing
- Cloudflare Workers + Vite plugin: https://developers.cloudflare.com/workers/vite-plugin/
- Biome: https://biomejs.dev
- X (Twitter) Cards: https://developer.x.com/en/docs/x-for-websites/cards/overview/abouts-cards
