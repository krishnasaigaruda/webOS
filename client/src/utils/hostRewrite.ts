// Rewrites hardcoded http://localhost:3001 URLs to point at whichever host the
// client is actually being served from. Lets iPad/iPhone access webOS at
// http://<mac-ip>:3000 without touching every hardcoded fetch URL.
//
// Imported once from index.tsx BEFORE any other code that might use fetch.

(function patchHostReferences() {
  if (typeof window === 'undefined') return;
  const host = window.location.hostname;
  // If the page is already loaded from localhost, nothing to do.
  if (host === 'localhost' || host === '127.0.0.1') return;

  const SERVER_ORIGIN = `${window.location.protocol}//${host}:3001`;
  const LEGACY = 'http://localhost:3001';

  const rewrite = (v: any): any => {
    if (typeof v !== 'string') return v;
    if (v.startsWith(LEGACY)) return SERVER_ORIGIN + v.slice(LEGACY.length);
    return v;
  };

  // 1) Patch fetch so api calls to http://localhost:3001 reach the Mac server
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string') {
      input = rewrite(input);
    } else if (input instanceof Request && input.url.startsWith(LEGACY)) {
      input = new Request(SERVER_ORIGIN + input.url.slice(LEGACY.length), input);
    } else if (input instanceof URL && input.href.startsWith(LEGACY)) {
      input = new URL(SERVER_ORIGIN + input.href.slice(LEGACY.length));
    }
    return originalFetch(input as any, init);
  };

  // 2) Patch HTMLMediaElement.src (video/audio) so inline media loads work
  const patchSrc = (proto: any) => {
    try {
      const d = Object.getOwnPropertyDescriptor(proto, 'src');
      if (!d || !d.set || !d.get) return;
      const origSet = d.set;
      const origGet = d.get;
      Object.defineProperty(proto, 'src', {
        configurable: true,
        enumerable: d.enumerable,
        get: function () { return origGet.call(this); },
        set: function (v: any) { origSet.call(this, rewrite(v)); },
      });
    } catch {}
  };
  patchSrc(HTMLImageElement.prototype);
  // `src` for <video>/<audio> is actually defined on HTMLMediaElement — the
  // shared base class. Patching the subclasses does nothing because
  // getOwnPropertyDescriptor only returns own properties, not inherited.
  patchSrc(HTMLMediaElement.prototype);
  patchSrc(HTMLSourceElement.prototype);
  patchSrc(HTMLIFrameElement.prototype);
  // Link (stylesheets) uses `href`
  try {
    const d = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href');
    if (d && d.set && d.get) {
      const origSet = d.set;
      const origGet = d.get;
      Object.defineProperty(HTMLLinkElement.prototype, 'href', {
        configurable: true,
        enumerable: d.enumerable,
        get: function () { return origGet.call(this); },
        set: function (v: any) { origSet.call(this, rewrite(v)); },
      });
    }
  } catch {}

  // 3) Also patch setAttribute so React's SSR-style attribute setting goes
  //    through the rewriter. React uses the `src` property for most elements,
  //    but for safety also intercept setAttribute on Element.
  const origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name: string, value: string) {
    if ((name === 'src' || name === 'href') && typeof value === 'string') {
      value = rewrite(value);
    }
    return origSetAttr.call(this, name, value);
  };
})();

export {};
