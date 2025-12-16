/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getBudgetSettings, upsertBudgetSettings } from './budgetSettingsService'
import { hashUserId } from '../utils/hashUserId'

// SupabaseとhashUserIdをモック化
vi.mock('../utils/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

vi.mock('../utils/hashUserId', () => ({
  hashUserId: vi.fn(),
}))

describe('budgetSettingsService', () => {
  let mockSupabase: typeof import('../utils/supabase')
  const mockHashUserId = hashUserId as ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockHashUserId.mockResolvedValue('hashed-user-id')
    mockSupabase = await import('../utils/supabase')
  })

  describe('getBudgetSettings', () => {
    it('設定データが存在する場合、start_dayを返す', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: { start_day: 15 },
        error: null,
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      } as any)
      mockEq.mockReturnValue({
        single: mockSingle,
      } as any)

      const result = await getBudgetSettings('user-id')

      expect(result).toBe(15)
      expect(mockHashUserId).toHaveBeenCalledWith('user-id')
    })

    it('設定データが存在しない場合、デフォルト値1を返す', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      } as any)
      mockEq.mockReturnValue({
        single: mockSingle,
      } as any)

      const result = await getBudgetSettings('user-id')

      expect(result).toBe(1)
    })

    it('PGRST116以外のエラーの場合、エラーをスローする', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'OTHER_ERROR', message: 'Some error' },
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      } as any)
      mockEq.mockReturnValue({
        single: mockSingle,
      } as any)

      await expect(getBudgetSettings('user-id')).rejects.toEqual({
        code: 'OTHER_ERROR',
        message: 'Some error',
      })
    })
  })

  describe('upsertBudgetSettings', () => {
    it('既存の設定がある場合、更新する', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'settings-id' },
        error: null,
      })
      const mockUpdate = vi.fn().mockReturnThis()
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
        update: mockUpdate,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      } as any)
      mockEq.mockReturnValue({
        single: mockSingle,
      } as any)
      mockUpdate.mockReturnValue({
        eq: mockUpdateEq,
      } as any)

      await upsertBudgetSettings('user-id', 20)

      expect(mockUpdate).toHaveBeenCalledWith({ start_day: 20 })
      expect(mockUpdateEq).toHaveBeenCalled()
    })

    it('既存の設定がない場合、新規作成する', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })
      const mockInsert = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      } as any)
      mockEq.mockReturnValue({
        single: mockSingle,
      } as any)

      await upsertBudgetSettings('user-id', 20)

      expect(mockInsert).toHaveBeenCalledWith({
        hashed_user_id: 'hashed-user-id',
        start_day: 20,
      })
    })

    it('更新時にエラーが発生した場合、エラーをスローする', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'settings-id' },
        error: null,
      })
      const mockUpdate = vi.fn().mockReturnThis()
      const mockUpdateEq = vi.fn().mockResolvedValue({
        error: { message: 'Update error' },
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
        update: mockUpdate,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      } as any)
      mockEq.mockReturnValue({
        single: mockSingle,
      } as any)
      mockUpdate.mockReturnValue({
        eq: mockUpdateEq,
      } as any)

      await expect(upsertBudgetSettings('user-id', 20)).rejects.toEqual({
        message: 'Update error',
      })
    })

    it('作成時にエラーが発生した場合、エラーをスローする', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })
      const mockInsert = vi.fn().mockResolvedValue({
        error: { message: 'Insert error' },
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      } as any)
      mockEq.mockReturnValue({
        single: mockSingle,
      } as any)

      await expect(upsertBudgetSettings('user-id', 20)).rejects.toEqual({
        message: 'Insert error',
      })
    })
  })
})
