// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

type AgentType = 'CAFE' | 'BAR';

interface ChatRequest {
  message: string;
  agentType: AgentType;
}

interface UserBalance {
  tea: number;
  drink: number;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const initialBalance: UserBalance = {
  tea: 10,
  drink: 10,
};

const getPrompt = (agentType: AgentType) => {
  switch (agentType) {
    case 'CAFE':
      return `You are a helpful AI assistant in a cafe. Respond concisely. Your responses should be friendly and helpful.`;
    case 'BAR':
      return `You are a helpful AI assistant in a bar. Respond concisely, and with a slightly more edgy tone.`;
    default:
      return `You are a default AI assistant. Respond concisely.`;
  }
};

const deductBalance = (agentType: AgentType, currentBalance: UserBalance): UserBalance | null => {
  if (agentType === 'CAFE') {
    if (currentBalance.tea > 0) {
      return { ...currentBalance, tea: currentBalance.tea - 1 };
    } else {
      return null; // Insufficient tea
    }
  } else if (agentType === 'BAR') {
    if (currentBalance.drink > 0) {
      return { ...currentBalance, drink: currentBalance.drink - 1 };
    } else {
      return null; // Insufficient drink
    }
  }
  return null; // Invalid agent type
};



export async function POST(req: Request) {
  try {
    const { message, agentType } = (await req.json()) as ChatRequest;

    if (!message || !agentType) {
      return NextResponse.json({ error: 'Missing message or agentType' }, { status: 400 });
    }

    const prompt = getPrompt(agentType);

    let newBalance: UserBalance | null = deductBalance(agentType, initialBalance);

    if (!newBalance) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 });
    }
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }, { role: "user", content: message }],
      model: "gpt-3.5-turbo",
    });

    const aiResponse = completion.choices[0]?.message?.content || 'No response from AI.';

    return NextResponse.json({ response: aiResponse }, { status: 200 });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}