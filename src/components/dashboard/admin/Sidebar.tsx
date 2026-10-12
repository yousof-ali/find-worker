"use client";

import { OutlierLogo } from "@/components/Icons";
import Button from "@/components/ui/Button";

import CommonText from "@/components/ui/CommonText";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useDashboard } from "@/providers/DashboardContext";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CiUser, CiViewList } from "react-icons/ci";
import { FaListUl, FaRegNewspaper } from "react-icons/fa";
import { ImUsers } from "react-icons/im";
import { MdAnalytics } from "react-icons/md";
import { MdArticle } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import {
  MdDashboard,
  MdExpandMore,
  MdOutlineWork,
  MdPeople,
} from "react-icons/md";

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon: ReactNode;
  children?: NavChild[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();

  const { isSidebarOpen, isSidebarCollapsed, closeSidebar } = useDashboard();

  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
  };

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <MdDashboard />,
    },
    {
      id: "category",
      label: "Category",
      href: "/admin/category",
      icon: <FaListUl />,
    },
    {
      id: "sample",
      label: "Work Sample",
      href: "/admin/work-sample",
      icon: <FaRegNewspaper />,
    },
    {
      id: "blogs",
      label: "Blogs",
      href: "/admin/blog",
      icon: <MdArticle />,
    },
    {
      id: "workers",
      label: "Workers",
      icon: <MdOutlineWork />,
      children: [
        {
          label: "All Workers",
          href: "/admin/workers",
        },
        {
          label: "Add Worker",
          href: "/admin/workers/new",
        },
        {
          label: "Review & Feedback",
          href: "/admin/review",
        },
      ],
    },
    {
      id: "clients",
      label: "All Clients",
      href: "/admin/clients",
      icon: <ImUsers />,
    },
    {
      id: "visitors",
      label: "Website Visitors",
      href: "/admin/visitors",
      icon: <MdAnalytics />,
    },
  ];

  /*
   * Automatically open parent when
   * current route belongs to submenu.
   */
  useEffect(() => {
    navItems.forEach((item) => {
      const hasActiveChild = item.children?.some(
        (child) => pathname === child.href,
      );

      if (hasActiveChild) {
        setOpenMenus((prev) =>
          prev.includes(item.id) ? prev : [...prev, item.id],
        );
      }
    });
  }, [pathname]);

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  /*
   * Mobile/tablet:
   * Sidebar closed
   */
  if (!isSidebarOpen) {
    return null;
  }

  return (
    <aside
      className={`
    flex h-screen shrink-0 flex-col
    bg-gray-200 p-4
    transition-all duration-300
    ${isSidebarCollapsed ? "w-[80px]" : "w-[300px]"}
    max-lg:absolute
    max-lg:left-0
    max-lg:top-0
    max-lg:z-50
    max-lg:w-[300px]
  `}
    >
      <div className="shrink-0">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 group",
              isSidebarCollapsed && "justify-center w-full",
            )}
          >
            <div className="relative shrink-0">
              <OutlierLogo className="h-8 w-8 rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-105" />
            </div>

            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    Outlier
                  </span>

                  <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-700">
                    AI
                  </span>
                </div>

                <span className="-mt-0.5 font-mono text-[10px] tracking-tight text-slate-500">
                  by Scale AI
                </span>
              </div>
            )}
          </Link>

          <Button
            variant="ghost"
            className="p-2 text-2xl lg:hidden"
            onClick={closeSidebar}
          >
            <IoClose />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 custom-scrollbar py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;

            const hasActiveChild = item.children?.some(
              (child) => pathname === child.href,
            );

            const isDirectActive = item.href && pathname === item.href;

            /*
             * Expanded sidebar:
             * Parent active only when direct route active.
             *
             * Collapsed sidebar:
             * Parent icon active when child route active.
             */
            const isParentActive = isSidebarCollapsed
              ? Boolean(isDirectActive || hasActiveChild)
              : Boolean(isDirectActive);

            const isOpen = openMenus.includes(item.id);

            return (
              <li key={item.id}>
                {hasChildren ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.id)}
                      className={`
                          flex w-full items-center gap-3
                          rounded-md p-2
                          transition-colors
                          ${
                            isParentActive
                              ? "bg-black text-white"
                              : "hover:bg-gray-300"
                          }
                          ${isSidebarCollapsed ? "justify-center" : ""}
                        `}
                    >
                      <span className="shrink-0 text-xl">{item.icon}</span>

                      {!isSidebarCollapsed && (
                        <>
                          <CommonText className="flex-1 text-left">
                            {item.label}
                          </CommonText>

                          <MdExpandMore
                            className={`
                                text-xl transition-transform
                                duration-200
                                ${isOpen ? "rotate-180" : ""}
                              `}
                          />
                        </>
                      )}
                    </button>

                    {/* Submenu */}
                    {!isSidebarCollapsed && isOpen && (
                      <ul className="ml-5 mt-1 space-y-1 border-l border-gray-500 pl-3">
                        {item.children?.map((child) => {
                          const isChildActive = pathname === child.href;

                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={`
          block rounded-md p-2 text-sm transition-colors
          ${isChildActive ? "bg-black text-white" : "hover:bg-gray-300"}
        `}
                              >
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    className={`
                        flex items-center gap-3
                        rounded-md p-2
                        transition-colors
                        ${
                          isParentActive
                            ? "bg-black text-white"
                            : "hover:bg-gray-300"
                        }
                        ${isSidebarCollapsed ? "justify-center" : ""}
                      `}
                  >
                    <span className="shrink-0 text-xl">{item.icon}</span>

                    {!isSidebarCollapsed && (
                      <CommonText>{item.label}</CommonText>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Profile */}
      <div
        className={`
          flex items-center  mt-4 gap-4
          ${isSidebarCollapsed ? "justify-center" : ""}
        `}
      >
        <div
          className={`
            cursor-pointer rounded-md p-2
            hover:bg-gray-300
            ${isSidebarCollapsed ? "" : "flex-1"}
          `}
        >
          <div className="flex items-center gap-2">
            <div className="shrink-0 rounded-full border border-black p-1 text-2xl">
              <CiUser />
            </div>

            {!isSidebarCollapsed && (
              <div>
                <CommonText className="uppercase">{user?.role}</CommonText>

                <CommonText className="text-xs text-foreground-secondary">
                  {user?.firstName} {user?.lastName}
                </CommonText>
              </div>
            )}
          </div>
        </div>

        {/* Logout hidden when collapsed */}
        {!isSidebarCollapsed && (
          <Button
            onClick={handleLogout}
            disabled={loading}
            loading={loading}
            variant="ghost"
            className="text-2xl"
          >
            <IoIosLogOut />
          </Button>
        )}
      </div>
    </aside>
  );
}
