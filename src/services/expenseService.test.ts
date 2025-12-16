/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createExpense, updateExpense } from './expenseService'
import { hashUserId } from '../utils/hashUserId'
import { updateExpenseTags } from './tagService'

// Supabase、hashUserId、tagServiceをモック化
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
    start: new Date('2024-01-15'),
    end: new Date('2024-02-14'),
  })),
  formatLocalDate: vi.fn((date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }),
}))

vi.mock('./tagService', () => ({
  updateExpenseTags: vi.fn(),
}))

describe('expenseService', () => {
  let mockSupabase: typeof import('../utils/supabase')
  const mockHashUserId = hashUserId as ReturnType<typeof vi.fn>
  const mockUpdateExpenseTags = updateExpenseTags as ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockHashUserId.mockResolvedValue('hashed-user-id')
    mockSupabase = await import('../utils/supabase')
  })

  describe('createExpense', () => {
    it('タグIDが存在し、length > 0の場合、タグを関連付ける', async () => {
      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'expense-id' },
        error: null,
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)
      mockInsert.mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        single: mockSingle,
      } as any)
      mockUpdateExpenseTags.mockResolvedValue(undefined)

      await createExpense('user-id', 1000, '2024-01-20', 'Test', 'cash', [
        'tag-id-1',
        'tag-id-2',
      ])

      expect(mockUpdateExpenseTags).toHaveBeenCalledWith('expense-id', [
        'tag-id-1',
        'tag-id-2',
      ])
    })

    it('タグIDが存在しない場合、タグを関連付けない', async () => {
      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'expense-id' },
        error: null,
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)
      mockInsert.mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        single: mockSingle,
      } as any)

      await createExpense('user-id', 1000, '2024-01-20', 'Test', 'cash')

      expect(mockUpdateExpenseTags).not.toHaveBeenCalled()
    })

    it('タグIDが空配列の場合、タグを関連付けない', async () => {
      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'expense-id' },
        error: null,
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)
      mockInsert.mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        single: mockSingle,
      } as any)

      await createExpense('user-id', 1000, '2024-01-20', 'Test', 'cash', [])

      expect(mockUpdateExpenseTags).not.toHaveBeenCalled()
    })

    it('エラーが発生した場合、エラーをスローする', async () => {
      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Insert error' },
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)
      mockInsert.mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        single: mockSingle,
      } as any)

      await expect(
        createExpense('user-id', 1000, '2024-01-20')
      ).rejects.toEqual({
        message: 'Insert error',
      })
    })
  })

  describe('updateExpense', () => {
    it('tagIdsがundefinedでない場合、タグを更新する', async () => {
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({
        eq: mockEq,
      } as any)
      mockUpdateExpenseTags.mockResolvedValue(undefined)

      await updateExpense(
        'expense-id',
        2000,
        '2024-01-25',
        'Updated',
        'card',
        ['tag-id-1']
      )

      expect(mockUpdateExpenseTags).toHaveBeenCalledWith('expense-id', [
        'tag-id-1',
      ])
    })

    it('tagIdsがundefinedの場合、タグを更新しない', async () => {
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({
        eq: mockEq,
      } as any)

      await updateExpense('expense-id', 2000, '2024-01-25', 'Updated', 'card')

      expect(mockUpdateExpenseTags).not.toHaveBeenCalled()
    })

    it('tagIdsが空配列の場合、タグを更新する（タグを削除）', async () => {
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({
        eq: mockEq,
      } as any)
      mockUpdateExpenseTags.mockResolvedValue(undefined)

      await updateExpense('expense-id', 2000, '2024-01-25', 'Updated', 'card', [])

      expect(mockUpdateExpenseTags).toHaveBeenCalledWith('expense-id', [])
    })

    it('エラーが発生した場合、エラーをスローする', async () => {
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({
        error: { message: 'Update error' },
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({
        eq: mockEq,
      } as any)

      await expect(
        updateExpense('expense-id', 2000, '2024-01-25')
      ).rejects.toEqual({
        message: 'Update error',
      })
    })
  })
})
