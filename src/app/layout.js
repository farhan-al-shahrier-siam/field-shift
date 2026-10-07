import './globals.css';
import { FarmProvider } from '@/context/FarmContext';

export const metadata = {
  title: 'Field Shift — NASA-Powered Agricultural Adaptation',
  description: 'Explore NASA climate and weather data to discover smarter crop choices, resilient crop rotations, and practical farm adaptation strategies. Your farm is changing. Your strategy can too.',
  keywords: 'NASA, agriculture, climate, crop recommendation, farm adaptation, crop rotation, NASA POWER, Space Apps',
  openGraph: {
    title: 'Field Shift',
    description: 'Your farm is changing. Your strategy can too.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <FarmProvider>
          {children}
        </FarmProvider>
      </body>
    </html>
  );
}
