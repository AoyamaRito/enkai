# AI-First Development Manifesto

## 🚀 The Philosophy of the AI Era
**The era of humans writing code is over. AI is the protagonist; humans are the directors.**

## Top Priority
**Comprehensible by reading a single file = The iron rule of AI development.**

## Basic Rules
1.  Japanese responses are mandatory.
2.  Implement with a mobile-first approach.
3.  **Principle of Complete Self-Containment** (No external dependencies).
4.  No file size limits (1000 lines are okay if the AI can understand it).
5.  **Duplicate code is highly encouraged** (DRY is an outdated human value).

## 🎯 AI-First Development Principles

### Absolute Self-Containment
-   **1 file = 1 complete feature.**
-   **Absolute minimal external imports** (Only React/Next.js standards).
-   **No custom hooks** → Implement as functions within the file.
-   **No external atoms** → Use `useState`/`useReducer` within the file.
-   **No utils functions** → Copy necessary functions into each file.
-   **Duplicate code = Justice** (Allows AI to understand each file independently).

### 🔥 True AI-First Implementation Patterns
```typescript
// ✅ PERFECT: Fully self-contained component
export function GameChat() {
  // State management (contained within this file)
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'user'|'npc'}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameState, setGameState] = useState({hp: 100, mp: 50, level: 1});

  // API communication (contained within this file)
  const sendMessage = async (text: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: text, gameState})
      });
      const data = await response.json();
      setMessages(prev => [...prev,
        {id: Date.now().toString(), text, sender: 'user'},
        {id: (Date.now()+1).toString(), text: data.response, sender: 'npc'}
      ]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Utility functions (contained within this file)
  const formatDate = (date: Date) => date.toLocaleDateString('ja-JP');
  const validateInput = (text: string) => text.trim().length > 0;

  // UI (contained within this file)
  return (
    <div className="game-chat">
      {messages.map(msg => (
        <div key={msg.id} className={`message message-${msg.sender}`}>
          {msg.text}
        </div>
      ))}
      <input
        onKeyPress={(e) => {
          if (e.key === 'Enter' && validateInput(e.currentTarget.value)) {
            sendMessage(e.currentTarget.value);
            e.currentTarget.value = '';
          }
        }}
        disabled={isLoading}
      />
    </div>
  );
}
```

### 🔥 AI-First API Route Implementation
```typescript
// ✅ PERFECT: Fully self-contained API route
export async function POST(request: NextRequest) {
  // Validation (contained within this file)
  const validateGameAction = (data: any) => {
    if (!data.action) throw new Error('Action is required');
    if (!data.playerId) throw new Error('Player ID is required');
    return true;
  };

  // Game logic (contained within this file)
  const processGameAction = (action: string, playerId: string) => {
    const actions = {
      'attack': () => ({ damage: Math.floor(Math.random() * 20) + 1 }),
      'heal': () => ({ healing: Math.floor(Math.random() * 15) + 5 }),
      'defend': () => ({ defense: Math.floor(Math.random() * 10) + 3 })
    };
    return actions[action]?.() || { error: 'Invalid action' };
  };

  // DB operation (contained within this file)
  const saveGameState = async (playerId: string, result: any) => {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!
    });

    await db.execute({
      sql: 'UPDATE players SET last_action = ?, updated_at = datetime("now") WHERE id = ?',
      args: [JSON.stringify(result), playerId]
    });
  };

  try {
    const body = await request.json();
    validateGameAction(body);

    const result = processGameAction(body.action, body.playerId);
    await saveGameState(body.playerId, result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}
```

## 🚀 AI-First Development Flow
1.  **Complete Implementation**: Implement all functionality within a single file (do not look at other files).
2.  **Instant Understanding**: AI can grasp everything just by reading one file.
3.  **Immediate Modification**: Complete changes with instructions like "change XX in this file."
4.  **Welcome Duplication**: Copy the same code to other files.

## 🎯 AI Development Criteria

### ✅ Good Code (AI-Friendly)
-   Everything can be understood by reading a single file.
-   Minimal external dependencies (React/Next.js standards only).
-   Each file is independent, even with duplicate code.
-   Modification instructions are as simple as "change line XX in this file."

### ❌ Bad Code (Human-Legacy)
-   Requires reading multiple files to understand.
-   Depends on custom hooks, external atoms, or utils functions.
-   Abstraction fixated on the DRY principle.
-   Requires "first, check the dependencies..."

## Branching Strategy
-   `main`: Automatic production deployment.
-   `development`: Automatic testing deployment.

