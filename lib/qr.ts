import QRCode from "qrcode";
import crypto from "crypto";

/**
 * Generate a cryptographically secure, unpredictable QR token.
 * Example: cva_qr_9f83a2...
 */
export function generateQrVerificationToken(): string {
  const randomBytes = crypto.randomBytes(24).toString("hex");
  return `cva_qr_${randomBytes}`;
}

/**
 * Mask / hash the token for safe storage in scan logs.
 * Raw tokens must NEVER be stored in audit logs.
 */
export function hashQrToken(token: string): string {
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  return `sha256:${hash.slice(0, 16)}...${hash.slice(-8)}`;
}

/**
 * Generate PNG Buffer of the QR code for email attachments or direct downloads.
 */
export async function generateQrBuffer(data: string): Promise<Buffer> {
  return await QRCode.toBuffer(data, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 320,
    color: {
      dark: "#111111",
      light: "#FFFFFF",
    },
  });
}

/**
 * Generate Data URL (base64) of the QR code for inline web & email rendering.
 */
export async function generateQrDataUrl(data: string): Promise<string> {
  return await QRCode.toDataURL(data, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 320,
    color: {
      dark: "#111111",
      light: "#FFFFFF",
    },
  });
}
