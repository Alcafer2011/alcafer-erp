import type { ActionFunctionArgs } from '@remix-run/node';

// Placeholder endpoint to avoid 404; real WS would be handled by a server
export async function action({ request }: ActionFunctionArgs) {
  return new Response('WebSocket not implemented in Pages runtime', { status: 200 });
}










