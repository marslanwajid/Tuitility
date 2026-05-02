# Tuitility Site Summary

## Overview
Tuitility is a browser-based catalog of free online calculators, converters, document tools, and productivity utilities built with Vite and React.

## Current Catalog
- Total indexable tools: 92
- Categories:
  - Math: 15
  - Finance: 21
  - Science: 8
  - Health: 11
  - Utility: 24
  - Knowledge: 13

## Route Structure
- Home: `/`
- Category pages:
  - `/math`
  - `/finance`
  - `/science`
  - `/health`
  - `/utility-tools`
  - `/knowledge`
- Static pages:
  - `/about`
  - `/contact`
  - `/privacy-policy`

## SEO System
- Canonical tags, titles, descriptions, keywords, Open Graph tags, Twitter tags, and structured data are handled through:
  - `src/components/Seo.jsx`
  - `src/components/SeoManager.jsx`
  - `src/utils/seo.js`
- Tool-specific metadata and editorial support content are generated from:
  - `src/data/allTools.js`
  - `src/data/toolContent.js`
- Current ranking-opportunity notes live in:
  - `SEO_PRIORITY_TOOLS.md`
- Every tool route now has shared SEO-rich content appended through:
  - `src/components/ToolContentEnhancer.jsx`
- Sitemap generation is driven from indexable route data with:
  - `scripts/generate-sitemap.js`

## Content Strategy
- Each tool page should provide:
  - clear title and description
  - canonical URL
  - relevant keyword set
  - structured data
  - supporting content sections
  - internal links to related tools
- Each category page should provide:
  - search/filter access to tools
  - crawlable supporting copy
  - internal linking to important tools in the category

## Risk Notes
- Client-side env usage should follow `import.meta.env` with `VITE_*` names.
- The tool catalog in `src/data/allTools.js` is the source of truth for sitemap and route-level SEO coverage and should stay aligned with `src/App.jsx`.
- Heavy file/PDF/image features should be watched for bundle growth and load performance.

## Useful Commands
```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
npm.cmd run generate-sitemap
```
