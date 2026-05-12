import "./globals.css";

export const metadata = {
  title: 'AutoReel AI',
  description: 'Turn audio into viral reels instantly.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

