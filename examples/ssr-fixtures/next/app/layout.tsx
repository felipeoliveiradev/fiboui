import type { ReactNode } from 'react';
import 'fiboui/style.css';
import { HydrateFlag } from './hydrate-flag';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <HydrateFlag />
      </body>
    </html>
  );
}
