export interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  honeypot?: string; // Hidden spam prevention trap
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: ContactFormData;
}

// Sanitize strings to prevent HTML injection and normalize whitespace
export function sanitizeString(input: string): string {
  if (!input) return "";
  return input
    .replace(/[<>]/g, "") // Strip raw bracket tags
    .trim();
}

export function validateContactForm(data: Partial<ContactFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  const fullName = sanitizeString(data.fullName || "");
  const email = sanitizeString(data.email || "");
  const phone = data.phone ? sanitizeString(data.phone) : "";
  const subject = sanitizeString(data.subject || "");
  const message = sanitizeString(data.message || "");
  const honeypot = data.honeypot ? sanitizeString(data.honeypot) : "";

  // Check honeypot (bots that fill hidden fields get silently rejected or blocked)
  if (honeypot.length > 0) {
    errors.bot = "Spam detected";
  }

  // Full Name validation
  if (!fullName) {
    errors.fullName = "Full name is required.";
  } else if (fullName.length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  } else if (fullName.length > 100) {
    errors.fullName = "Full name must not exceed 100 characters.";
  }

  // Email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email) {
    errors.email = "Email address is required.";
  } else if (!emailRegex.test(email)) {
    errors.email = "Please provide a valid email address.";
  } else if (email.length > 150) {
    errors.email = "Email address is too long.";
  }

  // Phone validation (Optional)
  if (phone) {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
    if (!phoneRegex.test(phone)) {
      errors.phone = "Please enter a valid phone number or leave blank.";
    }
  }

  // Subject validation
  if (!subject) {
    errors.subject = "Subject is required.";
  } else if (subject.length < 3) {
    errors.subject = "Subject must be at least 3 characters.";
  } else if (subject.length > 150) {
    errors.subject = "Subject must not exceed 150 characters.";
  }

  // Message validation
  if (!message) {
    errors.message = "Message is required.";
  } else if (message.length < 10) {
    errors.message = "Message must be at least 10 characters.";
  } else if (message.length > 3000) {
    errors.message = "Message cannot exceed 3,000 characters.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      fullName,
      email,
      phone,
      subject,
      message,
    },
  };
}
