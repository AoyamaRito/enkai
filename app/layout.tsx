export const metadata = {
  title: '株式会社ソリスト合唱団 - ゲームと教育サービスで人と人をつなぐ',
  description: 'ソリスト合唱団は、ゲームと教育サービスを通じて人と人をつなぐことを目指す企業です。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}