import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    });
    const { amount, platform, packageName, volume, username, email } =
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
            currency: "usd",
            unit_amount: Math.round(amount * 100),
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
