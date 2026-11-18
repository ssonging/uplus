import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

// 토큰 font-sans(Noto Sans KR)를 next/font로 불러와 같은 변수 --font-sans에 넣는다.
const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "요금제 목록",
  description: "데이터 사용량과 구독 서비스로 요금제를 비교합니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} font-sans`}>{children}</body>
    </html>
  );
}
