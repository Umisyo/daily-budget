/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getBudget, upsertBudget } from './budgetService'
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

vi.mock('../utils/budgetPeriod', () => ({
  calculateBudgetPeriod: vi.fn(() => ({
    startYear: 2024,
    startMonth: 1,
    endYear: 2024,
    endMonth: 2,
  })),
}))

describe('budgetService', () => {
  let mockSupabase: typeof import('../utils/supabase')
  const mockHashUserId = hashUserId as ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockHashUserId.mockResolvedValue('hashed-user-id')
    mockSupabase = await import('../utils/supabase')
  })

  describe('getBudget', () => {
    it('予算データが存在する場合、金額を返す', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { amount: 10000 },
        error: null,
      })
      const mockEq3 = vi.fn().mockReturnValue({
        single: mockSingle,
      })
      const mockEq2 = vi.fn().mockReturnValue({
        eq: mockEq3,
      })
      const mockEq1 = vi.fn().mockReturnValue({
        eq: mockEq2,
      })
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq1,
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)

      const result = await getBudget('user-id', 15)

      expect(result).toBe(10000)
      expect(mockHashUserId).toHaveBeenCalledWith('user-id')
    })

    it('予算データが存在しない場合、nullを返す', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })
      const mockEq3 = vi.fn().mockReturnValue({
        single: mockSingle,
      })
      const mockEq2 = vi.fn().mockReturnValue({
        eq: mockEq3,
      })
      const mockEq1 = vi.fn().mockReturnValue({
        eq: mockEq2,
      })
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq1,
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)

      const result = await getBudget('user-id', 15)

      expect(result).toBeNull()
    })

    it('PGRST116以外のエラーの場合、エラーをスローする', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'OTHER_ERROR', message: 'Some error' },
      })
      const mockEq3 = vi.fn().mockReturnValue({
        single: mockSingle,
      })
      const mockEq2 = vi.fn().mockReturnValue({
        eq: mockEq3,
      })
      const mockEq1 = vi.fn().mockReturnValue({
        eq: mockEq2,
      })
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq1,
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)

      await expect(getBudget('user-id', 15)).rejects.toEqual({
        code: 'OTHER_ERROR',
        message: 'Some error',
      })
    })
  })

  describe('upsertBudget', () => {
    it('既存の予算がある場合、更新する', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'budget-id' },
        error: null,
      })
      const mockEq3 = vi.fn().mockReturnValue({
        single: mockSingle,
      })
      const mockEq2 = vi.fn().mockReturnValue({
        eq: mockEq3,
      })
      const mockEq1 = vi.fn().mockReturnValue({
        eq: mockEq2,
      })
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq1,
      })
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockUpdateEq,
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
        update: mockUpdate,
      } as any)

      await upsertBudget('user-id', 20000, 15)

      expect(mockUpdate).toHaveBeenCalled()
      expect(mockUpdateEq).toHaveBeenCalled()
    })

    it('既存の予算がない場合、新規作成する', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })
      const mockEq3 = vi.fn().mockReturnValue({
        single: mockSingle,
      })
      const mockEq2 = vi.fn().mockReturnValue({
        eq: mockEq3,
      })
      const mockEq1 = vi.fn().mockReturnValue({
        eq: mockEq2,
      })
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq1,
      })
      const mockInsert = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      } as any)

      await upsertBudget('user-id', 20000, 15)

      expect(mockInsert).toHaveBeenCalled()
    })

    it('更新時にエラーが発生した場合、エラーをスローする', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'budget-id' },
        error: null,
      })
      const mockEq3 = vi.fn().mockReturnValue({
        single: mockSingle,
      })
      const mockEq2 = vi.fn().mockReturnValue({
        eq: mockEq3,
      })
      const mockEq1 = vi.fn().mockReturnValue({
        eq: mockEq2,
      })
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq1,
      })
      const mockUpdateEq = vi.fn().mockResolvedValue({
        error: { message: 'Update error' },
      })
      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockUpdateEq,
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
        update: mockUpdate,
      } as any)

      await expect(upsertBudget('user-id', 20000, 15)).rejects.toEqual({
        message: 'Update error',
      })
    })

    it('作成時にエラーが発生した場合、エラーをスローする', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })
      const mockEq3 = vi.fn().mockReturnValue({
        single: mockSingle,
      })
      const mockEq2 = vi.fn().mockReturnValue({
        eq: mockEq3,
      })
      const mockEq1 = vi.fn().mockReturnValue({
        eq: mockEq2,
      })
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq1,
      })
      const mockInsert = vi.fn().mockResolvedValue({
        error: { message: 'Insert error' },
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      } as any)

      await expect(upsertBudget('user-id', 20000, 15)).rejects.toEqual({
        message: 'Insert error',
      })
    })
  })
})
