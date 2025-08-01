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
        <header className="header">
          <div className="logo">
            <Image src="images/Logo.svg" alt="Manzil Majlis Logo" width={161} height={106} />
          </div>
          <a href="/">
            <div className="home-icon">
              <Image src="images/Home.svg" alt="Home" width={80} height={80} />
            </div>
          </a>
        </header>
        {children}
        </div>
      </body>
    </html>
  );
}