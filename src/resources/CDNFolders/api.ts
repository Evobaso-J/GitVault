import { $putFile } from '../CDNFiles/api'

export const $createFolder = (path: string) => $putFile({
  path,
  body: {
    content: '',
    message: 'Create folder',
  },
})
