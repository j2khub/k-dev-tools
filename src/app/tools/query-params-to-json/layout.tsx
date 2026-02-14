import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "쿼리 파라미터 → JSON",
  description: "URL 쿼리 문자열을 JSON 객체로 파싱합니다",
  alternates: { canonical: "/tools/query-params-to-json/" },
  openGraph: {
    title: "쿼리 파라미터 → JSON",
    description: "URL 쿼리 문자열을 JSON 객체로 파싱합니다",
    url: "/tools/query-params-to-json/",
  },
  twitter: {
    title: "쿼리 파라미터 → JSON | AlphaK Tools",
    description: "URL 쿼리 문자열을 JSON 객체로 파싱합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
