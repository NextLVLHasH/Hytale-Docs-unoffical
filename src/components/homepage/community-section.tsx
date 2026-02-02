"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink, Star } from "lucide-react";
import { DiscordIcon } from "@/components/icons/discord-icon";

export function CommunitySection() {
  const t = useTranslations("community");

  const communityLinks = [
    {
      title: "Discord",
      description: t("discordDesc"),
      href: "https://discord.gg/yAjaFBH4Y8",
      icon: DiscordIcon,
      color: "#5865F2",
    },
    {
      title: "GitHub",
      description: t("githubDesc"),
      href: "https://github.com/timiliris/Hytale-Docs",
      icon: Github,
      color: "#e2e8f0",
    },
  ];

  return (
    <section className="py-20 bg-card">
      <div className="container px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gradient hytale-title">
            {t("title")}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
          {communityLinks.map((link) => (
            <a
              key={link.title}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative flex flex-col items-center p-8 rounded-lg border-2 border-border bg-muted/30 transition-all duration-300 hover:border-opacity-50 hover:bg-muted/50">
                {/* Glow on hover */}
                <div
                  className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    boxShadow: `0 0 40px ${link.color}15`,
                  }}
                />

                {/* Icon */}
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${link.color}20` }}
                >
                  <link.icon
                    className="h-8 w-8"
                    style={{ color: link.color }}
                  />
                </div>

                {/* Title */}
                <h3
                  className="mb-2 text-lg font-bold transition-colors"
                  style={{ color: link.color }}
                >
                  {link.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground text-center">
                  {link.description}
                </p>

                {/* External link indicator */}
                <ExternalLink className="absolute top-4 right-4 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>

        {/* Star CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2 text-primary">
              <Star className="h-5 w-5 fill-primary" />
              <span className="font-semibold">{t("starTitle")}</span>
              <Star className="h-5 w-5 fill-primary" />
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              {t("starDescription")}
            </p>
            <Button
              size="lg"
              className="gap-2 bg-primary hover:bg-primary/90"
              asChild
            >
              <a
                href="https://github.com/timiliris/Hytale-Docs"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Star className="h-4 w-4" />
                {t("starButton")}
                <Github className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
