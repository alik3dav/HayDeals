"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ShieldCheck,
  FolderTree,
  Grid2x2,
  LayoutGrid,
  BookOpen,
  LogIn,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Tag,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNotificationTime } from "@/features/notifications/time";
import { useNotifications } from "@/features/notifications/use-notifications";
import { UserAvatar } from "@/features/profile/components/user-avatar";
import { cn } from "@/lib/utils";

type HeaderCategory = {
  value: string;
  label: string;
};

type HeaderNavClientProps = {
  isAuthenticated: boolean;
  canAccessAdmin: boolean;
  userEmail?: string;
  profileDisplayName?: string;
  profileAvatarUrl?: string | null;
  logotypeUrl?: string | null;
  logoAlt?: string | null;
  logoSize?: "small" | "medium" | "large" | "custom";
  categories: HeaderCategory[];
  onSignOut: () => Promise<void>;
};

function useDropdownState() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const open = (key: string) => setOpenKey(key);
  const close = () => setOpenKey(null);
  const toggle = (key: string) =>
    setOpenKey((prev) => (prev === key ? null : key));

  return { openKey, open, close, toggle };
}

export function HeaderNavClient({
  canAccessAdmin,
  categories,
  isAuthenticated,
  onSignOut,
  userEmail,
  profileDisplayName,
  profileAvatarUrl,
  logotypeUrl,
  logoAlt,
  logoSize = "medium",
}: HeaderNavClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const { openKey, open, close, toggle } = useDropdownState();

  const categoriesRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);


  const {
    notifications,
    unreadCount: unreadNotifications,
    loadingList: notificationsLoading,
    loadedOnce: notificationsLoadedOnce,
    loadNotifications,
    markAllVisibleAsRead,
  } = useNotifications({ enabled: isAuthenticated });

  const [notificationsError, setNotificationsError] = useState<string | null>(null);

  const onNotificationsToggle = useCallback(async () => {
    if (openKey === "notifications") {
      close();
      return;
    }

    open("notifications");

    try {
      let unreadIds: string[] = [];

      if (!notificationsLoadedOnce) {
        const loadedNotifications = await loadNotifications();
        unreadIds = loadedNotifications
          .filter((notification) => !notification.isRead)
          .map((notification) => notification.id);
      }

      setNotificationsError(null);
      await markAllVisibleAsRead(unreadIds);
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : "Failed to load notifications.");
    }
  }, [close, loadNotifications, markAllVisibleAsRead, notificationsLoadedOnce, open, openKey]);

  const openNotification = useCallback((dealSlug: string | null) => {
    if (!dealSlug) {
      return;
    }

    if (typeof window !== "undefined") {
      window.location.href = `/deals/${dealSlug}`;
    }
  }, []);

  useEffect(() => {
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        setMobileOpen(false);
      }
    }

    function onOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (
        openKey === "categories" &&
        categoriesRef.current &&
        !categoriesRef.current.contains(target)
      ) {
        close();
      }

      if (
        openKey === "notifications" &&
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        close();
      }

      if (
        openKey === "profile" &&
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        close();
      }

      if (
        mobileOpen &&
        mobileRef.current &&
        !mobileRef.current.contains(target)
      ) {
        setMobileOpen(false);
      }
    }

    document.addEventListener("keydown", onEscape);
    document.addEventListener("mousedown", onOutsideClick);

    return () => {
      document.removeEventListener("keydown", onEscape);
      document.removeEventListener("mousedown", onOutsideClick);
    };
  }, [close, mobileOpen, openKey]);

  const topCategories = useMemo(() => categories.slice(0, 12), [categories]);
  const categoryGroups = useMemo(
    () =>
      [topCategories.slice(0, 6), topCategories.slice(6, 12)].filter(
        (group) => group.length > 0,
      ),
    [topCategories],
  );

  const avatarFallback = useMemo(
    () => profileDisplayName || userEmail || "User",
    [profileDisplayName, userEmail],
  );

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
    event.currentTarget.submit();
  };

  const hasOpenDropdown = openKey !== null;
  const logoClassName = useMemo(() => {
    switch (logoSize) {
      case "small":
        return "h-6 w-auto max-w-[120px]";
      case "large":
        return "h-10 w-auto max-w-[240px]";
      case "custom":
        return "h-10 w-auto max-w-[320px]";
      default:
        return "h-8 w-auto max-w-[180px]";
    }
  }, [logoSize]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 min-w-0 items-center gap-3">
          <Link className="shrink-0" href="/">
            {logotypeUrl ? (
              <Image
                alt={logoAlt || "CipiDeals"}
                className={logoClassName}
                src={logotypeUrl}
                width={180}
                height={40}
              />
            ) : (
              <span className="text-sm font-semibold tracking-tight">
                CipiDeals
              </span>
            )}
          </Link>

          <div className="relative hidden items-center gap-1 lg:flex" ref={categoriesRef}>
            <Link
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-all duration-150 hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              href="/categories"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Categories
            </Link>
            <button
              aria-expanded={openKey === "categories"}
              aria-label="Toggle categories dropdown"
              className="inline-flex h-8 items-center rounded-md px-2 text-xs font-medium text-muted-foreground transition-all duration-150 hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onClick={() => toggle("categories")}
              type="button"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-150",
                  openKey === "categories" && "rotate-180",
                )}
              />
            </button>

            <div
              className={cn(
                "absolute left-0 top-full w-[min(92vw,420px)] origin-top-left pt-2 transition-all duration-150",
                openKey === "categories"
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
              )}
            >
              <div className="rounded-xl border border-border/70 bg-background p-3 shadow-lg">
                <div className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <FolderTree className="h-3.5 w-3.5" />
                  Browse categories
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {categoryGroups.map((group, idx) => (
                    <ul className="space-y-1" key={idx}>
                      {group.map((category) => (
                        <li key={category.value}>
                          <Link
                            className="flex h-8 items-center gap-2 rounded-md px-2 text-xs text-foreground/90 transition-colors duration-150 hover:bg-muted/45 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            href={`/categories/${encodeURIComponent(category.value)}`}
                            onClick={() => close()}
                          >
                            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate">{category.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <form
            className="hidden min-w-0 flex-1 lg:block"
            method="get"
            onSubmit={handleSearchSubmit}
          >
            <label className="sr-only" htmlFor="header-search">
              Search deals
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 border-border/70 bg-muted/20 pl-8 pr-2 text-xs shadow-none transition-colors duration-150 placeholder:text-muted-foreground/80 hover:bg-muted/30 focus-visible:bg-background"
                id="header-search"
                name="q"
                placeholder="Search deals"
              />
            </div>
          </form>

          <div className="ml-auto hidden shrink-0 items-center gap-1.5 lg:flex">
            <Button
              asChild
              className="h-8 gap-1.5 px-3 text-xs"
              size="sm"
              variant="secondary"
            >
              <Link href="/dashboard/submit-deal">
                <Plus className="h-3.5 w-3.5" />
                Post deal
              </Link>
            </Button>

            {isAuthenticated ? (
              <>
                <div className="relative" ref={notificationsRef}>
                  <button
                    aria-label="Notifications"
                    aria-expanded={openKey === "notifications"}
                    className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted/45 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    onClick={() => void onNotificationsToggle()}
                    type="button"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadNotifications > 0 ? (
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    ) : null}
                  </button>

                  <div
                    className={cn(
                      "absolute right-0 top-full z-10 w-[min(92vw,20rem)] origin-top-right pt-2 transition-all duration-150",
                      openKey === "notifications"
                        ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                        : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
                    )}
                  >
                    <div className="max-h-[70vh] overflow-auto rounded-xl border border-border/70 bg-background p-1.5 shadow-lg">
                      <div className="mb-1 flex items-center justify-between px-2 py-1">
                        <span className="text-xs font-semibold text-foreground">
                          Notifications
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {unreadNotifications} unread
                        </span>
                      </div>
                      {notificationsLoading && !notificationsLoadedOnce ? (
                        <div className="px-2 py-4 text-center text-xs text-muted-foreground">Loading notifications...</div>
                      ) : notificationsError ? (
                        <div className="px-2 py-4 text-center text-xs text-destructive">{notificationsError}</div>
                      ) : notifications.length === 0 ? (
                        <div className="px-2 py-4 text-center text-xs text-muted-foreground">You&apos;re all caught up.</div>
                      ) : (
                        <ul className="space-y-1">
                          {notifications.map((notification) => (
                            <li key={notification.id}>
                              <button
                                className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition-colors duration-150 hover:bg-muted/45"
                                onClick={() => void openNotification(notification.dealSlug)}
                                type="button"
                              >
                                {!notification.isRead ? (
                                  <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                ) : (
                                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                )}
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-xs text-foreground/90">
                                    {notification.message}
                                  </span>
                                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                                    {formatNotificationTime(notification.createdAt)}
                                  </span>
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => open("profile")}
                  onMouseLeave={() => close()}
                  ref={profileRef}
                >
                  <button
                    aria-expanded={openKey === "profile"}
                    aria-label="Profile menu"
                    className="inline-flex h-8 items-center gap-1.5 rounded-md pl-1 pr-1.5 text-xs text-muted-foreground transition-colors duration-150 hover:bg-muted/45 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    onClick={() => toggle("profile")}
                    type="button"
                  >
                    <UserAvatar
                      avatarUrl={profileAvatarUrl}
                      className="h-6 w-6"
                      fallbackText={avatarFallback}
                    />
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-150",
                        openKey === "profile" && "rotate-180",
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "absolute right-0 top-full w-44 origin-top-right pt-2 transition-all duration-150",
                      openKey === "profile"
                        ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                        : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
                    )}
                  >
                    <div className="rounded-xl border border-border/70 bg-background p-1.5 shadow-lg">
                      <Link
                        className="flex h-8 items-center gap-2 rounded-md px-2 text-xs transition-colors duration-150 hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        href="/dashboard"
                        onClick={() => close()}
                      >
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        Dashboard
                      </Link>
                      <Link
                        className="flex h-8 items-center gap-2 rounded-md px-2 text-xs transition-colors duration-150 hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        href="/dashboard/settings"
                        onClick={() => close()}
                      >
                        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                        Settings
                      </Link>
                      {canAccessAdmin ? (
                        <Link
                          className="flex h-8 items-center gap-2 rounded-md px-2 text-xs transition-colors duration-150 hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          href="/admin"
                          onClick={() => close()}
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                          Admin
                        </Link>
                      ) : null}
                      <form action={onSignOut}>
                        <button
                          className="mt-1 flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-xs transition-colors duration-150 hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          type="submit"
                        >
                          <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
                          Sign out
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Button
                  asChild
                  className="h-8 px-2.5 text-xs"
                  size="sm"
                  variant="ghost"
                >
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button asChild className="h-8 px-3 text-xs" size="sm">
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          <button
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted/45 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            type="button"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>

        <div
          className={cn(
            "overflow-hidden border-t border-border/60 bg-background transition-[max-height,opacity] duration-150 lg:hidden",
            mobileOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
          )}
          ref={mobileRef}
        >
          <div className="container max-h-[calc(100vh-3.5rem)] space-y-2 overflow-y-auto py-2.5">
            <form className="pb-1" method="get" onSubmit={handleSearchSubmit}>
              <label className="sr-only" htmlFor="mobile-header-search">
                Search deals
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-9 border-border/70 bg-muted/25 pl-8 pr-2 text-sm shadow-none"
                  id="mobile-header-search"
                  name="q"
                  placeholder="Search deals"
                />
              </div>
            </form>

            <div className="rounded-lg border border-border/70 bg-muted/15 p-1">
              <button
                aria-expanded={categoriesExpanded}
                className="flex h-9 w-full items-center justify-between rounded-md px-2.5 text-sm font-medium"
                onClick={() => setCategoriesExpanded((prev) => !prev)}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <Grid2x2 className="h-4 w-4 text-muted-foreground" />
                  Categories
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-150",
                    categoriesExpanded && "rotate-180",
                  )}
                />
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-[max-height,opacity] duration-150",
                  categoriesExpanded
                    ? "max-h-80 opacity-100"
                    : "max-h-0 opacity-0",
                )}
              >
                <ul className="grid grid-cols-1 gap-1 px-1 pb-1">
                  {topCategories.map((category) => (
                    <li key={category.value}>
                      <Link
                        className="flex h-9 items-center rounded-md px-2.5 text-sm text-foreground/90 transition-colors duration-150 hover:bg-muted/50"
                        href={`/categories/${encodeURIComponent(category.value)}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {category.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1">
              <Button asChild className="h-9 justify-start text-sm" variant="ghost">
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <BookOpen className="h-4 w-4" />
                  Deals
                </Link>
              </Button>
              <Button asChild className="h-9 justify-start text-sm" variant="ghost">
                <Link href="/categories" onClick={() => setMobileOpen(false)}>
                  <LayoutGrid className="h-4 w-4" />
                  Categories
                </Link>
              </Button>

              <Button
                asChild
                className="h-9 justify-start gap-2 text-sm"
                variant="secondary"
              >
                <Link
                  href="/dashboard/submit-deal"
                  onClick={() => setMobileOpen(false)}
                >
                  <Plus className="h-4 w-4" />
                  Post deal
                </Link>
              </Button>

              {isAuthenticated ? (
                <>
                  <Button
                    asChild
                    className="h-9 justify-start text-sm"
                    variant="ghost"
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="h-9 justify-start text-sm"
                    variant="ghost"
                  >
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </Button>
                  {canAccessAdmin ? (
                    <Button
                      asChild
                      className="h-9 justify-start text-sm"
                      variant="ghost"
                    >
                      <Link href="/admin" onClick={() => setMobileOpen(false)}>
                        <ShieldCheck className="h-4 w-4" />
                        Admin
                      </Link>
                    </Button>
                  ) : null}
                  <form action={onSignOut}>
                    <Button
                      className="h-9 w-full justify-start text-sm"
                      type="submit"
                      variant="ghost"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    className="h-9 justify-start text-sm"
                    variant="ghost"
                  >
                    <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                      <LogIn className="h-4 w-4" />
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild className="h-9 justify-start text-sm">
                    <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-30 bg-black/50 transition-opacity duration-150",
          hasOpenDropdown
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={close}
      />
    </>
  );
}
