// utils/authGuard.js
export function isAdminUser(user) {
  // quick check by email; in production use Firestore or custom claims
  return user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
}
