# Theme audit — PJR Built Different

**Date:** 21 October 2026
**Store:** https://pjrbuiltdifferent.com
**Repo:** `pjrbuiltdifferentofficial-dot/pjr-shopify-theme` at `9b209fc` (19 October 2026, “Add Clicky analytics tracking script”)
**Scope:** audit only. No theme code was changed, nothing was pushed to `main`, and nothing was deployed to Shopify.

Audience assumed below: mostly mobile, arriving from Facebook, Instagram, and TikTok; store currency NOK; storefront language English; customers in Norway, Scandinavia, and the Polish community. Brand name is **PJR Built Different**.

Hard rules for any later work, repeated so they are not lost:

- No discount banners and no discount codes, anywhere (announcement bar, popup, footer, reviews app, checkout copy).
- Never promote the product **BOBER QRWA** (`/products/bober-qrwa-t-shirt-unisex`). Do not feature it, link to it, or use it as an example.

---

## Does this repo match the live theme?

**Yes. This repo is the published theme, and it is current.** It is not an old unused Dawn (or other) theme sitting beside the live one.

Evidence from the live HTML, 21 October 2026:

- `Shopify.theme` on the homepage is `name: "pjr-shopify-theme/main"`, `id: 154371948727`, `schema_name: "PJR Built Different"`, `schema_version: 1.0.1` (matches `config/settings_schema.json`).
- Assets load from `/cdn/shop/t/8/assets/`. The live `theme.css`, `theme-edit.css`, and `theme.js` match the files in this repo after Shopify’s CDN minifier (shorter syntax, `sourceMappingURL` comment). They are not a different stylesheet.
- Live copy matches this repo word for word: announcement `KITCHEN10 · first drop · Forged in the kitchen` (`sections/header-group.json`), the three “Made to order” assurance lines and the size-guide CSS (`sections/main-product.liquid`), Clicky site id `101513644` (`layout/theme.liquid`), and the Judge.me product block id `judge_me_reviews_review_widget_cwBz8R` (`templates/product.json`).
- Git history contains `Update from Shopify for theme pjr-shopify-theme/main`. The Shopify admin theme editor commits back to `main`. That only happens when this repo’s `main` branch is the connected theme.

`README.md` still says the repo will not change the site if another theme (Dawn) is published. That warning is stale. **`main` is what customers see.**

Things that differ from the Liquid fallbacks are store admin content, not an outdated theme:

- Homepage meta description is the admin description (“Heavyweight streetwear from Norway, made to order…”), which `layout/theme.liquid` correctly prefers over its hardcoded fallback.
- Header links (Shop, Lookbook, Story, Journal) come from the `main-menu` link list, not from the theme files.
- Which products sit in `pjr-core` is collection admin, not `templates/index.json`. The template still points at `pjr-core`.
- A second Google Search Console verification meta tag is injected by Shopify. The theme also hardcodes one in `layout/theme.liquid`. Both can stay; they are not a mismatch.
- `og:image` on the homepage comes from Shopify’s social sharing image. The inline SEO in `theme.liquid` does not set `og:image` itself (only `twitter:image` when `page_image` exists). `snippets/seo.liquid` would set `og:image`, but nothing renders that snippet.

---

## How future changes should be deployed

Pushing this repo’s `main` branch updates the **published** theme. Customers see it immediately. There is no staging slot on `main`.

The theme editor writes back to `main` as well. A push and an editor save can overwrite each other. Pull `main` before starting any theme work.

Safe preview path:

