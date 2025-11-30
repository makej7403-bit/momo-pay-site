// pages/api/get-momo.js
export default async function handler(req, res) {
  // This simply returns the owner MoMo number from the server env.
  // Because the env is stored in Vercel and not in GitHub, it won't be public in your repo.
  const momo = process.env.MOMO_OWNER_NUMBER || null;
  if (!momo) {
    return res.status(404).json({ error: "MoMo not configured" });
  }
  // To avoid exposing it everywhere, you might choose to return a masked version.
  // We'll return the full number so the customer can pay.
  return res.status(200).json({ momo });
}
