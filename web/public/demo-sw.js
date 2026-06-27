/* HcqDrive live demo Service Worker.
 *
 * Activated ONLY on the GitHub Pages deployment. The real Android build
 * never registers this worker. Intercepts all /api/* requests and returns
 * synthetic data so visitors can poke at the web UI without a phone.
 *
 * NOT loaded by web/src — the registration is opt-in via the demo banner.
 */

const DEMO_TOKEN = 'demo-token-fixed'
const DEMO_PAIR_CODE = '123456'

const FIXTURE_FILES = [
  { name: 'DCIM', type: 'dir', size: 0, modified: 1719000000, path: '/DCIM' },
  { name: 'Pictures', type: 'dir', size: 0, modified: 1719100000, path: '/Pictures' },
  { name: 'Download', type: 'dir', size: 0, modified: 1719200000, path: '/Download' },
  { name: 'Documents', type: 'dir', size: 0, modified: 1719300000, path: '/Documents' },
  { name: 'README.md', type: 'file', size: 4096, modified: 1719400000, path: '/Documents/README.md' },
  { name: 'notes.txt', type: 'file', size: 1024, modified: 1719500000, path: '/Documents/notes.txt' },
  { name: 'holiday.jpg', type: 'file', size: 3145728, modified: 1719600000, path: '/Pictures/holiday.jpg' },
  { name: 'sunset.png', type: 'file', size: 2097152, modified: 1719700000, path: '/Pictures/sunset.png' },
  { name: 'clip.mp4', type: 'file', size: 52428800, modified: 1719800000, path: '/DCIM/clip.mp4' },
  { name: 'recording.m4a', type: 'file', size: 8388608, modified: 1719900000, path: '/DCIM/recording.m4a' },
]

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  })
}

function listAtPath(path) {
  const normalised = path.endsWith('/') ? path : path + '/'
  const entries = FIXTURE_FILES.filter((f) => {
    const parent = f.path.slice(0, f.path.lastIndexOf('/') + 1)
    return parent === normalised
  })
  return {
    path,
    entries: entries.map((e) => ({ ...e })),
  }
}

function findFile(path) {
  return FIXTURE_FILES.find((f) => f.path === path) || null
}

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApi(event.request, url))
  }
})

async function handleApi(request, url) {
  const path = url.pathname
  const query = Object.fromEntries(url.searchParams.entries())

  if (path === '/api/status') {
    return jsonResponse({
      running: true,
      version: '0.5.1-demo',
      deviceName: 'Demo Phone',
      address: 'demo.hcqdrive.app',
      port: 8080,
      activeConnections: 1,
    })
  }

  if (path === '/api/auth/pair' && request.method === 'POST') {
    return jsonResponse({
      token: DEMO_TOKEN,
      deviceId: 'demo-device',
      deviceName: 'Demo Browser',
      expiresIn: 3600,
    })
  }

  if (path === '/api/auth/verify' && request.method === 'POST') {
    return jsonResponse({ ok: true, deviceId: 'demo-device' })
  }

  if (path === '/api/auth/revoke' && request.method === 'POST') {
    return jsonResponse({ ok: true })
  }

  if (path === '/api/fs/list') {
    const p = query.path || '/'
    return jsonResponse(listAtPath(p))
  }

  if (path === '/api/fs/stat') {
    const f = findFile(query.path || '/')
    if (!f) return jsonResponse({ error: 'NOT_FOUND' }, { status: 404 })
    return jsonResponse({ ...f })
  }

  if (path === '/api/fs/mkdir' && request.method === 'POST') {
    return jsonResponse({ ok: true, path: (await request.json()).path + '/new-folder' })
  }

  if (path === '/api/fs/rename' && request.method === 'POST') {
    return jsonResponse({ ok: true })
  }

  if (path === '/api/fs/move' && request.method === 'POST') {
    return jsonResponse({ ok: true })
  }

  if (path === '/api/fs/delete' && request.method === 'POST') {
    return jsonResponse({ ok: true })
  }

  if (path === '/api/file/raw') {
    const payload = `# HcqDrive live demo\n\nThis is a fake file. In a real install, this would be a Range-resumable download from your phone.\n\nBack to the [GitHub repo](https://github.com/huangchengqian/HcqDrive).`
    return new Response(payload, {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  if (path === '/api/file/thumb') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#161b22"/><text x="50%" y="50%" fill="#8b949e" font-family="Helvetica,sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">thumbnail</text></svg>`
    return new Response(svg, { headers: { 'content-type': 'image/svg+xml' } })
  }

  if (path === '/api/file/zip') {
    return jsonResponse({ error: 'NOT_IMPLEMENTED_IN_DEMO' }, { status: 501 })
  }

  if (path === '/api/file/upload' && request.method === 'POST') {
    return jsonResponse({ ok: true, path: '/Download/uploaded-file' })
  }

  if (path === '/api/file/upload/init' && request.method === 'POST') {
    return jsonResponse({ uploadId: 'demo-upload-1', chunkSize: 1048576 })
  }

  if (path === '/api/file/upload/chunk' && request.method === 'POST') {
    return jsonResponse({ ok: true })
  }

  if (path === '/api/file/upload/complete' && request.method === 'POST') {
    return jsonResponse({ ok: true, path: '/Download/uploaded-chunked' })
  }

  if (path === '/api/media/exif') {
    return jsonResponse({
      camera: 'Demo Camera',
      lens: 'Demo Lens 50mm',
      iso: 200,
      aperture: 1.8,
      shutter: '1/250',
      focalLength: 50,
      takenAt: '2025-06-15T10:30:00Z',
    })
  }

  return jsonResponse({ error: 'NOT_IMPLEMENTED_IN_DEMO', path }, { status: 501 })
}