1. Do the work on a branch that is **not** `main`. A branch by itself does not go live.
2. In Shopify admin: Online Store → Themes → the live theme (`pjr-shopify-theme/main`) → Duplicate. Leave the copy **unpublished**.
3. Open that duplicate’s Preview link (`?preview_theme_id=…`) and check mobile. Share that link. Do not press Publish.
4. Optional, if the branch should sync into that duplicate: Add theme → Connect from GitHub → this repo → the preview branch, and attach it to the **unpublished** duplicate only. In admin, confirm the branch name shown on the duplicate before the first push. Do not connect that branch to the live theme.
5. Shopify CLI equivalent, if someone uses it later: `shopify theme push --unpublished` onto a development theme, or `shopify theme dev` for a local preview. Do not use `shopify theme push --live`, `shopify theme publish`, or a push to `main` until Piotr has approved the preview.
6. After approval, either publish the duplicate in admin, or merge to `main` while nobody is editing the live theme in the customizer.
7. App embeds (Judge.me, Qikify, Facebook pixel) are listed in `config/settings_data.json`. Changing that file on `main` changes the live theme’s embeds. Preview those on the duplicate too. Turning an app off in the Shopify admin is a separate step from a git push.

Do not deploy from an agent or a script straight to the live theme.

---

## Top 10 (impact vs effort)

| # | Change | Why | Effort | Needs Piotr |
| --- | --- | --- | --- | --- |
| 1 | Stop every “shop everything” path from landing on `/collections/all`, where **BOBER QRWA is the first product**. Point Shop, the lookbook grid, and the empty-cart button at a curated collection, and unpublish or exclude BOBER from the Online Store channel. | The main Shop link and all eight homepage lookbook tiles go to a catalog whose first product is the one that must never be promoted. | S | Yes — unpublish/hide BOBER, and name the collection Shop should use |
| 2 | Make “The capsule” and “Complete the look” show core apparel, not the first products in `pjr-core`. | Homepage and hoodie cross-sell currently open on Christmas mugs, aprons, and socks under the line “Not a weekly drop. Pieces built to stay.” `pjr-core` has 89 products and is titled “New Arrivals – Men”. | S | Yes — which collection is the real core, and where Christmas / Halloween should live |
| 3 | Stop serving the product hero as a multi‑megabyte PNG. Use a compressed image with `srcset` and a mobile width. | On the Forged Blade hoodie, the first photo is a PNG at 1,400px: **about 2.0 MB** (still about 1.0 MB at 800px). That is the mobile LCP on the page that should convert. The mockup JPEG beside it is about 49 KB. | S | No, unless he wants a different hero crop |
| 4 | Add a sticky mobile add-to-cart bar (title, price, button) once the main button scrolls away. | Product layout is one column until 1,024px, so the buy button sits under a tall image. Social traffic never keeps the button on screen. | S | No |
| 5 | Remove every discount surface already in the theme, and turn off Judge.me review coupons. | Live announcement is `KITCHEN10`. Popup and footer reveal `WELCOME10`. Judge.me’s widget data has `product_coupons_enabled: true`. All of that breaks the no-discount rule and adds a popup at 8 seconds on mobile. | S | Only for the replacement announcement line. Default can be “Forged in the kitchen · Hard work · No days off” |
| 6 | One size guide, in centimetres, on apparel product pages — including hoodies that have no Printful id. | Forged Blade hoodie has no size-guide link (`custom.pf_id` does not match `snippets/pf-specs.liquid`). `/pages/size-guide` is a single Comfort Colors 1717 chart **in inches**. PDP charts that do exist are centimetres. Norway and Poland do not shop tees in inches. | M | Yes — confirm the real blank and the measurements. Do not invent a chart |
| 7 | Cut render-blocking and third-party JavaScript that does not earn its place on a mobile landing. | Every page loads a blocking Google Fonts CSS (Figtree and Oswald, four weights each), a blocking Judge.me CSS plus `loader.js` (this hoodie has **0 reviews**; the shop has 1), Clicky, a Facebook pixel app embed, and the Qikify sales-popup embed. | M | Yes — which of Clicky, Judge.me, Qikify, and the Facebook app he actually uses |
| 8 | Take the off-brand Printful catalog out of the indexable shop. | The product sitemap lists **116** products, including BOBER, baby bodysuits, rash guards, a bikini top, phone cases, and a poster. `/collections/all` is the Shop URL. Collection pages also print a chip for every collection, including Kids. | L (mostly admin) | Yes — what stays published |
| 9 | Add shipping details to product JSON-LD, `noindex` search URLs, and drop the unused second SEO snippet. | Product schema is real and useful, but offers have no `shippingDetails`, so Google will not treat delivery as complete. Search URLs are canonicalised with the query string and reuse the homepage description. `snippets/seo.liquid` is a second, older schema that nothing renders — easy to double-output later. | S | Shipping price, if he wants a numeric rate in the schema. The 2–5 day / 2–4 week copy is already in the theme |
| 10 | A B2B inquiry page whose leads land in HubSpot. | There is no wholesale page. `/pages/contact` is an empty heading: no form, no email in the page body. Companies, restaurants, and gyms have nowhere to ask for branded merch except the Gmail address in the footer. | M | Yes — minimums, lead time, decoration (print/embroidery), HubSpot form, who replies |

