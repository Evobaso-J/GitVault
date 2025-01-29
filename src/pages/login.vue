<template>
  <div class="p-4">
    <UButton
      v-if="!loggedIn"
      to="/auth/github"
      icon="i-simple-icons-github"
      label="Login with GitHub"
      color="black"
      size="xs"
      external
    />
  </div>
</template>

<script setup lang="ts">
import { DEFAULT_REPO_NAME } from '~/config'

definePageMeta({
  layout: false,
})

declare module '#auth-utils' {
  interface User {
    id: number
    login: string
  }
}

const { loggedIn } = useUserSession()

watch(loggedIn, () => {
  if (!loggedIn.value) {
    navigateTo(`/${DEFAULT_REPO_NAME}`)
  }
})
</script>
