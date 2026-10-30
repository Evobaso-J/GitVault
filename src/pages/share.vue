<template>
  <div class="flex justify-center pt-10 md:pt-24">
    <section class="w-full max-w-md flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-bold text-highlighted">
          {{ $t('share.title') }}
        </h1>
        <p class="text-muted">
          {{ $t('share.description') }}
        </p>
      </div>

      <ul
        v-if="files.length"
        class="flex flex-col divide-y divide-default rounded-lg border border-default text-sm max-h-72 overflow-y-auto"
      >
        <li
          v-for="(file, index) in files"
          :key="index"
          class="flex items-center gap-3 px-3 py-2"
        >
          <UIcon
            :name="getIconFromFileName(file.name)"
            class="size-4 shrink-0 text-muted"
          />
          <span class="flex-1 min-w-0 truncate">{{ file.name }}</span>
          <span class="text-muted">{{ formatBytes(file.size, locale) }}</span>
        </li>
      </ul>

      <UButton
        :label="$t('share.choose')"
        icon="i-mdi-image-multiple-outline"
        color="neutral"
        variant="outline"
        size="xl"
        block
        @click="open({ accept: 'image/*,video/*', multiple: true })"
      />

      <UFormField :label="$t('vault')">
        <USelectMenu
          v-model="repo"
          :items="repositoryNames"
          size="xl"
          class="w-full"
        />
      </UFormField>
      <UFormField
        :label="$t('folder')"
        :help="$t('share.folderHelp')"
      >
        <UInput
          v-model="folder"
          placeholder="Photos"
          size="xl"
          class="w-full"
        />
      </UFormField>

      <div class="flex flex-col gap-2">
        <UButton
          :label="$t('share.upload', files.length)"
          :disabled="!files.length || !repo"
          icon="i-mdi-upload-outline"
          size="xl"
          block
          @click="uploadShared"
        />
        <UButton
          :label="$t('cancel')"
          color="neutral"
          variant="ghost"
          size="xl"
          block
          @click="discard"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useFileDialog } from '@vueuse/core'
import { getIconFromFileName, getPathToFolder } from '~/resources/CDNFiles/utils'

const { t, locale } = useI18n()

definePageMeta({
  middleware: ['00-auth'],
  layout: 'no-repo',
})
useHead({
  title: t('share.title'),
})

const { activeRepository, repositoryNames } = useRepoStorage()
const { upload } = useVaultContents()

const files = ref<File[]>([])
onMounted(async () => {
  files.value.push(...await readSharedFiles())
})

// Fallback where the share sheet can't target a web app (iOS): pick from the gallery here
const { open, onChange } = useFileDialog()
onChange((picked) => {
  if (picked) files.value.push(...Array.from(picked))
})

const repo = ref(activeRepository.value)
const folder = ref('')

const uploadShared = async () => {
  const path = folder.value.split('/').map(segment => segment.trim()).filter(Boolean).join('/')
  // Not awaited: the queue keeps going on the folder page, which shows its progress
  upload(files.value, { repo: repo.value, folder: path })
  await clearSharedFiles()
  await navigateTo(getPathToFolder({ repo: repo.value, path }))
}

const discard = async () => {
  await clearSharedFiles()
  await navigateTo('/')
}
</script>