---

## 1. Mobile speed and Core Web Vitals

Measured from the live storefront with a mobile user agent, plus the theme source. No lab Lighthouse run was available in this environment; the weights and blocking tags below are from the HTML and response headers.

### Images

| Asset | What the browser is asked for | Weight |
| --- | --- | --- |
| Homepage hero (`grok-image-…jpg` via `image_url` width 2400, with `srcset` and `fetchpriority: high`) | CDN JPEG | ~95 KB at 2400px, ~44 KB at 800px |
| Forged Blade product stage (`sections/main-product.liquid` raw `<img>`, width 1400, **no `srcset`**, source file is PNG) | PNG | **~2,008 KB** at 1400px, **~1,063 KB** at 800px |
| Same product’s Printful mockup JPEG | JPEG | ~49 KB at 1400px |
| Homepage lookbook strip, 8 files via `asset_url` (`sections/lookbook-grid.liquid`) | Full theme JPEG, no `srcset` | ~1.9 MB combined (about 171–357 KB each) |
| Homepage “Father & Son” and story splits (`lookbook-fjord.jpg`, `story-hands.jpg`) | Full theme JPEG, no `srcset` | ~288 KB and ~259 KB |
| Product cards at width 900 | CDN JPEG, lazy, with `srcset` | Often fine; a few Printful shots are 290–310 KB at 900px (apron, socks) |

Homepage `<img>` `src` URLs add up to about **3.7 MB**. Hero and product cards can drop via `srcset`. The theme-asset JPEGs cannot: `asset_url` bypasses the image CDN. `loading="lazy"` is set on those, so they are not the LCP, but they still download as soon as a mobile user scrolls, which is the whole homepage.

`sections/story-page.liquid` and `sections/lookbook-page.liquid` use the same `asset_url` pattern. `story-hands.jpg` on the story page has `alt=""`.

Product stage markup:

```10:10:sections/main-product.liquid
        <img data-stage src="{{ product.featured_image | image_url: width: 1400 }}" alt="{{ product.featured_image.alt | default: product.title | escape }}">
```

No width, height, `srcset`, or `fetchpriority`. The CSS box has `aspect-ratio: 3/4`, so layout shift is mostly contained. The cost is bytes. Clicking a thumbnail swaps in another 1,400px URL. Several alts on that hoodie are the Printful default **“Product mockup”**.

**Do this:** re-encode founder photos as JPEG or WebP (or pass a format Shopify will transform), cap the mobile candidate around 800px, and use `image_tag` so `srcset` and dimensions are generated. Move lookbook and story photos into the Files CDN (or generate smaller theme assets) and stop using bare `asset_url` for large photos. Give Printful images a real alt (product title + view), not “Product mockup”.

### Render-blocking and extra scripts

In `<head>` on every page, before the document can paint:

- Google Fonts stylesheet for Figtree 400–700 and Oswald 400–700 (`layout/theme.liquid`). `display=swap` and preconnect are already there. The CSS request itself is still blocking, and eight weights is more than the UI uses. `preconnect` to `fonts.gstatic.com` is present.
- `theme.css` (~18 KB minified) and `theme-edit.css` (~1.6 KB). These are fine.
- Judge.me `shopify_v2.css` (render-blocking extension stylesheet) and, later, `judgeme-809/assets/loader.js`.
- Shopify’s own `content_for_header` scripts (privacy banner, Shop Pay, perf kit, web pixels).

