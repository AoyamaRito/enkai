import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

type PaymentType = 'tea' | 'drink';

interface RequestBody {
  amount: number;
  type: PaymentType;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { amount, type } = body;

    if (!amount || !type) {
      return NextResponse.json({ error: 'Missing amount or type' }, { status: 400 });
    }

    const formattedAmount = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: formattedAmount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        type: type,
      }
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}