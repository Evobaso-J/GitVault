import { describe, expect, it } from 'vitest'
import type { GhRepoCommitsResponseData } from '~~/server/resources/gitHubRepoCommits'
import { parseBackupRuns } from './parse'

const now = new Date('2026-10-31T12:00:00Z').getTime()
const commit = (message: string, date: string) => ({ commit: { message, committer: { date } } }) as GhRepoCommitsResponseData[number]

describe('parseBackupRuns', () => {
  it('keeps only automatic backup commits: newest date, count of the last 24 hours', () => {
    expect(parseBackupRuns([
      commit('feat: upload file', '2026-10-31T11:00:00Z'),
      commit('feat: phone backup', '2026-10-31T02:00:00Z'),
      commit('feat: phone backup', '2026-10-31T02:01:00Z'),
      commit('feat: phone backup', '2026-10-29T02:00:00Z'),
    ], now)).toEqual({ lastAt: '2026-10-31T02:01:00Z', countLast24h: 2 })
  })

  it('reports no run without marker commits', () => {
    expect(parseBackupRuns([commit('feat: upload file', '2026-10-31T11:00:00Z')], now)).toEqual({ lastAt: undefined, countLast24h: 0 })
    expect(parseBackupRuns(null, now)).toEqual({ lastAt: undefined, countLast24h: 0 })
  })
})
