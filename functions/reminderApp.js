export async function onRequest(context) {
  const { request } = context;
  const response = await fetch('https://raw.githubusercontent.com/MoeNasseff/AGS-Alu-Guarantee-Systems/main/reminderApp.html');
  return new Response(await response.text(), {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
