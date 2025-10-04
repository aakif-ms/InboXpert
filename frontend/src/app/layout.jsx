import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import SidebarLayout from "@/components/SidebarLayout.jsx";

export const metadata = {
  title: "InboXpert",
  description: "Email management dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <SidebarLayout>{children}</SidebarLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
