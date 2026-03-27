import type { OrderPayload } from "./types";
import { formatCurrency } from "./currency";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields: DiscordEmbedField[];
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
  thumbnail?: { url: string };
}

interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  embeds: DiscordEmbed[];
}

export async function sendDiscordNotification(
  order: OrderPayload
): Promise<void> {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn(
      "[Discord] DISCORD_WEBHOOK_URL is not configured — skipping notification."
    );
    return;
  }

  const platformLabel =
    order.platform === "instagram" ? "Instagram" : "TikTok";
  const platformEmoji = order.platform === "instagram" ? "📸" : "🎵";
  const formattedPrice = formatCurrency(order.price, order.currency ?? "USD");

  const embed: DiscordEmbed = {
    title: "🎉 Nouvelle Commande Validée !",
    description: `Un client vient de passer commande pour **${order.quantity} ${platformLabel} ${order.service}**.`,
    color: 0x2ecc71, // Green
    fields: [
      {
        name: "📋 Numéro de commande",
        value: `\`#${order.orderId}\``,
        inline: true,
      },
      {
        name: "💰 Montant",
        value: `**${formattedPrice}**`,
        inline: true,
      },
      {
        name: "📦 Service",
        value: `${platformEmoji} ${order.quantity} ${platformLabel} ${order.service}`,
        inline: false,
      },
      {
        name: "👤 Username cible",
        value: `\`@${order.username}\``,
        inline: true,
      },
      {
        name: "📧 Email client",
        value: order.email,
        inline: true,
      },
      {
        name: "🌐 Plateforme",
        value: platformLabel,
        inline: true,
      },
    ],
    footer: {
      text: "Reachopia — Système de commandes",
    },
    timestamp: new Date().toISOString(),
  };

  const payload: DiscordWebhookPayload = {
    username: "Reachopia Orders",
    avatar_url: "https://reachopia.com/logo.png",
    embeds: [embed],
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      console.error(
        `[Discord] Webhook responded with ${response.status}: ${response.statusText}`
      );
    }
  } catch (err) {
    // Never let Discord failure break the order flow
    console.error("[Discord] Failed to send notification:", err);
  }
}
