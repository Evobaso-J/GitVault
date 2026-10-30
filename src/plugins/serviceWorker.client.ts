// Makes the app installable and receives files shared from the phone gallery (public/sw.js)
export default defineNuxtPlugin(() => {
  navigator.serviceWorker?.register('/sw.js')
})
