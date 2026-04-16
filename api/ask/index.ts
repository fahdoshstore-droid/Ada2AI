export default async function handler(req: Request): Promise<Response> {
  return new Response("Hello from Ada2AI AI!", {
    headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" },
  });
}
