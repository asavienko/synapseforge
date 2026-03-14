import { NextRequest, NextResponse } from "next/server";

/**
 * GET /embed.js?id={instanceId}
 *
 * Returns a self-contained JavaScript snippet that injects a floating chat
 * widget bubble into any webpage. The bubble opens an <iframe> pointing to
 * /chat/{instanceId} when clicked.
 *
 * Usage:
 *   <script src="https://synapseforge.ai/embed.js?id=INSTANCE_ID" async></script>
 */
export async function GET(req: NextRequest) {
  const instanceId = req.nextUrl.searchParams.get("id");

  if (!instanceId) {
    return new NextResponse("// Missing ?id parameter", {
      status: 400,
      headers: { "Content-Type": "application/javascript" },
    });
  }

  const origin = req.nextUrl.origin;
  const chatUrl = `${origin}/chat/${instanceId}`;

  const js = `(function() {
  if (document.getElementById('_sf_widget_root')) return;

  var CHAT_URL = '${chatUrl}';
  var OPEN = false;

  // Styles
  var style = document.createElement('style');
  style.textContent = [
    '#_sf_bubble{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#6d28d9);box-shadow:0 4px 24px rgba(124,58,237,0.5);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2147483646;transition:transform 0.2s,box-shadow 0.2s;border:none;}',
    '#_sf_bubble:hover{transform:scale(1.08);box-shadow:0 6px 32px rgba(124,58,237,0.7);}',
    '#_sf_bubble svg{pointer-events:none;}',
    '#_sf_frame_wrap{position:fixed;bottom:92px;right:24px;width:420px;max-width:calc(100vw - 48px);height:640px;max-height:calc(100vh - 120px);border-radius:20px;overflow:hidden;box-shadow:0 16px 64px rgba(0,0,0,0.5);z-index:2147483645;transition:opacity 0.25s,transform 0.25s;transform-origin:bottom right;}',
    '#_sf_frame_wrap.sf-hidden{opacity:0;transform:scale(0.9) translateY(16px);pointer-events:none;}',
    '#_sf_frame{width:100%;height:100%;border:none;}',
  ].join('');
  document.head.appendChild(style);

  // Bubble button
  var bubble = document.createElement('button');
  bubble.id = '_sf_bubble';
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Frame wrapper
  var wrap = document.createElement('div');
  wrap.id = '_sf_frame_wrap';
  wrap.className = 'sf-hidden';

  var iframe = document.createElement('iframe');
  iframe.id = '_sf_frame';
  iframe.src = CHAT_URL;
  iframe.allow = 'clipboard-write';
  iframe.setAttribute('loading', 'lazy');

  wrap.appendChild(iframe);

  var root = document.createElement('div');
  root.id = '_sf_widget_root';
  root.appendChild(wrap);
  root.appendChild(bubble);
  document.body.appendChild(root);

  bubble.addEventListener('click', function() {
    OPEN = !OPEN;
    if (OPEN) {
      wrap.classList.remove('sf-hidden');
      bubble.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>';
      bubble.setAttribute('aria-label', 'Close chat');
    } else {
      wrap.classList.add('sf-hidden');
      bubble.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      bubble.setAttribute('aria-label', 'Open chat');
    }
  });
})();
`;

  return new NextResponse(js, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
