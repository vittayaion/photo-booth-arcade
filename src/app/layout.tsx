import type { Metadata } from "next";
import "@fontsource/noto-sans-thai/400.css";
import "@fontsource/noto-sans-thai/600.css";
import "@fontsource/noto-sans-thai/700.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/press-start-2p";
import "./globals.css";
import { Header, Footer } from "@/components/ui";
export const metadata: Metadata = {
  title: "Pomeranian Photo Booth Arcade · ปอมปอมโฟโต้บูธ",
  description:
    "ถ่ายรูป ตกแต่งสติกเกอร์พิกเซล และเก็บความทรงจำกับปอมปอม รูปส่วนตัวอยู่บนอุปกรณ์ของคุณ",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
