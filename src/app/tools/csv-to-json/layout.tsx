import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV → JSON",
  description: "CSV 데이터를 JSON 형식으로 변환합니다",
  alternates: { canonical: "/tools/csv-to-json/" },
  openGraph: {
    title: "CSV → JSON",
    description: "CSV 데이터를 JSON 형식으로 변환합니다",
    url: "/tools/csv-to-json/",
  },
  twitter: {
    title: "CSV → JSON | AlphaK Tools",
    description: "CSV 데이터를 JSON 형식으로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
