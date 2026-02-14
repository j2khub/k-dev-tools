import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON → CSV",
  description: "JSON 데이터를 CSV 형식으로 변환합니다",
  alternates: { canonical: "/tools/json-to-csv/" },
  openGraph: {
    title: "JSON → CSV",
    description: "JSON 데이터를 CSV 형식으로 변환합니다",
    url: "/tools/json-to-csv/",
  },
  twitter: {
    title: "JSON → CSV | AlphaK Tools",
    description: "JSON 데이터를 CSV 형식으로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
