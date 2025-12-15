import type { Tables } from '../../types/supabase'

type Tag = Tables<'tags'>

interface TagDisplayProps {
  tags: Tag[]
}

export function TagDisplay({ tags }: TagDisplayProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${tag.color}40`,
            color: tag.color,
            borderColor: tag.color,
            borderWidth: 1,
          }}
        >
          {tag.text}
        </span>
      ))}
    </div>
  )
}

