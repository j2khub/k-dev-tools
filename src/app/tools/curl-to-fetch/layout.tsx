import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "cURL → fetch 변환",
  description: "cURL 명령을 JavaScript fetch 코드로 변환합니다",
  alternates: { canonical: "/tools/curl-to-fetch/" },
  openGraph: {
    title: "cURL → fetch 변환",
    description: "cURL 명령을 JavaScript fetch 코드로 변환합니다",
    url: "/tools/curl-to-fetch/",
  },
  twitter: {
    title: "cURL → fetch 변환 | AlphaK Tools",
    description: "cURL 명령을 JavaScript fetch 코드로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