At the end of `<body>`:

- `theme.js` is `defer`. Good.
- Clicky is `async` (`//static.getclicky.com/js`, data id `101513644`). Still a third analytics client next to Shopify analytics.
- App embeds enabled in `config/settings_data.json`: Judge.me core, **Qikify sales pop-up**, and **Facebook pixels / CAPI**. Those are not leftover files in `assets/`; they are live embeds. Qikify’s “someone just bought” pattern is extra JavaScript and it fights a brand that does not need fake urgency.
- `theme.js` calls `/cart.js` on every page, including articles and the 404.

Judge.me on the Forged Blade hoodie: widget is mounted, `number_of_reviews` is 0, `data-shop-review-count` is 1, `data-shop-average-rating` is 5.00. The CSS and loader still ship on the homepage, collection pages, contact, and 404. `templates/product.json` sets that block’s `review_data` to **`sample_data`**. The live hoodie did not show fake reviews (empty widget), but sample data is the wrong setting for a live theme. It can surface placeholder reviews in the editor and should be switched to real data only.

**Do this:** self-host two weights of each family (or at least drop 500/600 if they are unused) with `font-display: swap`, subset Latin and Latin-ext so Polish characters survive. Remove Clicky from `theme.liquid` if Shopify analytics plus the Facebook app is enough. Disable the Qikify embed on the duplicate theme and check the difference. Keep Judge.me’s CSS off pages that do not show reviews, and do not load the widget until there is a real review to show. Turn off Judge.me coupons so the app cannot email a code.

### Unused theme code (not apps, but weight and risk)

- `snippets/seo.liquid` is never rendered. `layout/theme.liquid` inlines a newer SEO block and says it does that so a missing snippet cannot 404. The snippet’s JSON-LD is a different shape (single `Product` offer, not `ProductGroup`).
- `sections/related-products.liquid` is not in `templates/product.json` (removed on purpose in September 2026). Cross-sell is now hardcoded in `main-product.liquid`.
- `sections/pin-promo.liquid` is not on the homepage. An older commit added a Pinterest discount promo; the section remains in the theme.

---

## 2. Conversion

### What already works

- One clear `<h1>` on the product page, price in NOK via Shopify’s money filter, variant buttons, add-to-bag opens the cart drawer.
- Three assurance lines sit under the button: made to order (2–5 business days), tracked worldwide shipping, 14-day returns in the EU, EEA, Norway, and the UK.
- Shipping accordion repeats production time, the **2–4 week** delivery window, tracking, and who pays return postage, with links to `/pages/shipping-information` and the refund policy.
- `Shopify.currency.active` on the live page is `NOK`. The cart drawer’s JS formatter will use that. The fallback in `assets/theme.js` is still `"USD"` if `Shopify.currency` is missing — wrong default for this store.
- Header is `position: sticky`. That is not an add-to-cart bar.

### Product page layout (mobile)

`sections/main-product.liquid` is a single column until 1,024px: image stage (3:4), thumbnails, then vendor, title, price, options, button. From a social ad the first screen is the photo. After this PNG is fixed, a sticky bar is still the right pattern: once the main button leaves the viewport, pin a bar with the product name, price, and “Add to bag”. Keep the existing made-to-order line in or directly above that bar so the long lead time is visible at the moment of tap.

There is no quantity selector. That is acceptable for made-to-order apparel. Do not add a discount upsell beside the button.

Variant buttons do not update the URL (`?variant=`). The add-button label is baked from the first variant (`data-in-stock`) and is not rewritten when the price changes. Hoodie sizes are all 599 NOK, so it is invisible there. It will lie if a mug and a size ever differ in price. The visible price element does update.

