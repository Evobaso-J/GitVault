<template>
  <UDropdownMenu
    :items="repoSelectorOptions"
    :content="{ align: 'start' }"
    :ui="{
      content: 'max-h-60',
    }"
  >
    <UButton
      class="rounded-lg max-w-40"
      variant="ghost"
      size="xs"
      trailing-icon="i-material-symbols-home-storage-outline"
    >
      <span class="truncate">{{ Array.isArray($route.params.repo) || !$route.params.repo ? '' : $route.params.repo }}</span>
    </UButton>
  </UDropdownMenu>
</template>

<script setup lang='ts'>
import type { DropdownMenuItem } from '@nuxt/ui'

defineComponent({ name: 'RepoSelector' })

type RepoSelectorEmits = {
  (e: 'create-click'): void
}

const emit = defineEmits<RepoSelectorEmits>()

const { data } = useFetch('/gh-user-repos')
const repositoryNames = computed(() => (
  data.value?.map(repo => repo.name)
  ?? []))

const route = useRoute()
const { t } = useI18n()

type RepoSelectorItem = DropdownMenuItem & {
  value: string | undefined
}
const repoSelectorOptions = computed<RepoSelectorItem[][]>(() => {
  const options: RepoSelectorItem[][] = [
    [{
      label: t('createRepo'),
      value: undefined,
      icon: 'i-mdi-plus',
      color: 'primary',
      onSelect: () => emit('create-click'),
    }],
  ]

  if (repositoryNames.value.length) {
    const repositoryOptions = repositoryNames.value
      .map<RepoSelectorItem>(repoName => ({
        label: repoName,
        value: repoName,
        onSelect: async () => await navigateTo(`/${repoName}`),
        disabled: repoName === route.params.repo,
      }),
      )
    options.push(repositoryOptions)
  }

  return options
})
</script>
