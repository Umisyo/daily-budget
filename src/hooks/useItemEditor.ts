import { useState } from 'react'

/**
 * アイテム編集の状態管理を行う汎用フック
 * @param initialEditingId 初期編集ID（オプション）
 * @returns 編集状態と操作関数
 */
export function useItemEditor<T extends { id: string }>(initialEditingId: string | null = null) {
  const [editingId, setEditingId] = useState<string | null>(initialEditingId)

  const startEdit = (item: T) => {
    setEditingId(item.id)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const isEditing = (item: T) => {
    return editingId === item.id
  }

  const isAnyEditing = () => {
    return editingId !== null
  }

  return {
    editingId,
    startEdit,
    cancelEdit,
    isEditing,
    isAnyEditing,
  }
}

