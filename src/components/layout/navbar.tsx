"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  Gamepad2,
  Server,
  Code,
  Wrench,
  Github,
  Menu,
  Puzzle,
  Calendar,
  Terminal,
  Cpu,
  Box,
  Palette,
  Settings,
  Shield,
  Cloud,
  Container,
  BookOpen,
  Zap,
  Blocks,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSelector } from "./language-selector";
import { cn } from "@/lib/utils";
import { SearchDialog } from "./search-dialog";
import { DiscordIcon } from "@/components/icons/discord-icon";

// Menu item component for mega-menu
interface MenuItemProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const MenuItem = React.memo(
  React.forwardRef<HTMLAnchorElement, MenuItemProps>(
    ({ href, icon: Icon, title, description }, ref) => {
      return (
        <li>
          <NavigationMenuLink asChild>
            <Link
              ref={ref}
              href={href}
              className="group flex select-none gap-3 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 bg-muted/0 hover:bg-muted/80 focus:bg-muted/80"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/80 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-200">
                <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium leading-none group-hover:text-foreground transition-colors duration-200">{title}</span>
                <span className="line-clamp-2 text-xs leading-snug text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200">
                  {description}
                </span>
              </div>
            </Link>
          </NavigationMenuLink>
        </li>
      );
    }
  )
);
MenuItem.displayName = "MenuItem";

// Featured link component for main CTA in dropdown
interface FeaturedLinkProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const FeaturedLink = React.memo(function FeaturedLink({ href, icon: Icon, title, description, gradient }: FeaturedLinkProps) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        className={cn(
          "flex h-full w-full select-none flex-col justify-end rounded-lg p-4 no-underline outline-none focus:shadow-md transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5",
          gradient
        )}
      >
        <Icon className="h-6 w-6 text-white mb-2 transition-transform duration-200 group-hover:scale-110" />
        <div className="mb-1 text-base font-medium text-white">{title}</div>
        <p className="text-xs leading-tight text-white/80">{description}</p>
      </Link>
    </NavigationMenuLink>
  );
});

