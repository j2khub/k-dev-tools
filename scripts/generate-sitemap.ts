import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const SITE_URL = "https://k-dev-tools.alphak.workers.dev";

// Parse tools-list.ts to extract tool hrefs
const toolsListPath = resolve(__dirname, "../src/lib/tools-list.ts");
const toolsListContent = readFileSync(toolsListPath, "utf-8");

const hrefRegex = /href:\s*"([^"]+)"/g;
const toolHrefs: string[] = [];
let match;
while ((match = hrefRegex.exec(toolsListContent)) !== null) {
  toolHrefs.push(match[1]);
}

const specialPages = ["/", "/tools", "/finance", "/steam", "/books", "/calendar"];

const today = new Date().toISOString().split("T")[0];

const urls = [
  ...specialPages.map((page) => ({
    loc: page === "/" ? SITE_URL + "/" : `${SITE_URL}${page}/`,
    priority: page === "/" ? "1.0" : "0.8",
    changefreq: page === "/" ? "daily" : page === "/tools" ? "weekly" : "daily",
  })),
  ...toolHrefs.map((href) => ({
    loc: `${SITE_URL}${href}/`,
    priority: "0.6",
    changefreq: "monthly",
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const outPath = resolve(__dirname, "../out/sitemap.xml");
writeFileSync(outPath, sitemap, "utf-8");
console.log(`Sitemap generated: ${outPath} (${urls.length} URLs)`);