## Pre-deployment Execution
```bash
npm run lint
npm run typecheck
```

## Decision Criteria
1.  Can the AI understand it without referencing other files?
2.  Can a modification be completed with the instruction "modify XX in this file"?
3.  If the above are met, everything else is acceptable.

## Error Logging
```bash
git notes add -m "Error: [description] Fixed by: [solution]" HEAD
git push origin refs/notes/commits
```

## 🔥 Duplicate Code = A Weapon for AI Development

### Reasons to Recommend Duplicate Code
-   **AI Comprehension Speed**: Self-contained in one file = instant understanding.
-   **Modification Efficiency**: The scope of impact is limited to that single file.
-   **Development Speed**: No need to investigate other files.
-   **Bug Reduction**: No side effects from dependencies.

### Implementation Example: Copying the same function to each file
```typescript
// ✅ components/GameChat.tsx
const formatDate = (date: Date) => date.toLocaleDateString('ja-JP');
const validateInput = (text: string) => text.trim().length > 0;
const generateId = () => Date.now().toString();

// ✅ components/Dashboard.tsx
const formatDate = (date: Date) => date.toLocaleDateString('ja-JP');
const validateInput = (text: string) => text.trim().length > 0;
const generateId = () => Date.now().toString();

// → Perfect! The AI can understand each file independently.
```

### 🎯 The New Norms of AI Development
-   **DRY Principle = Outdated human value.**
-   **Duplicate Code = The standard for AI development.**
-   **File Independence = Maximized development efficiency.**

## 🚀 AI-First Development Environment

### Production Environment
**URL**: `https://aigm-vstag-production.up.railway.app/`

### Skip Authentication in Development Environment
```bash
# .env.local
ALWAYS_AUTH=true
ALWAYS_AUTH_EMAIL=dev@example.com
```

### Development Flow
1.  Local development (skip authentication).
2.  Test in the Railway environment.
3.  Deploy to production.

### The Iron Rules of AI Development
-   **Understand everything by looking at just one file.**
-   **Complete modifications with "modify XX in this file."**
-   **Duplicate Code = Development Efficiency.**
-   **Human Values (DRY, beautiful architecture) = Enemies of AI development.**

## 🔄 Technology Transition Policy (From Jan 2025)

### Deprecated Technologies
-   **Jotai/Recoil** → `useState`/`useReducer` within each file.
-   **Shared atoms (`@/atoms`, `@/lib/atoms`)** → State management within each file.
-   **Shared types (`@/types`)** → Type definitions within each file.
-   **CSS Modules** → Inline styles + Tailwind.
-   **Custom hooks** → Functions within each file.
-   **Utils functions** → Copy necessary functions to each file.

### Transition Rules
1.  **New Files**: Must be implemented with the new approach (Jotai is forbidden).
2.  **Modifying Existing Files**: Migrate to the new approach on the spot.
3.  **Forbidden Imports List**:
    -   `import { atom } from 'jotai'`
    -   `import ... from '@/atoms'`
    -   `import ... from '@/lib/atoms'`
    -   `import ... from '@/types'`
    -   `import ... from '@/hooks'`
    -   `import ... from '@/utils'`

### Recommended Tech Stack (Confirmed Jan 2025)
-   **Frontend**: Next.js App Router (RSC)
-   **State Management**: `useState`/`useReducer` (self-contained in file)
-   **Styling**: Inline styles + Tailwind CSS
-   **Data Fetching**: Direct `fetch` calls (self-contained in file)
-   **Type Definitions**: Defined directly within the file
-   **Database**: Turso (backup functionality is a priority)
-   **Email Sending**: Resend (simple API)
-   **Real-time**: PartyKit (Cloudflare-based)
-   **Animation**: Tailwind Animate + CSS (lightweight, self-contained in file)

### Discouraged Technologies (Forbidden)
-   **Framer Motion/GSAP**: Overkill; Tailwind Animate is sufficient.
-   **Redux/Zustand/Jotai**: External state management is forbidden.
-   **CSS Modules/Styled Components**: Use inline + Tailwind.
-   **Custom hooks**: Implement as functions within the file.
-   **Shared utils/lib**: Copy necessary functions to each file.

### Transition Deadlines
-   **End of Feb 2025**: Major components (GameChat, Dashboard, etc.) completed.
-   **End of Mar 2025**: All files migrated.

### Effects of Transition
-   **Development Speed**: 10-15x improvement.
-   **AI Comprehension Speed**: Instant (contained in one file).
-   **Bug Reduction**: Clearer scope of impact.
