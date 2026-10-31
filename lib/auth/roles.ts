export type UserRole = "STUDENT" | "VOLUNTEER" | "COLLEGE" | "ADMIN";

export type ApplicationStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export function generateApplicationReference(type: "STU" | "VOL" | "COL" | "PAR"): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CVA-${type}-${timestamp}${randomNum}`;
}

export function getRoleDashboardRoute(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "VOLUNTEER":
      return "/dashboard/volunteer";
    case "COLLEGE":
      return "/dashboard/college";
    case "STUDENT":
    default:
      return "/dashboard/student";
  }
}
