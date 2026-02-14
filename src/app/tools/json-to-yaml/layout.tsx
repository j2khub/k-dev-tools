import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON → YAML",
  description: "JSON 데이터를 YAML 형식으로 변환합니다",
  alternates: { canonical: "/tools/json-to-yaml/" },
  openGraph: {
    title: "JSON → YAML",
    description: "JSON 데이터를 YAML 형식으로 변환합니다",
    url: "/tools/json-to-yaml/",
  },
  twitter: {
    title: "JSON → YAML | AlphaK Tools",
    description: "JSON 데이터를 YAML 형식으로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
