import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import OrderConfirmationEmail from "@/emails/OrderConfirmation";
import { sendDiscordNotification } from "@/lib/discord";
import { createOrder } from "@/lib/db";
import type { OrderPayload } from "@/lib/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { orderId, email, username, platform, service, quantity, price } =
      body as OrderPayload;

    // Validate required fields
    if (
      !orderId ||
      !email ||
      !username ||
      !platform ||
      !service ||
      !quantity ||
      price == null
    ) {
      return NextResponse.json(
        { error: "Missing required fields in order payload" },
        { status: 400 }
      );
    }

    const order: OrderPayload = {
      orderId,
      email,
      username,
      platform,
      service,
      quantity,
      price,
      currency: "USD",
    };

    const platformLabel = platform === "instagram" ? "Instagram" : "TikTok";

    // 1. Save order to database (critical — don't swallow errors)
    let dbOrderId: number | undefined;
    try {
      const dbResult = await createOrder({
        orderId,
        username,
        email,
        platform,
        service,
        followers: parseInt(quantity, 10) || 0,
        price,
      });
      dbOrderId = dbResult.id;
    } catch (dbErr) {
      console.error("[DB] Failed to save order:", dbErr);
      // Continue with notifications even if DB fails
    }

    // 2. Run email + Discord in parallel — neither should block the other
    const [emailResult] = await Promise.allSettled([
      resend.emails.send({
        from: "Reachopia <orders@reachopia.com>",
        to: [email],
        subject: `Order Confirmed — ${quantity} ${platformLabel} ${service} 🎉`,
        react: OrderConfirmationEmail({ order }),
      }),
      sendDiscordNotification(order),
    ]);

    // Check email result (Discord failures are already handled silently)
    if (emailResult.status === "rejected") {
      console.error("[Resend] Email send failed:", emailResult.reason);
    }

    if (emailResult.status === "fulfilled" && emailResult.value.error) {
      console.error("[Resend] Email error:", emailResult.value.error);
    }

    const emailId =
      emailResult.status === "fulfilled"
        ? emailResult.value.data?.id
        : undefined;

    return NextResponse.json({ success: true, emailId, dbOrderId });
  } catch (err) {
    console.error("[order-success] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
