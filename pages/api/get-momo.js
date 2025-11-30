// pages/api/get-momo.js
export default function handler(req, res) {
  const momo = process.env.MOMO_OWNER_NUMBER || null;
  if (!momo) return res.status(404).json({ error: "MoMo not configured" });
  // you could return a masked number if desired
  return res.status(200).json({ momo });
}
