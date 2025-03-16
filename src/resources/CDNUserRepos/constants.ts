import { z } from 'zod'

export const USER_REPO_SCHEMA = z.object({
  name: z.string().min(1),
})

export type UserRepoForm = z.infer<typeof USER_REPO_SCHEMA>

export const USER_REPO_FORM_INITIAL_STATE: UserRepoForm = {
  name: '',
}
