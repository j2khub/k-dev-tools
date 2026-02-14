import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";

// Parse tools-list.ts to extract tool data
const toolsListPath = resolve(__dirname, "../src/lib/tools-list.ts");
const toolsListContent = readFileSync(toolsListPath, "utf-8");

interface Tool {
  name: string;
  description: string;
  href: string;
  category: string;
}

// Extract tool objects using regex
const toolRegex =
  /\{\s*name:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*href:\s*"([^"]+)",\s*category:\s*"([^"]+)",?\s*\}/g;

const tools: Tool[] = [];
let match;
while ((match = toolRegex.exec(toolsListContent)) !== null) {
  tools.push({
    name: match[1],
    description: match[2],
    href: match[3],
    category: match[4],
  });
}

console.log(`Found ${tools.length} tools. Generating layout files...`);

let created = 0;
let skipped = 0;

for (const tool of tools) {
  // Extract slug from href: "/tools/pdf-split" → "pdf-split"
  const slug = tool.href.replace("/tools/", "");
  const layoutDir = resolve(__dirname, `../src/app/tools/${slug}`);
  const layoutPath = resolve(layoutDir, "layout.tsx");

  if (!existsSync(layoutDir)) {
    mkdirSync(layoutDir, { recursive: true });
  }

  // Skip if layout already exists (don't overwrite manual customizations)
  if (existsSync(layoutPath)) {
    skipped++;
    continue;
  }

  const content = `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${tool.name}",
  description: "${tool.description}",
  alternates: { canonical: "${tool.href}/" },
  openGraph: {
    title: "${tool.name}",
    description: "${tool.description}",
    url: "${tool.href}/",
  },
  twitter: {
    title: "${tool.name} | AlphaK Tools",
    description: "${tool.description}",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
`;

  writeFileSync(layoutPath, content, "utf-8");
  created++;
}

console.log(`Done! Created: ${created}, Skipped (existing): ${skipped}`);
