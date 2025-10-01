import "./globals.css";

import SidebarLayout from "@/components/SidebarLayout.jsx";

export const metadata = {
  title: "InboXpert",
  description: "Email management dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}
