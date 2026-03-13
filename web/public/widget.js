(function () {
  var config = window.SynapseForge || {};
  var instanceId = config.instanceId;
  if (!instanceId) return;

  var BASE_URL = config.baseUrl || "https://app.synapseforge.ai";
  var color = config.color || "#7c3aed";
  var isOpen = false;

  // ── Bubble button ─────────────────────────────────────────────────────────
  var btn = document.createElement("button");
  btn.id = "sf-chat-btn";
  btn.setAttribute("aria-label", "Open chat");
  btn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  btn.style.cssText = [
    "position:fixed",
    "bottom:24px",
    "right:24px",
    "z-index:99999",
    "width:56px",
    "height:56px",
    "border-radius:50%",
    "border:none",
    "cursor:pointer",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "background-color:" + color,
    "color:white",
    "box-shadow:0 4px 16px rgba(0,0,0,0.3)",
    "transition:transform 0.2s ease",
  ].join(";");

  // ── iframe container ──────────────────────────────────────────────────────
  var container = document.createElement("div");
  container.id = "sf-chat-container";
  container.style.cssText = [
    "position:fixed",
    "bottom:96px",
    "right:24px",
    "z-index:99998",
    "width:380px",
    "height:600px",
    "border-radius:16px",
    "box-shadow:0 8px 32px rgba(0,0,0,0.4)",
    "overflow:hidden",
    "display:none",
    "transition:opacity 0.2s ease,transform 0.2s ease",
    "border:1px solid rgba(255,255,255,0.1)",
    "opacity:0",
    "transform:translateY(8px)",
  ].join(";");

  var iframe = document.createElement("iframe");
  iframe.src = BASE_URL + "/chat/" + instanceId;
  iframe.style.cssText = "width:100%;height:100%;border:none;";
  iframe.setAttribute("allow", "clipboard-write");
  iframe.setAttribute("title", "Chat");
  container.appendChild(iframe);

  btn.addEventListener("click", function () {
    isOpen = !isOpen;
    if (isOpen) {
      container.style.display = "block";
      // Trigger reflow before animating
      void container.offsetHeight;
      container.style.opacity = "1";
      container.style.transform = "translateY(0)";
      btn.style.transform = "rotate(90deg)";
      btn.setAttribute("aria-label", "Close chat");
    } else {
      container.style.opacity = "0";
      container.style.transform = "translateY(8px)";
      btn.style.transform = "rotate(0deg)";
      btn.setAttribute("aria-label", "Open chat");
      setTimeout(function () {
        if (!isOpen) container.style.display = "none";
      }, 200);
    }
  });

  // ── Responsive: hide on very small screens ────────────────────────────────
  function applyResponsive() {
    if (window.innerWidth < 420) {
      container.style.width = "calc(100vw - 16px)";
      container.style.right = "8px";
      container.style.bottom = "80px";
    } else {
      container.style.width = "380px";
      container.style.right = "24px";
      container.style.bottom = "96px";
    }
  }
  applyResponsive();
  window.addEventListener("resize", applyResponsive);

  document.body.appendChild(container);
  document.body.appendChild(btn);
})();
