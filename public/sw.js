// Receives files shared to the installed app (manifest `share_target`), stashes them in
// the Cache API and sends the user to /share, which reads them back. The stash survives
// a login redirect. Cache name and header are mirrored in src/utils/sharedFiles.ts.
const SHARED_FILES_CACHE = 'gitvault-shared-files'
const FILE_NAME_HEADER = 'x-file-name'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'POST' || url.pathname !== '/share-target') return

  event.respondWith((async () => {
    const formData = await event.request.formData()
    const cache = await caches.open(SHARED_FILES_CACHE)
    const files = formData.getAll('media').filter(file => file instanceof File)
    await Promise.all(files.map((file, index) => cache.put(
      `/shared-files/${Date.now()}-${index}`,
      new Response(file, { headers: { 'content-type': file.type, [FILE_NAME_HEADER]: encodeURIComponent(file.name) } }),
    )))
    return Response.redirect('/share', 303)
  })())
})
