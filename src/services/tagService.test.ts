/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createTag,
  updateTag,
  addTagsToExpense,
  updateExpenseTags,
  getTagsForExpenses,
} from './tagService'
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

describe('tagService', () => {
  let mockSupabase: typeof import('../utils/supabase')
  const mockHashUserId = hashUserId as ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockHashUserId.mockResolvedValue('hashed-user-id')
    mockSupabase = await import('../utils/supabase')
  })

  describe('createTag', () => {
    it('colorが未指定の場合、ランダムな色を生成する', async () => {
      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: 'tag-id',
          text: 'Test Tag',
          color: 'hsl(180, 75%, 50%)',
        },
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

      const result = await createTag('user-id', 'Test Tag')

      expect(result).toBeDefined()
      expect(result.text).toBe('Test Tag')
      expect(result.color).toBeDefined()
      expect(mockInsert).toHaveBeenCalled()
    })

    it('colorが指定されている場合、その色を使用する', async () => {
      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: 'tag-id',
          text: 'Test Tag',
          color: '#ff0000',
        },
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

      const result = await createTag('user-id', 'Test Tag', '#ff0000')

      expect(result.color).toBe('#ff0000')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          color: '#ff0000',
        })
      )
    })
  })

  describe('updateTag', () => {
    it('colorが指定されている場合、colorを含めて更新する', async () => {
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({
        eq: mockEq,
      } as any)

      await updateTag('tag-id', 'Updated Tag', '#00ff00')

      expect(mockUpdate).toHaveBeenCalledWith({
        text: 'Updated Tag',
        color: '#00ff00',
      })
    })

    it('colorが未指定の場合、textのみを更新する', async () => {
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({
        eq: mockEq,
      } as any)

      await updateTag('tag-id', 'Updated Tag')

      expect(mockUpdate).toHaveBeenCalledWith({
        text: 'Updated Tag',
      })
      expect(mockUpdate).not.toHaveBeenCalledWith(
        expect.objectContaining({
          color: expect.anything(),
        })
      )
    })
  })

  describe('addTagsToExpense', () => {
    it('tagIds.length === 0の場合、何も実行しない', async () => {
      await addTagsToExpense('expense-id', [])

      expect(mockSupabase.supabase.from).not.toHaveBeenCalled()
    })

    it('tagIds.length > 0の場合、タグを追加する', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)

      await addTagsToExpense('expense-id', ['tag-id-1', 'tag-id-2'])

      expect(mockInsert).toHaveBeenCalledWith([
        { expense_id: 'expense-id', tag_id: 'tag-id-1' },
        { expense_id: 'expense-id', tag_id: 'tag-id-2' },
      ])
    })

    it('エラーが発生した場合、エラーをスローする', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        error: { message: 'Insert error' },
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)

      await expect(
        addTagsToExpense('expense-id', ['tag-id-1'])
      ).rejects.toEqual({
        message: 'Insert error',
      })
    })
  })

  describe('updateExpenseTags', () => {
    it('tagIds.length > 0の場合、既存のタグを削除して新しいタグを追加する', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockDeleteEq = vi.fn().mockResolvedValue({ error: null })
      const mockInsert = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        delete: mockDelete,
        insert: mockInsert,
      } as any)
      mockDelete.mockReturnValue({
        eq: mockDeleteEq,
      } as any)

      await updateExpenseTags('expense-id', ['tag-id-1', 'tag-id-2'])

      expect(mockDelete).toHaveBeenCalled()
      expect(mockInsert).toHaveBeenCalled()
    })

    it('tagIds.length === 0の場合、既存のタグのみを削除する', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockDeleteEq = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)
      mockDelete.mockReturnValue({
        eq: mockDeleteEq,
      } as any)

      await updateExpenseTags('expense-id', [])

      expect(mockDelete).toHaveBeenCalled()
      expect(mockSupabase.supabase.from).not.toHaveBeenCalledWith(
        expect.anything(),
        'insert'
      )
    })

    it('削除時にエラーが発生した場合、エラーをスローする', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockDeleteEq = vi.fn().mockResolvedValue({
        error: { message: 'Delete error' },
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)
      mockDelete.mockReturnValue({
        eq: mockDeleteEq,
      } as any)

      await expect(
        updateExpenseTags('expense-id', ['tag-id-1'])
      ).rejects.toEqual({
        message: 'Delete error',
      })
    })
  })

  describe('getTagsForExpenses', () => {
    it('expenseIds.length === 0の場合、空のオブジェクトを返す', async () => {
      const result = await getTagsForExpenses([])

      expect(result).toEqual({})
      expect(mockSupabase.supabase.from).not.toHaveBeenCalled()
    })

    it('expenseIds.length > 0の場合、タグを取得する', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockIn = vi.fn().mockResolvedValue({
        data: [
          {
            expense_id: 'expense-id-1',
            tag_id: 'tag-id-1',
            tags: { id: 'tag-id-1', text: 'Tag 1' },
          },
          {
            expense_id: 'expense-id-2',
            tag_id: 'tag-id-2',
            tags: { id: 'tag-id-2', text: 'Tag 2' },
          },
        ],
        error: null,
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        in: mockIn,
      } as any)

      const result = await getTagsForExpenses(['expense-id-1', 'expense-id-2'])

      expect(result).toHaveProperty('expense-id-1')
      expect(result).toHaveProperty('expense-id-2')
      expect(result['expense-id-1']).toHaveLength(1)
      expect(result['expense-id-2']).toHaveLength(1)
    })

    it('タグが存在しない支出IDも空配列で含まれる', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockIn = vi.fn().mockResolvedValue({
        data: [
          {
            expense_id: 'expense-id-1',
            tag_id: 'tag-id-1',
            tags: { id: 'tag-id-1', text: 'Tag 1' },
          },
        ],
        error: null,
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        in: mockIn,
      } as any)

      const result = await getTagsForExpenses([
        'expense-id-1',
        'expense-id-2',
      ])

      expect(result['expense-id-1']).toHaveLength(1)
      expect(result['expense-id-2']).toHaveLength(0)
    })

    it('エラーが発生した場合、エラーをスローする', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockIn = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Select error' },
      })

      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        in: mockIn,
      } as any)

      await expect(
        getTagsForExpenses(['expense-id-1'])
      ).rejects.toEqual({
        message: 'Select error',
      })
    })
  })
})
