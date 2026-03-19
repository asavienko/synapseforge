(function () {
  "use strict";

  // Get the current script tag
  var scriptTag = document.currentScript || document.querySelector('script[src*="embed.js"]') || document.querySelector('script[src*="widget.js"]');
  
  // Get configuration from data attributes or global config
  var config = window.SynapseForge || {};
  
  // Parse data attributes from script tag
  if (scriptTag) {
    config.instanceId = scriptTag.getAttribute('data-instance-id') || config.instanceId;
    config.position = scriptTag.getAttribute('data-position') || config.position || 'bottom-right';
    config.color = scriptTag.getAttribute('data-color') || config.color;
    config.greeting = scriptTag.getAttribute('data-greeting') || config.greeting;
    config.hideBranding = scriptTag.getAttribute('data-hide-branding') === 'true' || config.hideBranding;
    config.ref = scriptTag.getAttribute('data-ref') || config.ref;
  }
  
  // Parse query string from script src for ?id= support
  if (scriptTag && scriptTag.src) {
    try {
      var url = new URL(scriptTag.src);
      var queryId = url.searchParams.get('id');
      if (queryId && !config.instanceId) {
        config.instanceId = queryId;
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }

  if (!config.instanceId) {
    console.error('[SynapseForge Widget] instance ID is required. Use data-instance-id attribute or ?id= query param.');
    return;
  }

  var BASE_URL = config.baseUrl || (typeof window !== 'undefined' && window.location.origin) || "https://synapseforge-mu.vercel.app";
  var WIDGET_VERSION = "1.0.0";

  // Configuration state
  var widgetConfig = {
    instanceId: config.instanceId,
    position: config.position || 'bottom-right',
    color: config.color || "#7c3aed",
    greeting: config.greeting || null,
    avatarUrl: null,
    agentName: null,
    hideBranding: config.hideBranding || false,
    ref: config.ref || null,
    loaded: false
  };

  var isOpen = false;
  var isDragging = false;
  var dragOffset = { x: 0, y: 0 };
  var elements = {};

  // ── Styles ─────────────────────────────────────────────────────────────────
  var STYLES = `
    .sf-widget-root {
      --sf-primary: ${widgetConfig.color};
      --sf-primary-dark: ${adjustColor(widgetConfig.color, -20)};
      --sf-shadow: 0 8px 32px rgba(0,0,0,0.4);
      --sf-transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
    }
    
    .sf-widget-btn {
      position: fixed;
      z-index: 99999;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--sf-primary) 0%, var(--sf-primary-dark) 100%);
      color: white;
      box-shadow: var(--sf-shadow), 0 0 20px ${widgetConfig.color}40;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      animation: sf-bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .sf-widget-btn:hover {
      transform: scale(1.1);
      box-shadow: var(--sf-shadow), 0 0 30px ${widgetConfig.color}60;
    }
    
    .sf-widget-btn:active {
      transform: scale(0.95);
    }
    
    .sf-widget-btn.position-bottom-right { bottom: 24px; right: 24px; }
    .sf-widget-btn.position-bottom-left { bottom: 24px; left: 24px; }
    
    .sf-widget-btn.open {
      transform: rotate(135deg);
    }
    
    .sf-widget-btn svg {
      width: 28px;
      height: 28px;
      transition: transform 0.2s ease;
    }
    
    .sf-widget-notification {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 20px;
      height: 20px;
      background: #ef4444;
      border-radius: 50%;
      border: 3px solid ${widgetConfig.color};
      animation: sf-pulse 2s infinite;
      display: none;
    }
    
    .sf-widget-notification.show {
      display: block;
    }
    
    .sf-widget-container {
      position: fixed;
      z-index: 99998;
      width: 400px;
      height: 600px;
      max-height: calc(100vh - 120px);
      border-radius: 20px;
      box-shadow: var(--sf-shadow);
      overflow: hidden;
      background: #0a0a0f;
      transition: var(--sf-transition);
      opacity: 0;
      transform: scale(0.9) translateY(20px);
      pointer-events: none;
    }
    
    .sf-widget-container.open {
      opacity: 1;
      transform: scale(1) translateY(0);
      pointer-events: all;
    }
    
    .sf-widget-container.position-bottom-right { bottom: 100px; right: 24px; }
    .sf-widget-container.position-bottom-left { bottom: 100px; left: 24px; }
    
    .sf-widget-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
    }
    
    .sf-widget-header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0) 100%);
      pointer-events: none;
      z-index: 1;
    }
    
    .sf-widget-loading {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0f;
      z-index: 2;
      transition: opacity 0.3s ease;
    }
    
    .sf-widget-loading.hidden {
      opacity: 0;
      pointer-events: none;
    }
    
    .sf-widget-loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: var(--sf-primary);
      border-radius: 50%;
      animation: sf-spin 1s linear infinite;
    }
    
    .sf-widget-branding {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 4px;
      text-align: center;
      background: linear-gradient(0deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0) 100%);
      font-size: 10px;
      color: #71717a;
      z-index: 1;
      transition: opacity 0.3s ease;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    
    .sf-widget-branding a {
      color: #71717a;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    
    .sf-widget-branding a:hover {
      color: var(--sf-primary);
    }
    
    .sf-widget-greeting {
      position: fixed;
      z-index: 99997;
      max-width: 280px;
      padding: 16px 20px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.15);
      font-size: 14px;
      line-height: 1.5;
      color: #1f2937;
      animation: sf-greeting-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s both;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    
    .sf-widget-greeting:hover {
      transform: scale(1.02);
    }
    
    .sf-widget-greeting.position-bottom-right { bottom: 100px; right: 100px; }
    .sf-widget-greeting.position-bottom-left { bottom: 100px; left: 100px; }
    
    .sf-widget-greeting::after {
      content: '';
      position: absolute;
      bottom: -8px;
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid white;
    }
    
    .sf-widget-greeting.position-bottom-right::after { right: 20px; }
    .sf-widget-greeting.position-bottom-left::after { left: 20px; }
    
    .sf-widget-greeting-close {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      border: none;
      background: rgba(0,0,0,0.1);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #666;
      transition: all 0.2s ease;
    }
    
    .sf-widget-greeting-close:hover {
      background: rgba(0,0,0,0.15);
      color: #333;
    }
    
    @keyframes sf-bounce-in {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes sf-spin {
      to { transform: rotate(360deg); }
    }
    
    @keyframes sf-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes sf-greeting-in {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    /* Mobile responsive */
    @media (max-width: 640px) {
      .sf-widget-container {
        width: calc(100vw - 32px);
        height: calc(100vh - 120px);
        left: 16px !important;
        right: 16px !important;
        bottom: 90px !important;
      }
      
      .sf-widget-btn.position-bottom-right { bottom: 16px; right: 16px; }
      .sf-widget-btn.position-bottom-left { bottom: 16px; left: 16px; }
      
      .sf-widget-greeting.position-bottom-right { bottom: 90px; right: 90px; }
      .sf-widget-greeting.position-bottom-left { bottom: 90px; left: 90px; }
    }
    
    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .sf-widget-btn, .sf-widget-container, .sf-widget-greeting {
        animation: none;
        transition: none;
      }
    }
  `;

  // Helper to darken/lighten color
  function adjustColor(color, amount) {
    var hex = color.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    return '#' + 
      r.toString(16).padStart(2, '0') +
      g.toString(16).padStart(2, '0') +
      b.toString(16).padStart(2, '0');
  }

  // ── Load Widget Config ─────────────────────────────────────────────────────
  async function loadWidgetConfig() {
    try {
      var response = await fetch(BASE_URL + '/api/widget/' + widgetConfig.instanceId);
      if (!response.ok) throw new Error('Failed to load config');
      var data = await response.json();
      
      widgetConfig.agentName = data.name || 'AI Assistant';
      widgetConfig.avatarUrl = data.avatarUrl || null;
      widgetConfig.greeting = widgetConfig.greeting || data.greeting || null;
      widgetConfig.color = widgetConfig.color || data.brandColor || '#7c3aed';
      widgetConfig.hideBranding = widgetConfig.hideBranding || data.hidePoweredBy || false;
      widgetConfig.loaded = true;
      
      updateStyles();
    } catch (err) {
      console.warn('[SynapseForge Widget] Using default config');
      widgetConfig.loaded = true;
    }
  }

  function updateStyles() {
    var styleEl = document.getElementById('sf-widget-styles');
    if (styleEl) {
      styleEl.textContent = STYLES;
    }
  }

  // ── Create Elements ────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('sf-widget-styles')) return;
    
    var styleEl = document.createElement('style');
    styleEl.id = 'sf-widget-styles';
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
  }

  function createButton() {
    var btn = document.createElement('button');
    btn.id = '_sf_bubble';
    btn.className = 'sf-widget-btn position-' + widgetConfig.position;
    btn.setAttribute('aria-label', 'Open chat with ' + (widgetConfig.agentName || 'AI Assistant'));
    btn.innerHTML = 
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>' +
      '</svg>' +
      '<span class="sf-widget-notification"></span>';
    
    btn.addEventListener('click', toggleChat);
    btn.addEventListener('mouseenter', function() {
      if (!isOpen) showGreeting();
    });
    
    return btn;
  }

  function createContainer() {
    var container = document.createElement('div');
    container.id = '_sf_frame_wrap';
    container.className = 'sf-widget-container sf-hidden position-' + widgetConfig.position;
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-label', 'Chat window');
    
    // Loading state
    var loading = document.createElement('div');
    loading.className = 'sf-widget-loading';
    loading.innerHTML = '<div class="sf-widget-loading-spinner"></div>';
    loading.id = 'sf-widget-loading';
    container.appendChild(loading);
    
    // Header overlay (for visual consistency)
    var header = document.createElement('div');
    header.className = 'sf-widget-header';
    container.appendChild(header);
    
    // Iframe
    var iframe = document.createElement('iframe');
    iframe.className = 'sf-widget-iframe';
    iframe.setAttribute('allow', 'clipboard-write; microphone');
    iframe.setAttribute('title', 'Chat with ' + (widgetConfig.agentName || 'AI Assistant'));
    iframe.id = 'sf-widget-iframe';
    
    // Build iframe URL with params
    var chatUrl = BASE_URL + '/widget-chat/' + widgetConfig.instanceId;
    var params = [];
    if (widgetConfig.greeting) {
      params.push('greeting=' + encodeURIComponent(widgetConfig.greeting));
    }
    if (params.length) {
      chatUrl += '?' + params.join('&');
    }
    
    iframe.src = chatUrl;
    
    // Handle iframe load
    iframe.addEventListener('load', function() {
      var loadingEl = document.getElementById('sf-widget-loading');
      if (loadingEl) {
        loadingEl.classList.add('hidden');
      }
    });
    
    container.appendChild(iframe);
    
    // Branding (if not hidden)
    if (!widgetConfig.hideBranding) {
      var branding = document.createElement('div');
      branding.className = 'sf-widget-branding';
      var brandUrl = 'https://synapseforge-mu.vercel.app' + (widgetConfig.ref ? '?ref=' + encodeURIComponent(widgetConfig.ref) : '');
      branding.innerHTML = '<a href="' + brandUrl + '" target="_blank" rel="noopener noreferrer">Powered by SynapseForge</a>';
      container.appendChild(branding);
    }
    
    return container;
  }

  function createGreeting() {
    if (!widgetConfig.greeting) return null;
    
    var greeting = document.createElement('div');
    greeting.className = 'sf-widget-greeting position-' + widgetConfig.position;
    greeting.innerHTML = 
      '<button class="sf-widget-greeting-close" aria-label="Dismiss greeting">×</button>' +
      '<div>' + escapeHtml(widgetConfig.greeting) + '</div>';
    
    greeting.addEventListener('click', function(e) {
      if (e.target.classList.contains('sf-widget-greeting-close')) {
        e.stopPropagation();
        hideGreeting();
      } else {
        toggleChat();
      }
    });
    
    // Auto-hide after 10 seconds
    setTimeout(hideGreeting, 10000);
    
    return greeting;
  }

  // ── Helper Functions ───────────────────────────────────────────────────────
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function toggleChat() {
    isOpen = !isOpen;
    
    var btn = elements.button;
    var container = elements.container;
    
    if (isOpen) {
      btn.classList.add('open');
      btn.setAttribute('aria-label', 'Close chat');
      container.classList.add('open');
      container.classList.remove('sf-hidden');
      hideGreeting();
      
      // Focus iframe for accessibility
      setTimeout(function() {
        var iframe = document.getElementById('sf-widget-iframe');
        if (iframe) iframe.focus();
      }, 300);
    } else {
      btn.classList.remove('open');
      btn.setAttribute('aria-label', 'Open chat with ' + (widgetConfig.agentName || 'AI Assistant'));
      container.classList.remove('open');
      container.classList.add('sf-hidden');
    }
  }

  function showGreeting() {
    if (!widgetConfig.greeting || isOpen) return;
    
    if (!elements.greeting) {
      elements.greeting = createGreeting();
      if (elements.greeting) {
        document.body.appendChild(elements.greeting);
      }
    } else {
      elements.greeting.style.display = 'block';
    }
  }

  function hideGreeting() {
    if (elements.greeting) {
      elements.greeting.style.display = 'none';
    }
  }

  function showNotification() {
    var notification = document.querySelector('.sf-widget-notification');
    if (notification) {
      notification.classList.add('show');
    }
  }

  function hideNotification() {
    var notification = document.querySelector('.sf-widget-notification');
    if (notification) {
      notification.classList.remove('show');
    }
  }

  // ── Initialize ─────────────────────────────────────────────────────────────
  async function init() {
    // Don't initialize twice
    if (window.SynapseForgeWidgetInitialized) return;
    window.SynapseForgeWidgetInitialized = true;
    
    // Load config from API
    await loadWidgetConfig();
    
    // Inject styles
    injectStyles();
    
    // Create elements
    elements.button = createButton();
    elements.container = createContainer();

    // Root wrapper for test/identification
    var root = document.createElement('div');
    root.id = '_sf_widget_root';
    root.appendChild(elements.button);
    root.appendChild(elements.container);

    // Add to DOM when ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        document.body.appendChild(root);
      });
    } else {
      document.body.appendChild(root);
    }
    
    // Listen for messages from iframe
    window.addEventListener('message', function(e) {
      // Only accept messages from our domain
      var iframeOrigin = new URL(BASE_URL).origin;
      if (e.origin !== iframeOrigin) return;
      
      if (e.data && e.data.type === 'synapseforge-chat') {
        switch (e.data.action) {
          case 'close':
            toggleChat();
            break;
          case 'new-message':
            if (!isOpen) showNotification();
            break;
          case 'message-read':
            hideNotification();
            break;
        }
      }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        toggleChat();
      }
    });
    
    // Expose API
    window.SynapseForgeWidget = {
      open: function() { if (!isOpen) toggleChat(); },
      close: function() { if (isOpen) toggleChat(); },
      toggle: toggleChat,
      showNotification: showNotification,
      hideNotification: hideNotification,
      config: widgetConfig,
      version: WIDGET_VERSION
    };
    
    console.log('[SynapseForge Widget] v' + WIDGET_VERSION + ' initialized');
  }

  // Start initialization
  init();
})();