The variant `<select>` is `visually-hidden` and `aria-hidden="true"`, so assistive tech cannot use the real control. The buttons have no `aria-pressed`.

### Trust

Near the button, trust is three lines of text. There are no payment marks. For this audience, **Vipps** (and Klarna, if it is actually enabled) next to the button matters more than another slogan. Confirm in Shopify payments before drawing the marks. Do not invent them.

Do not show the shop’s single 5.0 review as if every product had it. Do not turn Qikify on to fake recent orders.

The footer and popup ask for an email in exchange for 10% off. That is a discount mechanic and an interruption at 8 seconds (`snippets/email-popup.liquid`), including on product pages from ads. Remove the code and the popup, or keep a quiet “write when there is a drop” signup with no code. The footer success state in `sections/footer.liquid` prints `WELCOME10`.

### Size guide

- Link “Size guide” renders only when `snippets/pf-specs.liquid` returns a table for `product.metafields.custom.pf_id`.
- Forged Blade hoodie (a core piece) has **no** size guide and no Fit & sizing accordion. BOBER QRWA does, because its Printful id matches. The product that must not be promoted has a chart; the hoodie does not.
- Charts that match are garment measurements in cm, laid flat, with a ±5 cm note. Good for this market.
- `/pages/size-guide` is a separate admin page: Comfort Colors 1717 only, widths and lengths **in inches**. It is in the sitemap and the nav is not pointing at it. It will confuse anyone who finds it.
- `pf-specs.liquid` is a large Printful catalog pasted into Liquid, including blanks whose detail copy names other brands’ logos (Champion, adidas, Under Armour) for some ids. The BOBER page’s visible spec is the generic cotton tee (id-style copy “Blank product sourced from Nicaragua, Mexico, Honduras, or the US”), not those brands. Strip trademark lines before any product uses those ids. Prefer a small set of charts for the blanks Piotr actually sells (heavyweight tee, premium hoodie, apron, mug) over an 80-case catalog.

### Cross-sell / “buy together”

`main-product.liquid` prints “Complete the look”: the first three **available** products in `collections['pjr-core']`, skipping the current product. On the Forged Blade hoodie those three are Chef Santa mug, green apron, and black apron. There is no shared add-to-cart, no “bought together” bundle, and no link to the matching tee or the other Forged Blade colour.

`sections/related-products.liquid` (Shopify recommendations, heading “Worn together”) is not on the product template.

**Do this:** cross-sell from the same family (tee + hoodie in the same graphic, or apron + mug only on drinkware pages). A real “add both” control is worth it only after the set is curated. Never fill the row from `collections.all`, or BOBER and babywear can appear. Exclude handle `bober-qrwa-t-shirt-unisex` and titles containing `BOBER` or `QRWA` in every product loop anyway.

### Reviews

Judge.me’s widget is the last section on the product template. On the hoodie it is an empty shell under the cross-sell. Until there are real reviews, the empty block plus the global CSS is a cost, not social proof. When reviews exist, put the star summary by the price, not only at the bottom. Do not enable review coupons.

---

## 3. SEO

### What is in good shape

- Unique `<title>` and meta description on the homepage, the hoodie, collections checked, and content pages. Canonical link is present.
- One `<h1>` per page checked (homepage slogan, product title, collection title, page title).
- Product JSON-LD is a `ProductGroup` with `hasVariant`, NOK price (`599.0` on that hoodie), `InStock` / `OutOfStock`, brand from `product.vendor` (on this hoodie, “PJR Built Different”), images, and a `MerchantReturnPolicy` (14 days, customer pays return shipping, country list includes NO and PL).
- Breadcrumbs JSON-LD on products and collections. FAQ JSON-LD on `/pages/faq-returns` only, and that page exists.
- Organization JSON-LD includes the Gol address and the public Gmail. Homepage also has a `WebSite` + `SearchAction`.
- `robots.txt` is Shopify’s default and points at `sitemap.xml`. Fetching the sitemap index with a normal browser user agent returned **200** (a separate fetch tool got a 500; treat the curl 200 as the real result). Child sitemaps list products, pages, and collections.
- Brand string on the live site is “PJR Built Different”. A search of the theme found no “Build Different” typo.

