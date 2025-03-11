<template>
  <div class="h-full flex flex-col lg:flex-row overflow-hidden">
    <UContainer
      class="flex flex-col my-6 lg:my-36 gap-16 lg:shrink-0 lg:w-[35rem] pt-[calc(50vh-28rem)]"
      :ui="{
        padding: 'px-4 sm:px-6 lg:px-12',
      }"
    >
      <div class="w-full flex items-center gap-2 mb-8 lg:mb-0">
        <AppLogo size="30" />
        <h1 class="text-xl font-semibold">
          {{ $t('app.name') }}
        </h1>
      </div>

      <div class="flex flex-col gap-2 mb-5 text-center px-1 lg:px-0 lg:text-left">
        <span class="font-semibold text-4xl">
          {{ $t('signIn.title') }}
        </span>
        <i18n-t
          keypath="signIn.description"
          tag="p"
          class="text-gray-500"
        >
          <template #gitHubLink>
            <ULink
              class="text-primary text-wrap"
              to="https://github.com"
              external
              target="_blank"
            >
              {{ $t('gitHub') }}
            </ULink>
          </template>
        </i18n-t>
      </div>

      <div class="py-4">
        <UButton
          v-if="!loggedIn"
          to="/auth/github"
          icon="i-simple-icons-github"
          :label="$t('signIn.gitHub')"
          color="black"
          variant="outline"
          external
          block
          size="lg"
          class="mb-4"
        />
        <i18n-t
          keypath="signIn.dontHaveAnAccount"
          tag="div"
          class="font-normal text-gray-500 text-sm text-center w-full"
        >
          <template #createAccount>
            <ULink
              class="text-primary text-wrap"
              to="https://github.com/signup"
              external
              target="_blank"
            >
              {{ $t('signIn.createAccount') }}
            </ULink>
          </template>
        </i18n-t>
      </div>
    </UContainer>
    <div class="flex justify-end mt-auto lg:mt-0">
      <LoginCard />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
definePageMeta({
  layout: false,
})
useHead({
  title: t('signIn.title'),
})

declare module '#auth-utils' {
  interface User {
    id: number
    login: string
  }
}

const { loggedIn } = useUserSession()
</script>
