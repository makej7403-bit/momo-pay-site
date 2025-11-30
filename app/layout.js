export const metadata = {
  title: "MoMo Pay Site",
  description: "Manual MoMo Payment for Liberia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