### Structured data gaps

- Offers have no `shippingDetails` / `OfferShippingDetails`. Google’s product listings want a destination, a rate, and a handling/transit time. The theme already states 2–5 business days of production and 2–4 weeks in transit. A numeric shipping rate needs Piotr (NOK, Norway first).
- No `aggregateRating`. Correct while the product has zero reviews. Do not mark up the single shop review as the product rating.
- Brand is `product.vendor`. It is right on the hoodie. If any product’s vendor is still the print provider, the rich result brand will be wrong. Set vendor to PJR Built Different on every product, or hardcode the brand in JSON-LD the way `snippets/seo.liquid` already does.
- `price | divided_by: 100.0` can emit float noise (599.00 happened to be clean). Emit a two-decimal string.
- Collection pages have breadcrumbs but no `ItemList` of products.
- Organization has no logo and no `sameAs`. Instagram is a setting (`social_instagram`) but `settings_data.json` only fills `social_x`. The unused `seo.liquid` is the only place that outputs `sameAs`. Add the real Instagram and TikTok URLs once Piotr confirms them. Do not copy the X default blindly if that account is inactive.
- `snippets/seo.liquid` must not be rendered in addition to the block in `theme.liquid`. Delete it or make `theme.liquid` the only SEO output.

### Meta, headings, alt, canonical

- Search (`/search?q=christmas`) uses a canonical **that includes the query** and the homepage meta description. `robots.txt` does not block `/search`. Add `noindex, follow` on search results.
- Product and collection descriptions that are filled in admin are being used. Good. Keep writing them in admin for Christmas and core collections; the theme fallback is generic.
- Alt text: hero alt is the slogan (acceptable). Lookbook alts are one word (“Maroon”, “Festival”, “Polo”). Story split image alt is empty. Printful alts are “Product mockup”. Product cards use the product title, which is good.
- `/pages/size-guide`, shipping, FAQ, story, lookbook, and contact are in the page sitemap. Contact is thin (empty body). Thin pages do not need to be indexable until they have content.
- No `hreflang`. `/pl` returns **404**. `locales/pl.json` exists, but Polish is not a published language. Store language is English, which matches the brief. A lot of conversion copy is hardcoded English in `main-product.liquid` (assurances, accordion titles, “Size guide”, “Complete the look”), so publishing Polish later will not translate the product page. Decide with Piotr whether Polish is a real locale or whether the locale file should stay unused. Do not publish a half-translated Polish storefront.

### Sitemap and catalog

Product sitemap: **116 URLs**, including:

- `bober-qrwa-t-shirt-unisex` (must not be promoted; it is still indexable)
- baby bodysuits, kids tees, rash guards, a one-piece swimsuit, a bikini top, a MagSafe iPhone case, a poster, board shorts, leggings

That catalog teaches Google that the shop is a generic Printful outlet, and it competes with the hoodies and Christmas goods. Unpublish anything that is not for sale, or remove it from the Online Store sales channel, and submit the sitemap again. Theme-side, stop linking to `/collections/all`.

Collection sitemap (12 entries) does **not** include Christmas 2026. The collection itself returns 200, canonical `https://pjrbuiltdifferent.com/collections/christmas-2026`, title “Christmas Hoodies 2026”, **17 products**, no `noindex`, and it is linked from the collection chip row. Halloween 2026 is in the sitemap. Check again after a day; if Christmas stays missing, confirm in admin that the collection is published to Online Store and ask Shopify to refresh the sitemap. Internal links will still get it crawled.

`/collections/all` is titled “Products” and its first card is **Bober QRWA graphic t-shirt**, then baby bodysuits. The header Shop link, the mobile drawer, every lookbook tile, and the empty cart button all use that URL.

