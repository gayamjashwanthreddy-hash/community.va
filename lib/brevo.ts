import { createAdminClient } from "@/lib/supabase/admin";
import { generateQrBuffer, generateQrDataUrl } from "./qr";
import { OFFICIAL_COMMUNITY_EMAIL } from "@/lib/constants";

const BREVO_API_KEY = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || process.env.CONTACT_EMAIL || OFFICIAL_COMMUNITY_EMAIL;
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

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface BrevoTeamMember {
  name: string;
  email?: string | null;
  phone?: string | null;
  college?: string | null;
  branch?: string | null;
  year?: string | null;
  isLeader?: boolean;
  qrToken?: string | null;
}

export interface BrevoTeamDetails {
  teamName: string;
  teamRegistrationId: string;
  teamLeaderName: string;
  teamLeaderEmail?: string | null;
  teamLeaderPhone?: string | null;
  teamSize: number;
  members: BrevoTeamMember[];
}

/**
 * Dynamically builds the dedicated TEAM DETAILS HTML block for emails.
 * Only rendered when registration is a team registration.
 */
export function buildTeamDetailsSectionHtml(
  teamDetails: BrevoTeamDetails,
  options: { hidePrivateContacts?: boolean } = {}
): string {
  if (!teamDetails || !teamDetails.teamName) return "";

  const memberRows = (teamDetails.members || []).map((member, idx) => {
    const extraDetails = [member.college, member.branch, member.year].filter(Boolean).join(" • ");
    const showContact = !options.hidePrivateContacts;

    return `
      <tr style="border-bottom: 1px solid #EAEAEA; ${idx % 2 === 1 ? 'background-color: #FAFAFA;' : 'background-color: #FFFFFF;'}">
        <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #666666; text-align: center; vertical-align: top;">${idx + 1}</td>
        <td style="padding: 10px 12px; color: #111111; vertical-align: top;">
          <div style="font-weight: 700; font-size: 13px;">
            ${escapeHtml(member.name)}
            ${member.isLeader ? ' <span style="font-size: 9px; background: #EEF4FC; color: #1461C5; border: 1px solid #C9DCF8; padding: 2px 6px; border-radius: 9999px; font-weight: 800; text-transform: uppercase; font-family: monospace; margin-left: 4px;">Leader</span>' : ''}
          </div>
          ${extraDetails ? `<div style="font-size: 11px; color: #777777; margin-top: 3px;">${escapeHtml(extraDetails)}</div>` : ''}
        </td>
        <td style="padding: 10px 12px; color: #444444; font-size: 12px; font-family: monospace; vertical-align: top;">
          ${member.email ? `<div><a href="mailto:${escapeHtml(member.email)}" style="color: #1461C5; text-decoration: none;">${escapeHtml(member.email)}</a></div>` : '<div style="color: #999999;">—</div>'}
          ${showContact && member.phone ? `<div style="font-size: 11px; color: #777777; margin-top: 3px;">${escapeHtml(member.phone)}</div>` : ''}
        </td>
      </tr>
    `;
  }).join("");

  return `
    <div style="margin: 24px 0; background: #FAF9F6; border: 1px solid #E2E2DF; border-radius: 12px; overflow: hidden;">
      <div style="background: #111111; color: #ffffff; padding: 12px 18px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; font-family: monospace;">
        ★ TEAM DETAILS
      </div>
      <div style="padding: 18px 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 18px;">
          <tr>
            <td style="padding: 5px 0; color: #777777; width: 160px; font-weight: 700; text-transform: uppercase; font-size: 11px; font-family: monospace;">Team Name:</td>
            <td style="padding: 5px 0; color: #111111; font-weight: 800; font-size: 15px;">${escapeHtml(teamDetails.teamName)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #777777; font-weight: 700; text-transform: uppercase; font-size: 11px; font-family: monospace;">Team Registration ID:</td>
            <td style="padding: 5px 0; color: #1461C5; font-family: monospace; font-weight: 700;">${escapeHtml(teamDetails.teamRegistrationId)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #777777; font-weight: 700; text-transform: uppercase; font-size: 11px; font-family: monospace;">Team Leader:</td>
            <td style="padding: 5px 0; color: #111111; font-weight: 700;">${escapeHtml(teamDetails.teamLeaderName)}</td>
          </tr>
          ${teamDetails.teamLeaderEmail ? `
          <tr>
            <td style="padding: 5px 0; color: #777777; font-weight: 700; text-transform: uppercase; font-size: 11px; font-family: monospace;">Leader Contact:</td>
            <td style="padding: 5px 0; color: #333333; font-family: monospace;">${escapeHtml(teamDetails.teamLeaderEmail)}${teamDetails.teamLeaderPhone && !options?.hidePrivateContacts ? ` • ${escapeHtml(teamDetails.teamLeaderPhone)}` : ''}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 5px 0; color: #777777; font-weight: 700; text-transform: uppercase; font-size: 11px; font-family: monospace;">Total Team Size:</td>
            <td style="padding: 5px 0; color: #111111; font-weight: 700;">${teamDetails.teamSize} ${teamDetails.teamSize === 1 ? 'Member' : 'Members'}</td>
          </tr>
        </table>

        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #777777; letter-spacing: 0.5px; font-family: monospace; margin-bottom: 8px;">
          Registered Team Roster
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #E2E2DF; border-radius: 8px; overflow: hidden; background: #ffffff;">
          <thead>
            <tr style="background-color: #F0F0EE; border-bottom: 2px solid #E2E2DF; font-size: 11px; text-transform: uppercase; font-family: monospace; color: #555555;">
              <th style="padding: 8px 10px; width: 36px; text-align: center;">No.</th>
              <th style="padding: 8px 12px; text-align: left;">Member Name</th>
              <th style="padding: 8px 12px; text-align: left;">Email / Details</th>
            </tr>
          </thead>
          <tbody>
            ${memberRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Send Confirmed Event Entry QR Pass Email (supports individual and team registrations)
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
  isTeamRegistration = false,
  teamDetails,
  isMemberSpecificPass = false,
}: {
  recipientEmail: string;
  recipientName: string;
  eventTitle: string;
  eventVenue: string;
  eventStart: string;
  eventEnd: string;
  registrationNumber: string;
  registrationId: string;
  qrToken?: string;
  isPaid: boolean;
  feeAmount?: number;
  isTeamRegistration?: boolean;
  teamDetails?: BrevoTeamDetails;
  isMemberSpecificPass?: boolean;
}): Promise<BrevoResponse> {
  let qrBase64 = "";
  let qrDataUrl = "";

  if (qrToken) {
    const qrBuffer = await generateQrBuffer(qrToken);
    qrBase64 = qrBuffer.toString("base64");
    qrDataUrl = `data:image/png;base64,${qrBase64}`;
  }

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

  const greeting = isTeamRegistration && teamDetails
    ? `Hello <strong>${recipientName}</strong>, your team <strong>"${escapeHtml(teamDetails.teamName)}"</strong> is officially confirmed for <strong>${eventTitle}</strong>.`
    : `Hello <strong>${recipientName}</strong>, your spot is confirmed for <strong>${eventTitle}</strong>.`;

  const instructionsText = isTeamRegistration
    ? (isMemberSpecificPass
        ? `This is your personalized team entry pass for "${escapeHtml(teamDetails?.teamName || "your team")}". Present this QR code at the entrance check-in desk.`
        : `This is your official team entry pass for "${escapeHtml(teamDetails?.teamName || "your team")}". Keep this handy for group verification at the check-in desk.`)
    : "Please keep this email handy on your smartphone or carry a printed copy. The QR code will be scanned at the entrance.";

  const teamSectionHtml = (isTeamRegistration && teamDetails) 
    ? buildTeamDetailsSectionHtml(teamDetails, { hidePrivateContacts: false }) 
    : "";

  const bodyHtml = `
    <p style="font-size: 15px; line-height: 1.6; color: #333333; margin-bottom: 24px;">
      ${greeting} Below is your official event entry QR pass.
    </p>

    <div class="field">
      <div class="label">Event Name</div>
      <div class="val">${eventTitle}</div>
    </div>

    <div class="field">
      <div class="label">${isTeamRegistration ? "Team Registration ID" : "Registration ID"}</div>
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
        <div class="val">${isTeamRegistration ? "Team Registration (Complimentary)" : "Complimentary / Free Entry"}</div>
      </div>
    `
    }

    ${teamSectionHtml}
  `;

  const subject = isTeamRegistration && teamDetails
    ? `Your Team Entry Pass — ${eventTitle} [${teamDetails.teamName}] [${registrationNumber}]`
    : `Your Event Entry Pass — ${eventTitle} [${registrationNumber}]`;

  const attachments: BrevoAttachment[] = [];
  if (qrBase64) {
    attachments.push({
      name: `Entry-Pass-${registrationNumber}.png`,
      content: qrBase64,
    });
  }

  return await sendBrevoEmail({
    toEmail: recipientEmail,
    toName: recipientName,
    subject,
    htmlContent: buildBrandedEmailHtml({
      badge: isTeamRegistration ? "Official Team Pass" : "Official Entry Pass",
      badgeType: "green",
      title: eventTitle,
      preheader: `Your entry pass for ${eventTitle} is confirmed. Registration ID: ${registrationNumber}`,
      bodyHtml,
      qrCodeDataUrl: qrDataUrl || undefined,
      qrInstructions: instructionsText,
    }),
    attachments,
    registrationId,
    notificationType: isTeamRegistration ? "TEAM_EVENT_QR_PASS" : "EVENT_QR_PASS",
  });
}

/**
 * Send Payment Submitted Email (supports individual and team registrations)
 */
export async function sendPaymentSubmittedEmail({
  recipientEmail,
  recipientName,
  eventTitle,
  registrationNumber,
  registrationId,
  paymentReference,
  isTeamRegistration = false,
  teamDetails,
}: {
  recipientEmail: string;
  recipientName: string;
  eventTitle: string;
  registrationNumber: string;
  registrationId: string;
  paymentReference?: string;
  isTeamRegistration?: boolean;
  teamDetails?: BrevoTeamDetails;
}): Promise<BrevoResponse> {
  const greeting = isTeamRegistration && teamDetails
    ? `Hello <strong>${recipientName}</strong>, thank you for submitting the registration and payment proof for team <strong>"${escapeHtml(teamDetails.teamName)}"</strong> for <strong>${eventTitle}</strong>.`
    : `Hello <strong>${recipientName}</strong>, thank you for submitting your payment proof for <strong>${eventTitle}</strong>.`;

  const teamSectionHtml = (isTeamRegistration && teamDetails) 
    ? buildTeamDetailsSectionHtml(teamDetails, { hidePrivateContacts: false }) 
    : "";

  const bodyHtml = `
    <p style="font-size: 15px; line-height: 1.6; color: #333333; margin-bottom: 24px;">
      ${greeting}
    </p>

    <div class="field">
      <div class="label">${isTeamRegistration ? "Team Registration ID" : "Registration ID"}</div>
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
      Our finance and admin team is reviewing your transaction screenshot. Once verified, active entry QR pass(es) will be issued and emailed to ${isTeamRegistration ? "you and your registered team members" : "you"} automatically.
    </div>

    ${teamSectionHtml}
  `;

  const subject = isTeamRegistration && teamDetails
    ? `Payment Verification Pending — ${eventTitle} [Team: ${teamDetails.teamName}] [${registrationNumber}]`
    : `Payment Verification Pending — ${eventTitle} [${registrationNumber}]`;

  return await sendBrevoEmail({
    toEmail: recipientEmail,
    toName: recipientName,
    subject,
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

/**
 * High-level orchestrator: Dispatches transactional registration emails via Brevo
 * supporting both individual and team registrations with dynamic member roster rendering,
 * deduplication, and conditional delivery.
 */
export async function dispatchRegistrationEmails({
  event,
  registration,
  teamMembers = [],
  isPaymentVerified = false,
  paymentReference,
}: {
  event: {
    id: string;
    title: string;
    venue: string;
    event_start: string;
    event_end: string;
    is_paid: boolean;
    fee_amount?: number;
    team_checkin_mode?: "TEAM" | "INDIVIDUAL";
    notify_all_team_members?: boolean;
  };
  registration: {
    id: string;
    registration_number: string;
    participant_name: string;
    participant_email: string;
    participant_phone: string;
    qr_token?: string;
    is_team_registration?: boolean;
    team_name?: string | null;
  };
  teamMembers?: Array<{
    id?: string;
    member_name: string;
    email?: string | null;
    phone?: string | null;
    college?: string | null;
    branch?: string | null;
    year?: string | null;
    is_leader?: boolean;
    qr_token?: string | null;
  }>;
  isPaymentVerified?: boolean;
  paymentReference?: string;
}): Promise<{ totalSent: number; errors: string[] }> {
  const isTeam = Boolean(
    registration.is_team_registration ||
    registration.team_name ||
    (teamMembers && teamMembers.length > 0)
  );

  let teamDetails: BrevoTeamDetails | undefined = undefined;

  if (isTeam) {
    // Build canonical member list starting with team leader
    const roster: BrevoTeamMember[] = [];

    // Add leader
    roster.push({
      name: registration.participant_name,
      email: registration.participant_email,
      phone: registration.participant_phone,
      isLeader: true,
      qrToken: registration.qr_token,
    });

    // Add other members (filter out leader duplicate if present)
    for (const m of teamMembers) {
      const isLeaderDup = 
        m.email && m.email.toLowerCase() === registration.participant_email.toLowerCase();
      if (!isLeaderDup) {
        roster.push({
          name: m.member_name,
          email: m.email || null,
          phone: m.phone || null,
          college: m.college || null,
          branch: m.branch || null,
          year: m.year || null,
          isLeader: Boolean(m.is_leader),
          qrToken: m.qr_token || null,
        });
      }
    }

    teamDetails = {
      teamName: registration.team_name || `${registration.participant_name}'s Team`,
      teamRegistrationId: registration.registration_number,
      teamLeaderName: registration.participant_name,
      teamLeaderEmail: registration.participant_email,
      teamLeaderPhone: registration.participant_phone,
      teamSize: roster.length,
      members: roster,
    };
  }

  const sentEmails = new Set<string>();
  const errors: string[] = [];

  const canReceivePass = !event.is_paid || isPaymentVerified;

  // 1. Send to Team Leader / Main Participant
  try {
    if (canReceivePass) {
      await sendEventConfirmedPassEmail({
        recipientEmail: registration.participant_email,
        recipientName: registration.participant_name,
        eventTitle: event.title,
        eventVenue: event.venue,
        eventStart: event.event_start,
        eventEnd: event.event_end,
        registrationNumber: registration.registration_number,
        registrationId: registration.id,
        qrToken: registration.qr_token,
        isPaid: event.is_paid,
        feeAmount: event.fee_amount,
        isTeamRegistration: isTeam,
        teamDetails,
        isMemberSpecificPass: false,
      });
    } else {
      await sendPaymentSubmittedEmail({
        recipientEmail: registration.participant_email,
        recipientName: registration.participant_name,
        eventTitle: event.title,
        registrationNumber: registration.registration_number,
        registrationId: registration.id,
        paymentReference,
        isTeamRegistration: isTeam,
        teamDetails,
      });
    }
    sentEmails.add(registration.participant_email.toLowerCase());
  } catch (err: any) {
    errors.push(`Leader email failed: ${err.message || err}`);
  }

  // 2. If Team Registration & member notifications enabled, send personalized emails to members
  if (isTeam && event.notify_all_team_members !== false && teamMembers.length > 0) {
    for (const member of teamMembers) {
      if (!member.email || !member.email.trim()) continue;
      const cleanEmail = member.email.trim().toLowerCase();

      // Prevent duplicate emails
      if (sentEmails.has(cleanEmail)) continue;

      try {
        if (canReceivePass) {
          const passQrToken = (event.team_checkin_mode === "INDIVIDUAL" && member.qr_token)
            ? member.qr_token
            : registration.qr_token;

          await sendEventConfirmedPassEmail({
            recipientEmail: member.email,
            recipientName: member.member_name,
            eventTitle: event.title,
            eventVenue: event.venue,
            eventStart: event.event_start,
            eventEnd: event.event_end,
            registrationNumber: registration.registration_number,
            registrationId: registration.id,
            qrToken: passQrToken,
            isPaid: event.is_paid,
            feeAmount: event.fee_amount,
            isTeamRegistration: true,
            teamDetails,
            isMemberSpecificPass: event.team_checkin_mode === "INDIVIDUAL",
          });
        } else {
          await sendPaymentSubmittedEmail({
            recipientEmail: member.email,
            recipientName: member.member_name,
            eventTitle: event.title,
            registrationNumber: registration.registration_number,
            registrationId: registration.id,
            paymentReference,
            isTeamRegistration: true,
            teamDetails,
          });
        }
        sentEmails.add(cleanEmail);
      } catch (err: any) {
        errors.push(`Member email (${member.email}) failed: ${err.message || err}`);
      }
    }
  }

  return { totalSent: sentEmails.size, errors };
}
