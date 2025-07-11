import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@libsql/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

type DrinkType = 'tea' | 'coffee';

type UserBalance = {
  tea: number;
  coffee: number;
};

async function updateDrinkBalance(userId: string, drinkType: DrinkType, amount: number) {
  try {
    if (!process.env.TURSO_DB_URL || !process.env.TURSO_DB_TOKEN) {
      console.error('Turso DB URL or Token not found');
      return false;
    }

    const client = createClient({
      url: process.env.TURSO_DB_URL,
      authToken: process.env.TURSO_DB_TOKEN,
    });

    const getExistingBalance = async (userId: string): Promise<UserBalance | null> => {
      const result = await client.execute({
        sql: 'SELECT tea, coffee FROM balances WHERE user_id = ?',
        args: [userId],
      });

      if (result.rows.length === 0) {
        return null;
      }

      return {
        tea: result.rows[0].tea as number,
        coffee: result.rows[0].coffee as number,
      };
    };

    const existingBalance = await getExistingBalance(userId);

    if (!existingBalance) {
      await client.execute({
        sql: 'INSERT INTO balances (user_id, tea, coffee) VALUES (?, ?, ?)',
        args: [userId, drinkType === 'tea' ? amount : 0, drinkType === 'coffee' ? amount : 0],
      });
    } else {
      const updatedTea = drinkType === 'tea' ? existingBalance.tea + amount : existingBalance.tea;
      const updatedCoffee = drinkType === 'coffee' ? existingBalance.coffee + amount : existingBalance.coffee;

      await client.execute({
        sql: 'UPDATE balances SET tea = ?, coffee = ? WHERE user_id = ?',
        args: [updatedTea, updatedCoffee, userId],
      });
    }

    return true;
  } catch (error) {
    console.error('Error updating drink balance:', error);
    return false;
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return new NextResponse('Missing stripe signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  } catch (err: any) {
    console.log('Webhook signature verification failed.', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const userId = paymentIntent.metadata.userId;
      const drinkType = paymentIntent.metadata.drinkType as DrinkType;
      const amount = parseInt(paymentIntent.metadata.amount || '0');

      if (!userId || !drinkType || !amount) {
        console.error('Missing metadata in Payment Intent');
        return new NextResponse('Missing metadata in Payment Intent', { status: 400 });
      }

      const updateSuccess = await updateDrinkBalance(userId, drinkType, amount);

      if (!updateSuccess) {
        console.error('Failed to update drink balance');
        return new NextResponse('Failed to update drink balance', { status: 500 });
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}