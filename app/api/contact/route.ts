import { NextRequest, NextResponse } from "next/server";
import { validateContactForm } from "@/lib/validation";
import { sendContactNotification } from "@/lib/email";

// Simple in-memory rate limiting map (IP -> timestamps[])
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Filter timestamps within current window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // 1. IP extraction for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: "Too many messages sent. Please wait a few minutes before submitting again.",
        },
        { status: 429 }
      );
    }

    // 2. Parse request JSON payload
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_JSON",
          message: "Malformed request payload.",
        },
        { status: 400 }
      );
    }

    // 3. Server-side validation and sanitization
    const validation = validateContactForm(body);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_FAILED",
          errors: validation.errors,
          message: "Please correct the errors in the form.",
        },
        { status: 400 }
      );
    }

    // 4. Send email through Resend service
    const delivery = await sendContactNotification(validation.sanitizedData);

    if (!delivery.success) {
      if (delivery.error === "EMAIL_NOT_CONFIGURED") {
        return NextResponse.json(
          {
            success: false,
            error: "EMAIL_NOT_CONFIGURED",
            message:
              "The server email service is awaiting production API key configuration (RESEND_API_KEY). Your message was validated successfully.",
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: delivery.error || "DELIVERY_ERROR",
          message: delivery.message || "Failed to deliver email. Please try again shortly.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your message has been sent to COMMUNITY.VA.",
        messageId: delivery.messageId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Contact API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "An internal server error occurred while processing your message.",
      },
      { status: 500 }
    );
  }
}
