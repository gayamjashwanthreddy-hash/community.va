import { createAdminClient } from "@/lib/supabase/admin";
import { generateQrBuffer, generateQrDataUrl } from "./qr";

const BREVO_API_KEY = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || process.env.CONTACT_EMAIL || "community.va@gmail.com";
const SENDER_NAME = "COMMUNITY.VA Official";
const DAILY_LIMIT = 300;

export interface BrevoAttachment {
  name: string;
  content: string; // base64 string
}

export interface SendBrevoEmailParams {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
  attachments?: BrevoAttachment[];
  registrationId?: string;
  notificationType?: string;
}

export interface BrevoResponse {
  success: boolean;
  messageId?: string;
  queued?: boolean;
  error?: string;
}

/**
 * Base responsive email template complying with COMMUNITY.VA brand guidelines.
 */
export function buildBrandedEmailHtml({
  badge,
  badgeType = "blue",
  title,
  preheader,
  bodyHtml,
  qrCodeDataUrl,
  qrInstructions,
}: {
  badge: string;
  badgeType?: "blue" | "red" | "green";
  title: string;
  preheader?: string;
  bodyHtml: string;
  qrCodeDataUrl?: string;
  qrInstructions?: string;
}): string {
  const badgeColors = {
    blue: "background-color: #EEF4FC; color: #1461C5; border: 1px solid #C9DCF8;",
    red: "background-color: #FDEAEA; color: #ED2424; border: 1px solid #FAC7C7;",
    green: "background-color: #EBF8F1; color: #0E8345; border: 1px solid #C4EDD6;",
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5F5F3; margin: 0; padding: 24px 12px; color: #111111; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E2E2DF; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background: #111111; padding: 28px 32px; color: #ffffff; text-align: left; }
    .logo-text { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
    .accent-blue { color: #1461C5; }
    .accent-red { color: #ED2424; }
    .subhead { font-size: 11px; color: #888888; margin-top: 4px; text-transform: uppercase; letter-spacing: 1.5px; font-family: monospace; }
    .body { padding: 32px; }
    .badge { display: inline-block; padding: 6px 14px; font-size: 11px; font-weight: 800; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; font-family: monospace; margin-bottom: 20px; ${badgeColors[badgeType]} }
    .title { font-size: 22px; font-weight: 800; color: #111111; margin: 0 0 16px 0; line-height: 1.3; }
    .field { margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #F0F0EE; }
    .label { font-size: 11px; text-transform: uppercase; color: #777777; font-weight: 700; letter-spacing: 0.5px; font-family: monospace; margin-bottom: 3px; }
    .val { font-size: 15px; color: #111111; font-weight: 600; line-height: 1.4; }
    .qr-box { background: #FAF9F6; border: 2px dashed #1461C5; border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0; }
    .qr-image { width: 220px; height: 220px; display: block; margin: 0 auto 12px auto; border-radius: 8px; border: 1px solid #E2E2DF; }
    .instructions { font-size: 13px; color: #444444; line-height: 1.5; margin-top: 8px; }
    .footer { background: #FAF9F6; padding: 24px 32px; font-size: 12px; color: #777777; text-align: center; border-top: 1px solid #E2E2DF; font-family: monospace; }
  </style>
</head>
<body>
  ${preheader ? `<span style="display:none;font-size:1px;color:#ffffff;line-height:1px;">${preheader}</span>` : ""}
  <div class="container">
    <div class="header">
      <div class="logo-text">COMM<span class="accent-blue">UNITY</span><span class="accent-red">.VA</span></div>
      <div class="subhead">Connecting People • Creating Opportunities — Hyderabad</div>
    </div>
    <div class="body">
      <div class="badge">${badge}</div>
      <h1 class="title">${title}</h1>
      ${bodyHtml}

      ${
        qrCodeDataUrl
          ? `
        <div class="qr-box">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #1461C5; letter-spacing: 1px; font-family: monospace; margin-bottom: 10px;">
            Official Entry Verification Pass
          </div>
          <img src="${qrCodeDataUrl}" alt="Event Entry QR Code" class="qr-image" />
          <div style="font-size: 11px; font-family: monospace; color: #666666;">
            Scan at venue entrance check-in desk
          </div>
          ${
            qrInstructions
              ? `<div class="instructions">${qrInstructions}</div>`
              : ""
          }
        </div>
      `
          : ""
      }
    </div>
    <div class="footer">
      COMMUNITY.VA Official Event Operations • Hyderabad, India<br/>
      Need support? Contact <a href="mailto:${SENDER_EMAIL}" style="color: #1461C5; text-decoration: none;">${SENDER_EMAIL}</a>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Send an email using Brevo v3 Transactional SMTP REST API.
 * Respects free plan daily quota of 300 emails.
 */
export async function sendBrevoEmail({
  toEmail,
  toName,
  subject,
  htmlContent,
  attachments = [],
  registrationId,
  notificationType = "EVENT_PASS",
}: SendBrevoEmailParams): Promise<BrevoResponse> {
  const supabase = createAdminClient();

  // 1. Check daily quota (300/day limit)
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("event_email_notifications")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString())
      .eq("delivery_status", "SENT");

    if (count !== null && count >= DAILY_LIMIT) {
      console.warn(`[Brevo Quota Exceeded] ${count}/${DAILY_LIMIT} sent today. Queueing email for ${toEmail}`);
      // Record queued notification in database
      await supabase.from("event_email_notifications").insert({
        registration_id: registrationId || null,
        notification_type: notificationType,
        recipient_email: toEmail,
        delivery_status: "QUEUED",
        last_error: "Daily quota of 300 Brevo emails reached. Queued for delivery.",
      });

      return {
        success: true,
        queued: true,
        error: "Daily Brevo allowance reached. Notification has been queued.",
      };
    }
  } catch (err) {
    console.error("[Brevo Quota Check Error]", err);
  }

  // 2. If no API key configured, log locally without crashing
  if (!BREVO_API_KEY || BREVO_API_KEY.trim() === "" || BREVO_API_KEY.includes("your_brevo_key")) {
    console.warn(`[Brevo Dev Mode] Missing BREVO_API_KEY. Simulated email to ${toEmail}: ${subject}`);
    
    // Still record in tracking table as simulated sent
    await supabase.from("event_email_notifications").insert({
      registration_id: registrationId || null,
      notification_type: notificationType,
      recipient_email: toEmail,
      delivery_status: "SENT",
      resend_message_id: "simulated_brevo_dev_mode",
      sent_at: new Date().toISOString(),
    });

    return {
      success: true,
      messageId: "simulated_brevo_dev_mode",
    };
  }

  // 3. Dispatch to Brevo REST API
  try {
    const payload: Record<string, unknown> = {
      sender: {
        name: SENDER_NAME,
        email: SENDER_EMAIL,
      },
      to: [
        {
          email: toEmail,
          name: toName || toEmail,
        },
      ],
      subject,
      htmlContent,
    };

    if (attachments.length > 0) {
      payload.attachment = attachments.map((att) => ({
        name: att.name,
        content: att.content,
      }));
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resData = await response.json();

    if (!response.ok) {
      console.error("[Brevo API Error]", resData);
      await supabase.from("event_email_notifications").insert({
        registration_id: registrationId || null,
        notification_type: notificationType,
        recipient_email: toEmail,
        delivery_status: "FAILED",
        last_error: resData.message || "Brevo delivery failed",
      });

      return {
        success: false,
        error: resData.message || "Failed to deliver via Brevo",
      };
    }

    const messageId = resData.messageId || resData.id;

    // Record successful dispatch
    await supabase.from("event_email_notifications").insert({
      registration_id: registrationId || null,
      notification_type: notificationType,
      recipient_email: toEmail,
      delivery_status: "SENT",
      resend_message_id: String(messageId),
      sent_at: new Date().toISOString(),
    });

    return {
      success: true,
      messageId: String(messageId),
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Network error contacting Brevo";
    console.error("[Brevo Exception]", err);

    await supabase.from("event_email_notifications").insert({
      registration_id: registrationId || null,
      notification_type: notificationType,
      recipient_email: toEmail,
      delivery_status: "FAILED",
      last_error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send Confirmed Event Entry QR Pass Email
 */
export async function sendEventConfirmedPassEmail({
  recipientEmail,
  recipientName,
  eventTitle,
  eventVenue,
  eventStart,
  eventEnd,
  registrationNumber,
  registrationId,
  qrToken,
  isPaid,
  feeAmount,
}: {
  recipientEmail: string;
  recipientName: string;
  eventTitle: string;
  eventVenue: string;
  eventStart: string;
  eventEnd: string;
  registrationNumber: string;
  registrationId: string;
  qrToken: string;
  isPaid: boolean;
  feeAmount?: number;
}): Promise<BrevoResponse> {
  const qrBuffer = await generateQrBuffer(qrToken);
  const qrBase64 = qrBuffer.toString("base64");
  const qrDataUrl = `data:image/png;base64,${qrBase64}`;

  const formattedDate = new Date(eventStart).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = `${new Date(eventStart).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${new Date(eventEnd).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  const bodyHtml = `
    <p style="font-size: 15px; line-height: 1.6; color: #333333; margin-bottom: 24px;">
      Hello <strong>${recipientName}</strong>, your spot is confirmed for <strong>${eventTitle}</strong>. 
      Below is your official event entry QR pass. Please present this QR code at the check-in desk upon arrival.
    </p>

    <div class="field">
      <div class="label">Event Name</div>
      <div class="val">${eventTitle}</div>
    </div>

    <div class="field">
      <div class="label">Registration ID</div>
      <div class="val" style="color: #1461C5; font-family: monospace;">${registrationNumber}</div>
    </div>

    <div class="field">
      <div class="label">Date & Time</div>
      <div class="val">${formattedDate}<br/><span style="font-size: 13px; color: #666666;">${formattedTime}</span></div>
    </div>

    <div class="field">
      <div class="label">Venue Location</div>
      <div class="val">${eventVenue}</div>
    </div>

    <div class="field">
      <div class="label">Entry Pass Status</div>
      <div class="val" style="color: #0E8345;">CONFIRMED & ACTIVE</div>
    </div>

    ${
      isPaid
        ? `
      <div class="field">
        <div class="label">Payment Verification</div>
        <div class="val" style="color: #0E8345;">VERIFIED (INR ₹${feeAmount || 0})</div>
      </div>
    `
        : `
      <div class="field">
        <div class="label">Registration Type</div>
        <div class="val">Complimentary / Free Entry</div>
      </div>
    `
    }
  `;

  return await sendBrevoEmail({
    toEmail: recipientEmail,
    toName: recipientName,
    subject: `Your Event Entry Pass — ${eventTitle} [${registrationNumber}]`,
    htmlContent: buildBrandedEmailHtml({
      badge: "Official Entry Pass",
      badgeType: "green",
      title: eventTitle,
      preheader: `Your entry pass for ${eventTitle} is confirmed. Registration ID: ${registrationNumber}`,
      bodyHtml,
      qrCodeDataUrl: qrDataUrl,
      qrInstructions:
        "Please keep this email handy on your smartphone or carry a printed copy. The QR code will be scanned once at the entrance.",
    }),
    attachments: [
      {
        name: `Entry-Pass-${registrationNumber}.png`,
        content: qrBase64,
      },
    ],
    registrationId,
    notificationType: "EVENT_QR_PASS",
  });
}

/**
 * Send Payment Submitted Email (for paid events, before admin verification)
 */
export async function sendPaymentSubmittedEmail({
  recipientEmail,
  recipientName,
  eventTitle,
  registrationNumber,
  registrationId,
  paymentReference,
}: {
  recipientEmail: string;
  recipientName: string;
  eventTitle: string;
  registrationNumber: string;
  registrationId: string;
  paymentReference?: string;
}): Promise<BrevoResponse> {
  const bodyHtml = `
    <p style="font-size: 15px; line-height: 1.6; color: #333333; margin-bottom: 24px;">
      Hello <strong>${recipientName}</strong>, thank you for submitting your payment proof for <strong>${eventTitle}</strong>.
    </p>

    <div class="field">
      <div class="label">Registration ID</div>
      <div class="val" style="font-family: monospace;">${registrationNumber}</div>
    </div>

    ${
      paymentReference
        ? `
      <div class="field">
        <div class="label">Payment Reference / UTR</div>
        <div class="val" style="font-family: monospace;">${paymentReference}</div>
      </div>
    `
        : ""
    }

    <div class="field">
      <div class="label">Verification Status</div>
      <div class="val" style="color: #D97706;">UNDER REVIEW BY ADMIN</div>
    </div>

    <div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 12px; padding: 16px; margin-top: 24px; font-size: 13px; color: #92400E; line-height: 1.5;">
      <strong>Note on Entry Eligibility:</strong><br/>
      Our finance and admin team is reviewing your transaction screenshot. Once verified, your active entry QR pass will be issued and emailed to you automatically.
    </div>
  `;

  return await sendBrevoEmail({
    toEmail: recipientEmail,
    toName: recipientName,
    subject: `Payment Verification Pending — ${eventTitle} [${registrationNumber}]`,
    htmlContent: buildBrandedEmailHtml({
      badge: "Payment Under Review",
      badgeType: "blue",
      title: "Payment Proof Received",
      preheader: `Payment proof received for ${eventTitle}. Review in progress.`,
      bodyHtml,
    }),
    registrationId,
    notificationType: "PAYMENT_PENDING",
  });
}

/**
 * Send Volunteer Application Decision Email
 */
export async function sendVolunteerDecisionEmail({
  volunteerEmail,
  volunteerName,
  eventTitle,
  decision, // 'APPROVED' | 'REJECTED'
  assignedResponsibilities = [],
  rejectionReason,
  scannerAccessGranted = false,
}: {
  volunteerEmail: string;
  volunteerName: string;
  eventTitle: string;
  decision: "APPROVED" | "REJECTED";
  assignedResponsibilities?: string[];
  rejectionReason?: string;
  scannerAccessGranted?: boolean;
}): Promise<BrevoResponse> {
  const isApproved = decision === "APPROVED";

  const bodyHtml = isApproved
    ? `
    <p style="font-size: 15px; line-height: 1.6; color: #333333; margin-bottom: 24px;">
      Congratulations <strong>${volunteerName}</strong>! Your application to volunteer for <strong>${eventTitle}</strong> has been <strong>APPROVED</strong>.
    </p>

    <div class="field">
      <div class="label">Event</div>
      <div class="val">${eventTitle}</div>
    </div>

    <div class="field">
      <div class="label">Assigned Responsibilities</div>
      <div class="val" style="color: #1461C5;">
        ${assignedResponsibilities.length > 0 ? assignedResponsibilities.join(", ") : "General Support"}
      </div>
    </div>

    ${
      scannerAccessGranted
        ? `
      <div style="background: #EEF4FC; border: 1px solid #C9DCF8; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; color: #1461C5; line-height: 1.5;">
        <strong>Scanner Authorization Granted:</strong><br/>
        You have been authorized for <strong>QR Scanning & Attendee Check-In</strong>. On event day, you can access your mobile QR scanner directly in your Volunteer Dashboard.
      </div>
    `
        : `
      <div style="background: #F5F5F3; border: 1px solid #E2E2DF; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; color: #555555; line-height: 1.5;">
        Please report to the Event Operations lead on the morning of the event for duty briefing and assignment coordination.
      </div>
    `
    }
  `
    : `
    <p style="font-size: 15px; line-height: 1.6; color: #333333; margin-bottom: 24px;">
      Hello <strong>${volunteerName}</strong>, thank you for your interest in volunteering for <strong>${eventTitle}</strong>.
    </p>

    <div class="field">
      <div class="label">Status</div>
      <div class="val" style="color: #ED2424;">NOT SELECTED / REJECTED</div>
    </div>

    ${
      rejectionReason
        ? `
      <div class="field">
        <div class="label">Feedback / Reason</div>
        <div class="val">${rejectionReason}</div>
      </div>
    `
        : ""
    }

    <p style="font-size: 14px; line-height: 1.5; color: #666666; margin-top: 20px;">
      Due to limited volunteer capacity for this event track, we could not accommodate all applications. We encourage you to participate in upcoming COMMUNITY.VA initiatives and future events.
    </p>
  `;

  return await sendBrevoEmail({
    toEmail: volunteerEmail,
    toName: volunteerName,
    subject: `Event Volunteer Application Decision — ${eventTitle}`,
    htmlContent: buildBrandedEmailHtml({
      badge: isApproved ? "Application Approved" : "Application Decision",
      badgeType: isApproved ? "green" : "red",
      title: isApproved ? "Welcome to the Event Team!" : "Application Update",
      preheader: `Volunteer application status for ${eventTitle}`,
      bodyHtml,
    }),
    notificationType: "VOLUNTEER_DECISION",
  });
}
