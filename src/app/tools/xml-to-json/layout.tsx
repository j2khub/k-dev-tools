import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XML → JSON",
  description: "XML 데이터를 JSON 구조로 변환합니다",
  alternates: { canonical: "/tools/xml-to-json/" },
  openGraph: {
    title: "XML → JSON",
    description: "XML 데이터를 JSON 구조로 변환합니다",
    url: "/tools/xml-to-json/",
  },
  twitter: {
    title: "XML → JSON | AlphaK Tools",
    description: "XML 데이터를 JSON 구조로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
