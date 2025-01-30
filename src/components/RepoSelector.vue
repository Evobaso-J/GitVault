<template>
  <UDropdown
    :items="repoSelectorOptions"
    :popper="{ placement: 'bottom-start' }"
    :ui="{
      height: 'max-h-60',
    }"
  >
    <UButton
      :ui="{ rounded: 'rounded-lg', base: 'max-w-40' }"
      variant="ghost"
      :disabled="repoSelectorOptions[0].length < 2"
      size="xs"
      trailing-icon="i-material-symbols-home-storage-outline"
    >
      <span class="truncate">{{ Array.isArray($route.params.repo) || !$route.params.repo ? '' : $route.params.repo }}</span>
    </UButton>
  </UDropdown>
</template>

<script setup lang='ts'>
import type { DropdownItem } from '#ui/types'

defineComponent({ name: 'RepoSelector' })

const { data } = useFetch('/gh-user-repos')
const repositoryNames = computed(() => (
  data.value?.map(repo => repo.name)
  ?? []))

const repoSelectorOptions = computed<[DropdownItem[]]>(() =>
  [repositoryNames.value.map<DropdownItem>(repoName =>
    ({
      label: repoName,
      value: repoName,
      click: async () => await navigateTo(`/${repoName}`),
    }),
  ),
  ])
</script>