`pjr-core` is titled “New Arrivals – Men”, **89 products**, and the first screen is Christmas drinkware and aprons, then Halloween beanies, then core hoodies. The homepage section limit is 6, so the capsule is six Christmas items. The kids filter in `sections/featured-collection.liquid` skips baby/kids/onesie titles. It does not skip mugs, and it does not skip BOBER by name.

Collection chips (`sections/main-collection.liquid`) list every collection, including Kids, on every collection page. That puts kids and the full catalog one tap from a men’s hoodie collection. README already says kids stay out of the top bar. The chip row undoes that.

---

## 4. B2B page — custom branded merch

**Idea, not built.** Leads should end in HubSpot. Nothing in the theme talks to HubSpot today.

### Why a separate page

`/pages/contact` renders `templates/page.json` → `sections/main-page.liquid`, which only prints `page.title` and `page.content`. The live main column is the heading “Contact” and nothing else. The only forms in the HTML are the footer newsletter and the popup. The Gmail address is in the footer note and in Organization JSON-LD.

Restaurants, gyms, and companies are a different question from “where is my hoodie”. They need quantity, a deadline, and a logo, and they should not be offered `KITCHEN10`.

### Suggested page

- New template `page.b2b` (or `page.branded`), page handle such as `/pages/branded-merch`.
- Not in the announcement bar. A quiet footer link and, if Piotr wants, one line under Story: “Branded merch for kitchens, gyms, and companies.”
- Copy in English, with a short Polish line under the heading if he wants the Polish community to feel addressed. Do not machine-translate the whole page in the first version.
- Say made to order, production in business days, shipping to Norway and the EU, and that this is a quote request, not a checkout. No discount, no code, no BOBER, no babywear, no swimwear in the examples. Examples: hoodies, tees, aprons, caps — the blanks he will actually decorate with a company logo.

Fields:

| Field | Notes |
| --- | --- |
| Name | Required |
| Work email | Required |
| Phone | Optional, useful for Norwegian restaurants |
| Company | Required |
| Type | Restaurant / gym / company / other |
| Country | Default Norway |
| What they want | Hoodies, tees, aprons, caps, mixed |
| Rough quantity | Ranges, not a calculator |
| Needed by | Date or “no deadline” |
| Logo | Yes/no. File upload only if HubSpot’s form supports it; otherwise “we reply and you send the logo” |
| Message | Required |

### How the lead gets to HubSpot

Prefer a **HubSpot form embed** (public portal id + form GUID). That is designed to be in the page. Do not put a private HubSpot token in the theme, in git, or in a Shopify metafield that the storefront prints.

Alternative if he does not want another script: a Shopify `{% form 'contact' %}` with a tag such as `b2b-lead`, then a Shopify Flow or the HubSpot–Shopify app that creates the contact. Native contact forms land in Shopify admin first; someone must confirm they actually sync. The embed is the shorter path.

Either way, submit the form on the **unpublished** theme preview and check the contact lands in the right HubSpot pipeline before publish.

Piotr needs to decide: minimum quantity, whether embroidery and print are both offered, lead time he will promise, which HubSpot form, and who is notified. The theme should not invent a minimum order or a price list.

---

## 5. Broken things, errors, accessibility

### Broken or misleading

- **Shop promotes BOBER.** `/collections/all` first product is Bober QRWA. Header, drawer, lookbook grid (`sections/lookbook-grid.liquid` default link is `routes.all_products_collection_url` because `index.json` leaves `link` empty), and cart empty state all go there.
- **Contact page has no contact method in the page body.**
- **Size systems disagree** (inches on `/pages/size-guide`, centimetres in `pf-specs`, no chart on the main hoodie). See section 2.
- **Capsule and cross-sell show seasonal drinkware as the core line.** See section 2.
- **`/pl` is a 404** while `locales/pl.json` is in the repo. Harmless if Polish stays unpublished. Confusing if anyone links `/pl` from Instagram.
- Cart add failure toast in `theme.js` is the character “—”. A failed add on mobile looks like a glitch.
- Search with no product hits prints “—” (`sections/main-search.liquid`).
- Collection filter chips expose Kids and every other collection on collection pages.
- Christmas 2026 missing from the collection sitemap while the page is public (section 3).
- `product.json` asks Judge.me for `sample_data`.

