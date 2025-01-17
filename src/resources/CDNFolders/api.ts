import { $putFile } from '../CDNFiles/api'

type CreateFolderPayload = {
  path: string
  repo: Repository
}

export const $createFolder = ({ path, repo }: CreateFolderPayload) => $putFile({
  path,
  repo,
  body: {
    content: '',
    message: 'Create folder',
  },
})
