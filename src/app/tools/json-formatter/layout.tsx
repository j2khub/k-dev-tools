import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON 포매터",
  description: "JSON 데이터를 보기 좋게 정리하고 유효성을 검사합니다",
  alternates: { canonical: "/tools/json-formatter/" },
  openGraph: {
    title: "JSON 포매터",
    description: "JSON 데이터를 보기 좋게 정리하고 유효성을 검사합니다",
    url: "/tools/json-formatter/",
  },
  twitter: {
    title: "JSON 포매터 | AlphaK Tools",
    description: "JSON 데이터를 보기 좋게 정리하고 유효성을 검사합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
