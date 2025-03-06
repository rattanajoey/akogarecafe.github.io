import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Akogare Cafe",
  description: "A cozy virtual space for shogi, music, and more",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script src="/mouseFollower.js" strategy="afterInteractive" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
