import { supabase } from '../utils/supabase'
import { hashUserId } from '../utils/hashUserId'
import type { Tables } from '../types/supabase'

type Tag = Tables<'tags'>

/**
 * ランダムな色を生成（HSL形式）
 */
function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360)
  const saturation = 60 + Math.floor(Math.random() * 30) // 60-90%
  const lightness = 45 + Math.floor(Math.random() * 15) // 45-60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/**
 * タグデータの取得
 */
export async function getTags(userId: string): Promise<Tag[]> {
  const hashedUserId = await hashUserId(userId)

  const { data: tagsData, error: tagsError } = await supabase
    .from('tags')
    .select('*')
    .eq('hashed_user_id', hashedUserId)
    .order('created_at', { ascending: false })

  if (tagsError) {
    throw tagsError
  }

  return tagsData || []
}

/**
 * タグデータの作成
 */
export async function createTag(
  userId: string,
  text: string,
  color?: string
): Promise<Tag> {
  const hashedUserId = await hashUserId(userId)
  const tagColor = color || generateRandomColor()

  const { data, error } = await supabase
    .from('tags')
    .insert({
      hashed_user_id: hashedUserId,
      text,
      color: tagColor,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * タグデータの更新
 */
export async function updateTag(
  id: string,
  text: string,
  color?: string
): Promise<void> {
  const updateData: { text: string; color?: string } = { text }
  if (color) {
    updateData.color = color
  }

  const { error } = await supabase
    .from('tags')
    .update(updateData)
    .eq('id', id)

  if (error) throw error
}

/**
 * タグデータの削除
 */
export async function deleteTag(id: string): Promise<void> {
  const { error } = await supabase.from('tags').delete().eq('id', id)

  if (error) throw error
}

/**
 * 支出にタグを関連付け
 */
export async function addTagsToExpense(
  expenseId: string,
  tagIds: string[]
): Promise<void> {
  if (tagIds.length === 0) return

  const expenseTags = tagIds.map((tagId) => ({
    expense_id: expenseId,
    tag_id: tagId,
  }))

  const { error } = await supabase.from('expense_tags').insert(expenseTags)

  if (error) throw error
}

/**
 * 支出のタグを更新（既存のタグを削除して新しいタグを追加）
 */
export async function updateExpenseTags(
  expenseId: string,
  tagIds: string[]
): Promise<void> {
  // 既存のタグを削除
  const { error: deleteError } = await supabase
    .from('expense_tags')
    .delete()
    .eq('expense_id', expenseId)

  if (deleteError) throw deleteError

  // 新しいタグを追加
  if (tagIds.length > 0) {
    await addTagsToExpense(expenseId, tagIds)
  }
}

/**
 * 支出に紐づくタグを取得
 */
export async function getTagsForExpense(expenseId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('expense_tags')
    .select('tag_id, tags(*)')
    .eq('expense_id', expenseId)

  if (error) throw error

  return (data || []).map((item: any) => item.tags).filter(Boolean)
}

/**
 * 複数の支出に紐づくタグを一括取得
 */
export async function getTagsForExpenses(
  expenseIds: string[]
): Promise<Record<string, Tag[]>> {
  if (expenseIds.length === 0) return {}

  const { data, error } = await supabase
    .from('expense_tags')
    .select('expense_id, tag_id, tags(*)')
    .in('expense_id', expenseIds)

  if (error) throw error

  const result: Record<string, Tag[]> = {}
  expenseIds.forEach((id) => {
    result[id] = []
  })

  ;(data || []).forEach((item: any) => {
    if (item.tags && result[item.expense_id]) {
      result[item.expense_id].push(item.tags)
    }
  })

  return result
}

