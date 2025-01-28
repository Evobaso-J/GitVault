<template>
  <UDropdown
    :items="repoSelectorOptions"
    :popper="{ placement: 'bottom-start' }"
    :ui="{
      height: 'max-h-60',
    }"
  >
    <div class="flex items-center gap-1 text-sm max-w-40 truncate">
      <UButton
        :ui="{ rounded: 'rounded-lg' }"
        variant="ghost"
        :disabled="repoSelectorOptions[0].length < 2"
        size="xs"
        :label="Array.isArray($route.params.repo) || !$route.params.repo ? '' : $route.params.repo"
        trailing-icon="i-material-symbols-home-storage-outline"
      />
    </div>
  </UDropdown>
</template>

<script setup lang='ts'>
import type { DropdownItem } from '#ui/types'

defineComponent({ name: 'RepoSelector' })

const { data } = useFetch('/api/gh-user-repos')
const config = useRuntimeConfig()
const repositoryNames = computed(() => (
  data.value
    ?.filter(repo => repo.owner.login === config.public.ghRepoOwner)
    .map(repo => repo.name)
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
