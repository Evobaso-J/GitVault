// Files shared from the phone gallery, stashed by the service worker (public/sw.js).
// Keep both names in sync with it.
const SHARED_FILES_CACHE = 'gitvault-shared-files'
const FILE_NAME_HEADER = 'x-file-name'

// The Cache API exists only in secure contexts (HTTPS or localhost)
const isSupported = () => typeof caches !== 'undefined'

export const hasSharedFiles = async (): Promise<boolean> => {
  if (!isSupported() || !await caches.has(SHARED_FILES_CACHE)) return false
  const cache = await caches.open(SHARED_FILES_CACHE)
  return (await cache.keys()).length > 0
}

export const readSharedFiles = async (): Promise<File[]> => {
  if (!isSupported()) return []
  const cache = await caches.open(SHARED_FILES_CACHE)
  const responses = await Promise.all((await cache.keys()).map(request => cache.match(request)))
  return Promise.all(responses.filter(response => !!response).map(async response => new File(
    [await response.blob()],
    decodeURIComponent(response.headers.get(FILE_NAME_HEADER) ?? 'file'),
    { type: response.headers.get('content-type') ?? '' },
  )))
}

export const clearSharedFiles = async (): Promise<void> => {
  if (isSupported()) await caches.delete(SHARED_FILES_CACHE)
}
