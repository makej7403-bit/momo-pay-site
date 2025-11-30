// pages/api/notify-admin.js
import sendgrid from "@sendgrid/mail";
import Twilio from "twilio";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { orderId, receiptUrl, productTitle, buyerEmail, phone } = req.body;

  // optional lightweight secret check
  if (process.env.NOTIFY_SECRET && req.headers['x-notify-secret'] !== process.env.NOTIFY_SECRET) {
    // not required but recommended to set in Vercel and supply header from client if you want guard
    // we allow without secret for simplicity
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    // Send email via SendGrid
    if (process.env.SENDGRID_API_KEY && adminEmail) {
      sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: adminEmail,
        from: process.env.SENDGRID_FROM || adminEmail,
        subject: `New receipt uploaded - Order ${orderId}`,
        html: `<p>Order: <strong>${orderId}</strong></p>
               <p>Product: <strong>${productTitle}</strong></p>
               <p>Buyer email: ${buyerEmail || 'N/A'}</p>
               <p>Phone: ${phone || 'N/A'}</p>
               <p>Receipt: <a href="${receiptUrl}">View Receipt</a></p>`
      };
      await sendgrid.send(msg);
    }

    // Send SMS via Twilio (optional)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM && process.env.ADMIN_PHONE) {
      const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const sms = `New receipt: order ${orderId}. Product: ${productTitle}. Receipt: ${receiptUrl}`;
      await client.messages.create({ from: process.env.TWILIO_FROM, to: process.env.ADMIN_PHONE, body: sms });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('notify error', e);
    return res.status(500).json({ error: 'notify failed' });
  }
}
