import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('hashUserId', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('saltが設定されている場合、ハッシュ値を返す', async () => {
    vi.stubEnv('VITE_HASH_SALT', 'test-salt')
    const { hashUserId } = await import('./hashUserId')

    const userId = 'test-user-id'
    const result = await hashUserId(userId)

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(result.length).toBe(64) // SHA-256のハッシュは64文字の16進数
  })

  it('同じuserIdとsaltで同じハッシュ値を返す', async () => {
    vi.stubEnv('VITE_HASH_SALT', 'test-salt')
    const { hashUserId } = await import('./hashUserId')

    const userId = 'test-user-id'
    const result1 = await hashUserId(userId)
    const result2 = await hashUserId(userId)

    expect(result1).toBe(result2)
  })

  it('異なるuserIdで異なるハッシュ値を返す', async () => {
    vi.stubEnv('VITE_HASH_SALT', 'test-salt')
    const { hashUserId } = await import('./hashUserId')

    const result1 = await hashUserId('user1')
    const result2 = await hashUserId('user2')

    expect(result1).not.toBe(result2)
  })

  it('saltが未設定の場合、エラーをスローする', async () => {
    // モジュールをリセットして環境変数が未設定の状態でインポート
    vi.resetModules()
    // 環境変数を明示的に削除
    delete (import.meta.env as any).VITE_HASH_SALT
    
    const { hashUserId } = await import('./hashUserId')
    
    await expect(hashUserId('test-user-id')).rejects.toThrow(
      'VITE_HASH_SALT environment variable is not set'
    )
  })

  it('空文字列のsaltでもエラーをスローする', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_HASH_SALT', '')
    const { hashUserId } = await import('./hashUserId')

    await expect(hashUserId('test-user-id')).rejects.toThrow(
      'VITE_HASH_SALT environment variable is not set'
    )
  })
})
