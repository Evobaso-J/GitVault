<template>
  <UButton
    :to="signedIn ? '/vaults' : '/auth/github'"
    :external="!signedIn"
    :icon="signedIn ? 'i-mdi-archive-outline' : 'i-simple-icons-github'"
    :label="signedIn ? $t('landing.openVaults') : $t('landing.cta')"
    class="lp-btn"
    :class="[`lp-btn-${size}`, onDeep ? 'lp-btn-on-deep' : 'lp-btn-primary']"
    :ui="{ leadingIcon: size === 'sm' ? 'size-4' : 'size-[18px]' }"
  />
</template>

<script setup lang="ts">
import { useMounted } from '@vueuse/core'

defineProps<{ size: 'sm' | 'lg', onDeep?: boolean }>()

const { loggedIn } = useUserSession()
// The prerendered HTML is always the signed-out version: switch only after mount, so hydration matches.
const mounted = useMounted()
const signedIn = computed(() => mounted.value && loggedIn.value)
</script>