404 template itself works (`sections/main-404.liquid`): heading “404”, short line, link home. A missing URL returned HTTP 404. Canonical on that response was `https://pjrbuiltdifferent.com/404`.

Journal (`/blogs/nyheter`) returns 200. Story, lookbook, FAQ, and shipping pages return 200.

`snippets/pf-specs.liquid` can print “Blank product sourced from…” and, for some Printful ids, another brand’s logo line. That is supplier boilerplate on a premium page. Replace it with Piotr’s own spec for the blanks he stands behind.

### Accessibility

- Skip link exists (`general.skip` / “Skip to content”).
- Contrast of `--color-fg` `#ece7dc` on `#0c0b09` is about **16:1**. Muted `#9a9488` on `#0c0b09` is about **6.5:1** (passes AA for text). Subtle `#6f6a61` on `#0c0b09` is about **3.7:1**, and on the footer surface `#141311` about **3.5:1**. That fails AA for normal text (needs 4.5:1). It is used for `.site-footer__legal` and other subtle kickers. Lighten `--color-subtle`.
- `.field` sets `outline: none` and only changes border colour on focus (`assets/theme.css`). Buttons and links have no `:focus-visible` style. Keyboard users lose the cursor.
- Cart drawer is `aria-hidden="true"` in the HTML and `theme.js` never flips it when the drawer opens. No focus trap. Escape closes the email popup only, not the menu or cart. Menu button has no `aria-expanded`. Drawer is not a `dialog`.
- Quantity buttons in the cart use `aria-label="-"` and `"+"`.
- Variant `<select>` is removed from the accessibility tree (section 2). Selected size is colour and weight only.
- Email popup is `role="dialog"` and `aria-modal="true"`, which is right, but focus is not moved into it, and it opens itself after 8 seconds.
- Size chart tables have no `scope` on `<th>`.
- Marquee is `aria-hidden="true"`. Good. Hero ken-burns and the marquee honour `prefers-reduced-motion`. Good.
- Popup and cart do not lock background scroll in a way that keeps focus honest (`body.is-locked` hides overflow only).

---

## 6. Repo vs live — short version

| Question | Answer |
| --- | --- |
| Is the published theme this repo? | Yes. `Shopify.theme.name` is `pjr-shopify-theme/main`, id `154371948727`. |
| Is the repo behind the live theme? | No meaningful Liquid/CSS/JS drift found. Asset differences are Shopify’s minifier. |
| What is live that is not “in the code” as copy? | Navigation menu, collection membership, homepage meta description, social share image, page bodies (size guide inches, empty contact). |
| What goes live on push to `main`? | The published theme, immediately. Editor saves commit back to `main`. |
| Safe preview | Unpublished duplicate theme and/or a non-`main` branch. Details in “How future changes should be deployed”. |

---

## Suggested order of work (when building, not now)

1. Admin, same day: remove BOBER from Online Store (or at least from `/collections/all` sort and from any featured collection). Point the Shop menu at a curated collection. Replace the announcement so it does not say `KITCHEN10`. Disable Judge.me coupons and Qikify on a **duplicate** theme first.
2. Theme, on a preview branch: lookbook and cart links off `/collections/all`, sticky mobile add-to-cart, product image `srcset` / WebP, no `WELCOME10` popup.
3. With Piotr’s measurements: centimetre size guide on tees and hoodies; fix or noindex `/pages/size-guide`.
4. With Piotr’s catalog pass: unpublish off-brand products; fix `pjr-core` so the homepage capsule is the real line; point cross-sell at that line.
5. JSON-LD shipping details, search `noindex`, delete or stop maintaining `snippets/seo.liquid`.
6. B2B page + HubSpot form on the unpublished theme, tested into the real HubSpot portal, then publish.
