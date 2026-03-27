import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { amountToCents } from "@/lib/currency";

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    });
    const { amount, platform, packageName, volume, username, email, currency = "USD" } =
      await req.json();

    if (!amount || !platform || !volume || !username || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const platformLabel = platform === "instagram" ? "Instagram" : "TikTok";
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(), // Stripe expects lowercase currency codes
            unit_amount: amountToCents(amount, currency), // Proper conversion to cents/stripe units
            product_data: {
              name: `${platformLabel} ${volume} AI Reach`,
              description: `AI-powered ${platformLabel} growth campaign for @${username}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        platform,
        packageName: packageName || `${volume} AI Reach`,
        volume,
        username,
        email,
        currency, // Store currency in metadata for tracking
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel?platform=${platform}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
