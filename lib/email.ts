import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const recipientEmail = process.env.CONTACT_EMAIL || "community.va@gmail.com";

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  message?: string;
}

function getResendClient() {
  if (!resendApiKey || resendApiKey.trim() === "" || resendApiKey.includes("your_resend_api_key")) {
    return null;
  }
  return new Resend(resendApiKey);
}

function baseEmailWrapper(title: string, badge: string, contentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5F5F3; margin: 0; padding: 24px; color: #111111; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E2E2DF; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
          .header { background: #111111; padding: 28px 32px; color: #ffffff; }
          .logo-text { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .accent-blue { color: #1461C5; }
          .accent-red { color: #ED2424; }
          .tagline { font-size: 11px; color: #777777; margin-top: 4px; text-transform: uppercase; letter-spacing: 1.5px; }
          .content { padding: 32px; }
          .badge { display: inline-block; padding: 5px 12px; background: #EEF4FC; color: #1461C5; font-size: 11px; font-weight: 700; border-radius: 9999px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
          .badge-red { background: #FDEAEA; color: #ED2424; }
          .title { font-size: 20px; font-weight: 800; color: #111111; margin-bottom: 12px; }
          .field { margin-bottom: 16px; border-bottom: 1px solid #F0F0EE; padding-bottom: 12px; }
          .label { font-size: 11px; text-transform: uppercase; color: #777777; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
          .value { font-size: 15px; color: #111111; font-weight: 500; line-height: 1.5; }
          .callout { background: #F5F5F3; border-left: 3px solid #1461C5; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 14px; line-height: 1.6; }
          .footer { background: #F5F5F3; padding: 20px 32px; font-size: 12px; color: #777777; text-align: center; border-top: 1px solid #E2E2DF; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-text">COMM<span class="accent-blue">UNITY</span><span class="accent-red">.VA</span></div>
            <div class="tagline">Connecting People • Creating Opportunities — Hyderabad</div>
          </div>
          <div class="content">
            <div class="badge">${badge}</div>
            <div class="title">${title}</div>
            ${contentHtml}
          </div>
          <div class="footer">
            COMMUNITY.VA Official Portal • Hyderabad, Telangana, India<br/>
            Contact: ${recipientEmail}
          </div>
        </div>
      </body>
    </html>
  `;
}

// 1. Contact Notification
export async function sendContactNotification(data: {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<EmailResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[Email Notification] Resend key not set. Contact inquiry logged:", data);
    return { success: true, message: "Logged locally (Resend key pending in production)." };
  }

  const content = `
    <div class="field"><div class="label">From</div><div class="value">${data.fullName} (${data.email})</div></div>
    ${data.phone ? `<div class="field"><div class="label">Phone</div><div class="value">${data.phone}</div></div>` : ""}
    <div class="field"><div class="label">Subject</div><div class="value">${data.subject}</div></div>
    <div class="callout">${data.message}</div>
  `;

  try {
    const { data: res, error } = await resend.emails.send({
      from: "COMMUNITY.VA Portal <onboarding@resend.dev>",
      to: [recipientEmail],
      replyTo: data.email,
      subject: `New Contact Enquiry — ${data.subject}`,
      html: baseEmailWrapper("New Contact Form Message", "Official Contact Portal", content),
    });
    if (error) return { success: false, error: error.message };
    return { success: true, messageId: res?.id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Delivery failed" };
  }
}

// 2. Application Received Notification (Staff & Applicant)
export async function sendApplicationReceivedEmail(params: {
  type: "STUDENT" | "VOLUNTEER" | "COLLEGE" | "PARTNER";
  fullName: string;
  applicantEmail: string;
  reference: string;
  institutionOrOrg?: string;
}): Promise<EmailResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(`[Application Email] Resend key pending. Application received for ${params.fullName} (${params.reference})`);
    return { success: true, message: "Logged locally." };
  }

  const content = `
    <p>Hello <strong>${params.fullName}</strong>,</p>
    <p>Thank you for submitting your application to <strong>COMMUNITY.VA</strong>. Your submission has been securely registered in our system.</p>
    <div class="callout">
      <strong>Application Reference:</strong> ${params.reference}<br/>
      <strong>Category:</strong> ${params.type}<br/>
      <strong>Status:</strong> PENDING REVIEW
    </div>
    <p>Our student leadership team reviews all incoming submissions. You can log into your account dashboard at any time to monitor your application progress.</p>
  `;

  try {
    // Send to applicant
    await resend.emails.send({
      from: "COMMUNITY.VA Team <onboarding@resend.dev>",
      to: [params.applicantEmail],
      subject: `Application Received (${params.reference}) — COMMUNITY.VA`,
      html: baseEmailWrapper("Application Successfully Received", "Application Confirmation", content),
    });

    // Also send alert to official inbox
    await resend.emails.send({
      from: "COMMUNITY.VA System <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `New ${params.type} Application — ${params.fullName} (${params.reference})`,
      html: baseEmailWrapper(
        `New ${params.type} Application Submitted`,
        "Admin Alert",
        `<p>Applicant: <strong>${params.fullName}</strong> (${params.applicantEmail})</p><p>Reference: <strong>${params.reference}</strong></p><p>Institution: ${params.institutionOrOrg || "N/A"}</p>`
      ),
    });

    return { success: true };
  } catch (err) {
    console.error("[Email Error]", err);
    return { success: false };
  }
}

// 3. Volunteer Approval / Rejection Emails
export async function sendVolunteerStatusEmail(params: {
  fullName: string;
  email: string;
  reference: string;
  status: "APPROVED" | "REJECTED";
  assignedDivision?: string;
  rejectionReason?: string;
}): Promise<EmailResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(`[Volunteer Status Email] ${params.status} for ${params.email} logged.`);
    return { success: true };
  }

  const isApproved = params.status === "APPROVED";
  const title = isApproved
    ? "Welcome to the COMMUNITY.VA Volunteer Team!"
    : "COMMUNITY.VA Volunteer Application Update";
  const badge = isApproved ? "Application Approved" : "Application Update";

  const content = isApproved
    ? `
      <p>Dear <strong>${params.fullName}</strong>,</p>
      <p>Congratulations! We are thrilled to inform you that your volunteer application for <strong>COMMUNITY.VA</strong> has been officially approved.</p>
      <div class="callout">
        <strong>Status:</strong> APPROVED<br/>
        <strong>Assigned Division:</strong> ${params.assignedDivision || "Core Volunteer Division"}<br/>
        <strong>Application Reference:</strong> ${params.reference}
      </div>
      <p>Please log in to your volunteer dashboard to view upcoming briefings, community announcements, and orientation details.</p>
    `
    : `
      <p>Dear <strong>${params.fullName}</strong>,</p>
      <p>Thank you for taking the time to apply to join the COMMUNITY.VA volunteer team. After careful review of our current operational cohorts and division capacity, we are unable to accept your application at this time.</p>
      ${params.rejectionReason ? `<div class="callout"><strong>Feedback:</strong> ${params.rejectionReason}</div>` : ""}
      <p>We deeply appreciate your passion and invite you to continue participating in our hackathons, open workshops, cultural sessions, and community sports leagues.</p>
    `;

  try {
    await resend.emails.send({
      from: "COMMUNITY.VA Leadership <onboarding@resend.dev>",
      to: [params.email],
      subject: isApproved
        ? `Volunteer Application Approved — COMMUNITY.VA`
        : `Volunteer Application Update — COMMUNITY.VA`,
      html: baseEmailWrapper(title, badge, content),
    });
    return { success: true };
  } catch (err) {
    console.error("[Status Email Error]", err);
    return { success: false };
  }
}

// 4. College Approval / Rejection Emails
export async function sendCollegeStatusEmail(params: {
  institutionName: string;
  contactPerson: string;
  email: string;
  reference: string;
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}): Promise<EmailResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(`[College Status Email] ${params.status} for ${params.institutionName} logged.`);
    return { success: true };
  }

  const isApproved = params.status === "APPROVED";
  const title = isApproved
    ? "College Registration Approved by COMMUNITY.VA"
    : "COMMUNITY.VA College Registration Update";
  const badge = isApproved ? "Institution Verified" : "Registration Update";

  const content = isApproved
    ? `
      <p>Dear <strong>${params.contactPerson}</strong>,</p>
      <p>We are delighted to confirm that <strong>${params.institutionName}</strong> has been officially verified and approved as a participating institution with COMMUNITY.VA.</p>
      <div class="callout">
        <strong>Verification Status:</strong> APPROVED<br/>
        <strong>Institutional Reference:</strong> ${params.reference}
      </div>
      <p>Our campus partnerships lead will be in touch with you shortly to discuss upcoming hackathon hosting, technical workshops, and student chapter initiatives.</p>
    `
    : `
      <p>Dear <strong>${params.contactPerson}</strong>,</p>
      <p>Thank you for registering <strong>${params.institutionName}</strong> with COMMUNITY.VA. Following administrative review, we are unable to approve this institutional registration at this stage.</p>
      ${params.rejectionReason ? `<div class="callout"><strong>Administrative Note:</strong> ${params.rejectionReason}</div>` : ""}
      <p>If you have any questions or wish to provide updated verification details, please reply directly to this email.</p>
    `;

  try {
    await resend.emails.send({
      from: "COMMUNITY.VA Partnerships <onboarding@resend.dev>",
      to: [params.email],
      subject: isApproved
        ? `College Verification Approved — COMMUNITY.VA`
        : `College Verification Update — COMMUNITY.VA`,
      html: baseEmailWrapper(title, badge, content),
    });
    return { success: true };
  } catch (err) {
    console.error("[College Status Email Error]", err);
    return { success: false };
  }
}
