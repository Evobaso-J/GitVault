import type { GhRepoCommitsResponseData } from '~~/server/resources/gitHubRepoCommits'

export type BackupRuns = {
  /** Date of the newest automatic backup commit */
  lastAt?: string
  /** Files received in the last 24 hours: one commit each */
  countLast24h: number
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Automatic backups are the commits with the `BACKUP_COMMIT_MESSAGE` marker (newest first from GitHub) */
export const parseBackupRuns = (commits: GhRepoCommitsResponseData | null | undefined, now = Date.now()): BackupRuns => {
  const dates = (commits ?? [])
    .filter(commit => commit.commit.message === BACKUP_COMMIT_MESSAGE)
    .flatMap(commit => commit.commit.committer?.date ?? commit.commit.author?.date ?? [])
    .sort()
    .reverse()
  return {
    lastAt: dates[0],
    countLast24h: dates.filter(date => now - new Date(date).getTime() < DAY_MS).length,
  }
}
