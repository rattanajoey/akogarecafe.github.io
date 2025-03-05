import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Akogare Cafe',
  description: 'A cozy virtual space for shogi, music, and more',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="/mouseFollower.js" defer></script>
      </head>
      <body className={inter.className}>
        <div className="cursor"></div>
        <div className="follower"></div>
        {children}
      </body>
    </html>
  );
} 