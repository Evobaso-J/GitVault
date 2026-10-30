/** `docs/a.txt` → `docs/a (1).txt` */
export const withCopyNumber = (path: string, copy: number) => {
  const slash = path.lastIndexOf('/') + 1
  const name = path.slice(slash)
  const dot = name.lastIndexOf('.')
  const [stem, extension] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, '']
  return `${path.slice(0, slash)}${stem} (${copy})${extension}`
}
