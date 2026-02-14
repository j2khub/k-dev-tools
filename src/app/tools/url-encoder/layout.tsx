import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL 인코딩/디코딩",
  description: "URL을 안전한 형식으로 인코딩하거나 디코딩합니다",
  alternates: { canonical: "/tools/url-encoder/" },
  openGraph: {
    title: "URL 인코딩/디코딩",
    description: "URL을 안전한 형식으로 인코딩하거나 디코딩합니다",
    url: "/tools/url-encoder/",
  },
  twitter: {
    title: "URL 인코딩/디코딩 | AlphaK Tools",
    description: "URL을 안전한 형식으로 인코딩하거나 디코딩합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
