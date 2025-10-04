"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import {
  IconSettings,
  IconBrandTabler,
  IconLogout,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function SidebarLayout({ children }) {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/signUp";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const links = [
    {
      label: "Dashboard",
      href: "/",
      icon: <IconBrandTabler className="h-5 w-5" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <IconSettings className="h-5 w-5" />,
    },
  ];

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto flex min-w-full flex-1 flex-col md:flex-row",
        "min-h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 min-h-screen">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <Link key={idx} href={link.href}>
                  <SidebarLink link={link} />
                </Link>
              ))}
              {isAuthenticated && (
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700">
                  <IconLogout className="h-5 w-5" />
                  {open && <span>Logout</span>}
                </button>
              )}
            </div>
          </div>

          {isAuthenticated && (
            <SidebarLink
              link={{
                label: user?.name || "User",
                href: "/profile",
                icon: (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                ),
              }}
            />
          )}
        </SidebarBody>
      </Sidebar>

      <div className="flex flex-1">
        <div className="flex flex-1 flex-col p-4 md:p-10">{children}</div>
      </div>
    </div>
  );
}


export const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        InboXpert
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </Link>
  );
};