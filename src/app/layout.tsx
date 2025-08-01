// app/layout.js
import './globals.css';
import Image from 'next/image';

export const metadata = {
  title: 'Manzil Majlis Properties',
  description: 'Explore Manzil Majlis Properties',
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
        {children}
        </div>
      </body>
    </html>
  );
}