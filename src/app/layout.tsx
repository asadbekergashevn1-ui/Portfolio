/**
 * Root layout. Every real page is under /[locale] and renders its own <html>,
 * so this only wraps what Next renders outside that tree: the global 404.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
