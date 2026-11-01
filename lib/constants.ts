// COMMUNITY.VA — Official Global Constants & Contact Information

export const OFFICIAL_COMMUNITY_EMAIL = 
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 
  process.env.BREVO_SENDER_EMAIL || 
  process.env.CONTACT_EMAIL || 
  "community.vaofficial@gmail.com";

export const OFFICIAL_COMMUNITY_NAME = "COMMUNITY.VA Official";
export const OFFICIAL_COMMUNITY_CITY = "Hyderabad, Telangana, India";
export const OFFICIAL_MAILTO_LINK = `mailto:${OFFICIAL_COMMUNITY_EMAIL}`;
