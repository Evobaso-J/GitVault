import { describe, expect, it } from 'vitest'
import { getVaultLabel } from './config'

describe('getVaultLabel', () => {
  it('drops the legacy prefix', () => expect(getVaultLabel('gitvault-personal')).toBe('personal'))
  it('keeps names without the prefix', () => expect(getVaultLabel('photos')).toBe('photos'))
})
