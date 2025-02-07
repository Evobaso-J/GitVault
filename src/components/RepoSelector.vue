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
const repoSelectorOptions = computed<DropdownItem[][]>(() =>
  [
    [{
      label: t('createRepo'),
      value: '',
      icon: 'i-mdi-plus',
      iconClass: 'text-primary-500',
      class: 'text-primary-500',
      click: () => emit('create-click'),
    }],
    repositoryNames.value
      .map<DropdownItem>(repoName =>
        ({
          label: repoName,
          value: repoName,
          click: async () => await navigateTo(`/${repoName}`),
          disabled: repoName === route.params.repo,
        }),
      ),
  ])
</script>
