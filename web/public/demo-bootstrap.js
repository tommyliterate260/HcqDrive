/* HcqDrive live demo bootstrap.
 *
 * Injected by the GitHub Pages deployment. Looks for the
 * `?demo=1` query string, registers the demo Service Worker,
 * pre-fills the pairing code, and shows a banner so visitors
 * know they're not talking to a real phone.
 *
 * NOT loaded by web/src — served only by GitHub Pages.
 */

(function () {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const isDemo = params.get('demo') === '1' || window.location.host.endsWith('.github.io')
  if (!isDemo) return

  const DEMO_CODE = '123456'

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register(new URL('./demo-sw.js', window.location.href), { scope: './' })
      .catch((err) => console.warn('[HcqDrive demo] Service Worker registration failed:', err))
  }

  try {
    localStorage.setItem('hcqdrive:demo-mode', '1')
  } catch {
    /* ignore */
  }

  const banner = document.createElement('div')
  banner.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'right:0',
    'z-index:9999',
    'padding:10px 16px',
    'background:#1f6feb',
    'color:#fff',
    'font:14px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',
    'box-shadow:0 2px 8px rgba(0,0,0,0.3)',
    'display:flex',
    'align-items:center',
    'justify-content:space-between',
    'gap:12px',
  ].join(';')
  banner.innerHTML = [
    '<span><strong>Live demo</strong> · the pairing code is pre-filled as <code style="background:rgba(255,255,255,0.2);padding:2px 6px;border-radius:4px">',
    DEMO_CODE,
    '</code>. Files are mocked, no phone is talking to you.</span>',
    '<a href="https://github.com/huangchengqian/HcqDrive" target="_blank" rel="noopener" style="color:#fff;text-decoration:underline;white-space:nowrap">View source →</a>',
  ].join('')
  document.body ? insertBanner() : document.addEventListener('DOMContentLoaded', insertBanner)

  function insertBanner() {
    document.body.insertBefore(banner, document.body.firstChild)
    const spacer = document.createElement('div')
    spacer.style.height = '44px'
    document.body.insertBefore(spacer, banner.nextSibling)
  }

  const observer = new MutationObserver(() => {
    const input = document.querySelector('input[name="code"], input#code, input[autocomplete="one-time-code"]')
    if (input && input.value !== DEMO_CODE) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      setter.call(input, DEMO_CODE)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
})()
