<template>
  <section
    :aria-label="$t('preview')"
    class="flex flex-col gap-5"
  >
    <div class="flex items-center justify-between">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted">{{ $t('preview') }}</span>
      <UButton
        :aria-label="$t('closePreview')"
        icon="i-mdi-close"
        color="neutral"
        variant="ghost"
        @click="emit('close')"
      />
    </div>

    <FilePreview
      :source="fullFile ?? file"
      class="h-64"
    />

    <div class="flex flex-col gap-1 min-w-0">
      <span class="text-lg font-semibold break-words">{{ file.name }}</span>
      <span class="text-sm text-muted">{{ $t(`fileCategory.${getFileCategory(file.name)}`) }} · {{ formatBytes(file.size) }}</span>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <UButton
        :label="$t('download')"
        icon="i-mdi-download-outline"
        block
        @click="download(file)"
      />
      <UButton
        :label="$t('copyLink')"
        icon="i-mdi-link-variant"
        color="neutral"
        variant="outline"
        block
        @click="copyLink(file)"
      />
      <UButton
        :label="$t('replace')"
        icon="i-mdi-autorenew"
        color="neutral"
        variant="outline"
        block
        @click="replace(file)"
      />
      <UButton
        :label="$t('openFullScreen')"
        icon="i-mdi-arrow-expand"
        color="neutral"
        variant="outline"
        block
        :to="getFileUrl(file)"
      />
    </div>

    <dl class="grid grid-cols-[6rem_minmax(0,1fr)] gap-y-2 text-sm">
      <dt class="text-muted">
        {{ $t('path') }}
      </dt>
      <dd class="font-mono text-xs break-all">
        {{ file.path }}
      </dd>
      <dt class="text-muted">
        {{ $t('vault') }}
      </dt>
      <dd>{{ $route.params.repo }}</dd>
      <dt class="text-muted">
        {{ $t('gitHub') }}
      </dt>
      <dd>
        <ULink
          v-if="file.html_url"
          :to="file.html_url"
          target="_blank"
          class="text-primary"
        >
          {{ $t('viewOnGitHub') }}
        </ULink>
      </dd>
    </dl>
  </section>
</template>

<script setup lang='ts'>
import type { CDNFile } from '~/resources/CDNFiles'
import { parseGhRepoContentsToCDNFile } from '~/resources/CDNFiles/parse'
import { getFileCategory } from '~/resources/CDNFiles/utils'

defineComponent({ name: 'FolderContentsPreviewPanel' })
const props = defineProps<{ file: CDNFile }>()
const emit = defineEmits<{ close: [] }>()

const route = useRoute()
const { getFileUrl, download, copyLink, replace } = useFileActions()

// A folder listing has no file content: text and code previews need the single-file response
const { data: fullFile } = useFetch('/gh-repo-contents', {
  query: computed(() => ({ repo: route.params.repo, path: props.file.path })),
  transform: parseGhRepoContentsToCDNFile,
})
</script>
