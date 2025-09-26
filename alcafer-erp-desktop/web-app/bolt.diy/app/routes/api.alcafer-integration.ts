import type { ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.json().catch(() => null);
  return new Response(JSON.stringify({ received: true, response: 'ok', autoFix: null, echo: data }), {
    headers: { 'Content-Type': 'application/json' },
  });
}







