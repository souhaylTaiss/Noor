self.addEventListener("install", installEvent => {
  console.log(installEvent)
});

self.addEventListener("activate", activateEvent => {
  console.log(activateEvent)
})
