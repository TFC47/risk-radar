import './globals.css'

export const metadata = {
  title: 'Risk Radar',
  description: 'Smart Mobility Telemetry',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black min-h-screen">
        {children}
      </body>
    </html>
  )
}