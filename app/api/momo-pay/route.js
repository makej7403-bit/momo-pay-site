import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  const { phone, amount } = await req.json();

  const transactionId = uuidv4();

  try {
    const res = await fetch(
      "https://api.mtn.com/v1/momocollection/requesttopay",
      {
        method: "POST",
        headers: {
          "X-Reference-Id": transactionId,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": process.env.MOMO_API_KEY,
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MOMO_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          amount: amount,
          currency: "LRD",
          externalId: "123456",
          payer: {
            partyIdType: "MSISDN",
            partyId: phone
          },
          payerMessage: "Website Payment",
          payeeNote: "Payment to site owner"
        })
      }
    );

    if (!res.ok) {
      return NextResponse.json({ message: "Payment failed" });
    }

    return NextResponse.json({
      message: "Payment request sent. Approve on your phone."
    });

  } catch (error) {
    return NextResponse.json({ message: "Server error" });
  }
}
