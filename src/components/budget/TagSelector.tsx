import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import * as tagService from '../../services/tagService'
import type { Tables } from '../../types/supabase'

type Tag = Tables<'tags'>

interface TagSelectorProps {
  userId: string
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
  disabled?: boolean
}

export function TagSelector({
  userId,
  selectedTagIds,
  onChange,
  disabled = false,
}: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newTagText, setNewTagText] = useState('')
  const [isCreatingTag, setIsCreatingTag] = useState(false)

  useEffect(() => {
    loadTags()
  }, [userId])

  const loadTags = async () => {
    try {
      setIsLoading(true)
      const tagsData = await tagService.getTags(userId)
      setTags(tagsData)
    } catch (error) {
      console.error('タグの取得に失敗しました:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagText.trim() || isCreatingTag) return

    try {
      setIsCreatingTag(true)
      const newTag = await tagService.createTag(userId, newTagText.trim())
      setTags((prev) => [newTag, ...prev])
      setNewTagText('')
      // 新しく作成したタグを選択状態にする
      onChange([...selectedTagIds, newTag.id])
    } catch (error) {
      console.error('タグの作成に失敗しました:', error)
    } finally {
      setIsCreatingTag(false)
    }
  }

  const handleTagToggle = (tagId: string) => {
    if (disabled) return

    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }

  // 文字色を決定する関数（背景色のコントラストを確保）
  const getTextColor = (color: string): string => {
    // 背景色の明度に応じて文字色を決定
    if (color.startsWith('hsl')) {
      // HSL形式から明度を抽出 (例: "hsl(120, 70%, 50%)" から 50 を取得)
      const lightnessMatch = color.match(/(\d+(?:\.\d+)?)%/)
      if (lightnessMatch) {
        const lightness = parseFloat(lightnessMatch[1])
        // 明度が65%以上なら黒、それ以下なら白
        return lightness >= 65 ? '#000000' : '#ffffff'
      }
    }
    // デフォルトは白（タグの色は通常45-60%の明度で生成されるため）
    return '#ffffff'
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">読み込み中...</div>
  }

  return (
    <div className="space-y-3">
      <Label>タグ</Label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagToggle(tag.id)}
              disabled={disabled}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? 'ring-2 ring-offset-2'
                  : 'opacity-70 hover:opacity-100'
              } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                backgroundColor: tag.color,
                color: getTextColor(tag.color),
                borderColor: tag.color,
                borderWidth: isSelected ? 2 : 1,
              }}
            >
              {tag.text}
            </button>
          )
        })}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="新しいタグを追加"
          value={newTagText}
          onChange={(e) => setNewTagText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleCreateTag()
            }
          }}
          disabled={disabled || isCreatingTag}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleCreateTag}
          disabled={disabled || isCreatingTag || !newTagText.trim()}
          size="sm"
        >
          {isCreatingTag ? '追加中...' : '追加'}
        </Button>
      </div>
    </div>
  )
}

