<script setup lang="ts">
// Legacy app URLs (/<repo>/..., /<repo>/file/..., shared before the move under /vaults) redirect to their /vaults twin.
// Any other unknown path lands on the vault page, which handles a missing repo.
definePageMeta({
  middleware: to => navigateTo(`/vaults${to.fullPath}`, { replace: true }),
})
</script>

<template>
  <div />
</template>
