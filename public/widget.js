(function() {
  'use strict';

  var WIDGET_URL = 'https://southern-steel.vercel.app/widget/chat';

  // Create container
  var container = document.createElement('div');
  container.id = 'southern-steel-widget';
  container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;';

  // Toggle button
  var btn = document.createElement('button');
  btn.style.cssText = 'width:56px;height:56px;border-radius:50%;background:#d45a28;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(212,90,40,0.4);display:flex;align-items:center;justify-content:center;transition:transform 0.2s;';
  btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  btn.onmouseover = function() { btn.style.transform = 'scale(1.1)'; };
  btn.onmouseout = function() { btn.style.transform = 'scale(1)'; };

  // Chat iframe
  var iframe = document.createElement('iframe');
  iframe.src = WIDGET_URL;
  iframe.style.cssText = 'width:380px;height:620px;border:none;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.4);display:none;margin-bottom:12px;';

  container.appendChild(iframe);
  container.appendChild(btn);
  document.body.appendChild(container);

  var open = false;
  btn.onclick = function() {
    open = !open;
    iframe.style.display = open ? 'block' : 'none';
    btn.innerHTML = open
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  };
})();
