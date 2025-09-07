
import { Emitter } from '@/lib/emitter';

// This tells Vercel to stream the response
export const dynamic = 'force-dynamic';

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const onStateChange = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      Emitter.on('live-state-change', onStateChange);

      // Clean up the listener when the client disconnects
      controller.signal.addEventListener('abort', () => {
        Emitter.removeListener('live-state-change', onStateChange);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
