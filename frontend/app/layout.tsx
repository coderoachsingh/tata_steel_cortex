import "./globals.css";

export const metadata = {
  title: "Tata Steel Control Tower",
  description: "Enterprise Supply Chain AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">
        {children}
      </body>
    </html>
  );
}