export function Navbar() {
  const t = useTranslations("nav");
  const tSidebar = useTranslations("sidebar");
  const tMenu = useTranslations("megaMenu");
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const mainNav = React.useMemo(() => [
    {
      title: t("playerGuide"),
      href: "/docs/gameplay/overview",
      icon: Gamepad2,
    },
    {
      title: t("modding"),
      href: "/docs/modding/overview",
      icon: Code,
    },
    {
      title: t("servers"),
      href: "/docs/servers/overview",
      icon: Server,
    },
    {
      title: t("tools"),
      href: "/tools",
      icon: Wrench,
    },
  ], [t]);

  // Modding submenu items
  const moddingItems: MenuItemProps[] = React.useMemo(() => [
    {
      href: "/docs/modding/plugins/overview",
      icon: Puzzle,
      title: tSidebar("plugins"),
      description: tMenu("pluginsDesc"),
    },
    {
      href: "/docs/plugins/events",
      icon: Calendar,
      title: tSidebar("eventsReference"),
      description: tMenu("eventsDesc"),
    },
    {
      href: "/docs/modding/data-assets/overview",
      icon: Box,
      title: tSidebar("dataAssets"),
      description: tMenu("dataAssetsDesc"),
    },
    {
      href: "/docs/modding/art-assets/overview",
      icon: Palette,
      title: tSidebar("artAssets"),
      description: tMenu("artAssetsDesc"),
    },
    {
      href: "/docs/api/server-internals",
      icon: Cpu,
      title: tSidebar("apiReference"),
      description: tMenu("apiDesc"),
    },
    {
      href: "/docs/api/server-internals/ecs",
      icon: Blocks,
      title: tSidebar("ecsSystem"),
      description: tMenu("ecsDesc"),
    },
  ], [tSidebar, tMenu]);

  // Servers submenu items
  const serversItems: MenuItemProps[] = React.useMemo(() => [
    {
      href: "/docs/servers/setup/installation",
      icon: BookOpen,
      title: tSidebar("installation"),
      description: tMenu("installationDesc"),
    },
    {
      href: "/docs/servers/setup/configuration",
      icon: Settings,
      title: tSidebar("configuration"),
      description: tMenu("configurationDesc"),
    },
    {
      href: "/docs/servers/administration/commands",
      icon: Terminal,
      title: tSidebar("commands"),
      description: tMenu("commandsDesc"),
    },
    {
      href: "/docs/servers/administration/permissions",
      icon: Shield,
      title: tSidebar("permissions"),
      description: tMenu("permissionsDesc"),
    },
    {
      href: "/docs/servers/hosting/docker",
      icon: Container,
      title: tSidebar("docker"),
      description: tMenu("dockerDesc"),
    },
    {
      href: "/docs/servers/hosting/providers",
      icon: Cloud,
      title: tSidebar("cloudProviders"),
      description: tMenu("cloudProvidersDesc"),
    },
  ], [tSidebar, tMenu]);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isModdingActive = pathname.startsWith("/docs/modding") || pathname.startsWith("/docs/api") || pathname.startsWith("/docs/plugins");
  const isServersActive = pathname.startsWith("/docs/servers");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <Image
                src="/logo-h.png"
                alt="Hytale"
                width={32}
                height={32}
                className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-foreground">Hytale</span>
              <span className="text-primary">Docs</span>
            </span>
          </Link>

          {/* Desktop Navigation with Mega Menus */}
          <div className="hidden lg:flex w-full ml-7">
            <NavigationMenu className="hidden lg:flex w-full">
              <NavigationMenuList >
                {/* Player Guide - Simple Link */}
                <NavigationMenuItem>
                  <Link
                    href="/docs/gameplay/overview"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      pathname.startsWith("/docs/gameplay")
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                    )}
                  >
                    <Gamepad2 className="h-4 w-4" />
                    {t("playerGuide")}
                  </Link>
                </NavigationMenuItem>

                {/* Modding - Mega Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "flex items-center gap-2 rounded-lg",
                      isModdingActive
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <Code className="h-4 w-4" />
                    {t("modding")}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-150 grid-cols-[180px_1fr]">
                      {/* Featured Section */}
                      <div className="row-span-3">
                        <FeaturedLink
                          href="/docs/modding/overview"
                          icon={Zap}
                          title={tMenu("moddingFeaturedTitle")}
                          description={tMenu("moddingFeaturedDesc")}
                          gradient="bg-gradient-to-b from-purple-500 to-indigo-600"
                        />
                      </div>
                      {/* Menu Items */}
                      <ul className="grid grid-cols-2 gap-1">
                        {moddingItems.map((item) => (
                          <MenuItem key={item.href} {...item} />
                        ))}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Servers - Mega Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "flex items-center gap-2 rounded-lg",
                      isServersActive
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <Server className="h-4 w-4" />
                    {t("servers")}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-150 grid-cols-[180px_1fr]">
                      {/* Featured Section */}
                      <div className="row-span-3">
                        <FeaturedLink
                          href="/docs/servers/overview"
                          icon={Server}
                          title={tMenu("serversFeaturedTitle")}
                          description={tMenu("serversFeaturedDesc")}
                          gradient="bg-gradient-to-b from-orange-500 to-red-600"
                        />
                      </div>
                      {/* Menu Items */}
                      <ul className="grid grid-cols-2 gap-1">
                        {serversItems.map((item) => (
                          <MenuItem key={item.href} {...item} />
                        ))}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Tools - Simple Link */}
                <NavigationMenuItem>
                  <Link
                    href="/tools"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      pathname.startsWith("/tools")
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                    )}
                  >
                    <Wrench className="h-4 w-4" />
                    {t("tools")}
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <SearchDialog />

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Discord */}
              <SocialElement
                href="https://discord.gg/yAjaFBH4Y8"
                icon={DiscordIcon as LucideIcon}
                title="Discord"
                tooltipDescription="Join our Discord"
                ariaLabel="Join our Discord"
              />

              {/* GitHub */}
              <SocialElement
                href="https://github.com/timiliris/Hytale-Docs"
                icon={Github as LucideIcon}
                title="GitHub"
                tooltipDescription="View on GitHub"
                ariaLabel="View on GitHub"
              />
              {/* Language Selector */}
              <LanguageSelector />

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden min-h-11 min-w-11 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <SheetContent side="right" className="w-[85vw] sm:min-w-87.5 flex flex-col">
                <SheetHeader className="px-5 py-4 border-b text-left">
                  <SheetTitle className="flex items-center gap-2.5">
                    <Image
                      src="/logo-h.png"
                      alt="Hytale"
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                    />
                    <span className="text-lg font-bold tracking-tight">
                      <span className="text-foreground">Hytale</span>
                      <span className="text-primary">Docs</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                  <nav className="flex flex-col gap-1 p-3">
                    <div className="px-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Navigation
                    </div>
                    {mainNav.map((item) => {
                      const isActive = pathname.startsWith(item.href);
                      return (
                        <SheetClose key={item.title} asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                              isActive
                                ? "text-primary bg-primary/10"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                          </Link>
                        </SheetClose>
                      );
                    })}

                    <div className="mt-3 px-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Community
                    </div>
                    <SheetClose asChild>
                      <a
                        href="https://discord.gg/yAjaFBH4Y8"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                      >
                        <DiscordIcon className="h-4 w-4" />
                        Discord
                      </a>
                    </SheetClose>
                    <SheetClose asChild>
                      <a
                        href="https://github.com/timiliris/Hytale-Docs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                      >
                        <Github className="h-4 w-4" />
                        GitHub
                      </a>
                    </SheetClose>
                  </nav>
                </div>

                {/* Footer Settings */}
                <SheetFooter className="bg-muted/30 border-t">
                  <div className="flex flex-col gap-1 pb-2">
                    <ThemeToggle mobile label="Appearance" />
                    <LanguageSelector mobile label="Language" />
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

/*
 * I also pulled out the social element component to make it reusable and to clean up the code a bit.
 */
interface SocialElementProps {
  href: string;
  icon: LucideIcon;
  title: string;
  tooltipDescription: string;
  ariaLabel: string;
  tooltipDelayDuration?: number;
}
const SocialElement = ({ ...props }: SocialElementProps) => {
  return (
    <Tooltip delayDuration={props.tooltipDelayDuration || 300}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex min-h-11 min-w-11 text-muted-foreground hover:text-primary hover:bg-primary/10"
          asChild
        >
          <a
            href={props.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={props.ariaLabel}
          >
            <props.icon className="h-5 w-5" />
            <span className="sr-only">{props.title}</span>
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {props.tooltipDescription}
      </TooltipContent>
    </Tooltip>
  )
}
