'use client'

import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  GripVertical,
  Plus,
  Trash2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Image,
} from 'lucide-react'

export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'numberedList'
  | 'checkList'
  | 'quote'
  | 'code'
  | 'divider'

export interface Block {
  id: string
  type: BlockType
  content: string
  checked?: boolean // for checkList
  metadata?: Record<string, unknown>
}

interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

const blockTypeConfig: Record<BlockType, {
  icon: typeof Type
  label: string
  placeholder: string
  className: string
}> = {
  paragraph: {
    icon: Type,
    label: 'Text',
    placeholder: "Type '/' for commands...",
    className: 'text-base',
  },
  heading1: {
    icon: Heading1,
    label: 'Heading 1',
    placeholder: 'Heading 1',
    className: 'text-3xl font-bold',
  },
  heading2: {
    icon: Heading2,
    label: 'Heading 2',
    placeholder: 'Heading 2',
    className: 'text-2xl font-semibold',
  },
  heading3: {
    icon: Heading3,
    label: 'Heading 3',
    placeholder: 'Heading 3',
    className: 'text-xl font-medium',
  },
  bulletList: {
    icon: List,
    label: 'Bullet List',
    placeholder: 'List item',
    className: 'text-base',
  },
  numberedList: {
    icon: ListOrdered,
    label: 'Numbered List',
    placeholder: 'List item',
    className: 'text-base',
  },
  checkList: {
    icon: CheckSquare,
    label: 'To-do List',
    placeholder: 'To-do',
    className: 'text-base',
  },
  quote: {
    icon: Quote,
    label: 'Quote',
    placeholder: 'Quote',
    className: 'text-base italic border-l-4 border-muted-foreground/30 pl-4',
  },
  code: {
    icon: Code,
    label: 'Code',
    placeholder: 'Code',
    className: 'font-mono text-sm bg-muted rounded px-2 py-1',
  },
  divider: {
    icon: Minus,
    label: 'Divider',
    placeholder: '',
    className: '',
  },
}

const slashCommands: { type: BlockType; label: string; icon: typeof Type; description: string }[] = [
  { type: 'paragraph', label: 'Text', icon: Type, description: 'Plain text block' },
  { type: 'heading1', label: 'Heading 1', icon: Heading1, description: 'Large section heading' },
  { type: 'heading2', label: 'Heading 2', icon: Heading2, description: 'Medium section heading' },
  { type: 'heading3', label: 'Heading 3', icon: Heading3, description: 'Small section heading' },
  { type: 'bulletList', label: 'Bullet List', icon: List, description: 'Unordered list' },
  { type: 'numberedList', label: 'Numbered List', icon: ListOrdered, description: 'Ordered list' },
  { type: 'checkList', label: 'To-do List', icon: CheckSquare, description: 'Checklist items' },
  { type: 'quote', label: 'Quote', icon: Quote, description: 'Quoted text block' },
  { type: 'code', label: 'Code', icon: Code, description: 'Code snippet' },
  { type: 'divider', label: 'Divider', icon: Minus, description: 'Horizontal line' },
]

function generateId() {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function BlockEditor({ blocks, onChange, placeholder, className, minHeight = '300px' }: BlockEditorProps) {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuFilter, setSlashMenuFilter] = useState('')
  const [slashMenuIndex, setSlashMenuIndex] = useState(0)
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null)
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)

  const blockRefs = useRef<Record<string, HTMLElement | null>>({})
  const slashMenuRef = useRef<HTMLDivElement>(null)

  // Filter slash commands
  const filteredCommands = slashCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(slashMenuFilter.toLowerCase()) ||
    cmd.description.toLowerCase().includes(slashMenuFilter.toLowerCase())
  )

  // Create a new block
  const createBlock = useCallback((type: BlockType = 'paragraph'): Block => ({
    id: generateId(),
    type,
    content: '',
    checked: type === 'checkList' ? false : undefined,
  }), [])

  // Initialize with empty block if no blocks
  useEffect(() => {
    if (blocks.length === 0) {
      onChange([createBlock()])
    }
  }, [blocks.length, onChange, createBlock])

  // Update block content
  const updateBlock = (id: string, updates: Partial<Block>) => {
    const newBlocks = blocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    )
    onChange(newBlocks)
  }

  // Insert block after a specific block
  const insertBlockAfter = (afterId: string, type: BlockType = 'paragraph') => {
    const index = blocks.findIndex(b => b.id === afterId)
    const newBlock = createBlock(type)
    const newBlocks = [
      ...blocks.slice(0, index + 1),
      newBlock,
      ...blocks.slice(index + 1),
    ]
    onChange(newBlocks)

    // Focus the new block
    setTimeout(() => {
      blockRefs.current[newBlock.id]?.focus()
    }, 0)

    return newBlock.id
  }

  // Delete block
  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      // Don't delete the last block, just clear it
      updateBlock(id, { content: '', type: 'paragraph' })
      return
    }

    const index = blocks.findIndex(b => b.id === id)
    const newBlocks = blocks.filter(b => b.id !== id)
    onChange(newBlocks)

    // Focus previous block
    const prevBlock = blocks[index - 1] || blocks[index + 1]
    if (prevBlock) {
      setTimeout(() => {
        blockRefs.current[prevBlock.id]?.focus()
      }, 0)
    }
  }

  // Change block type
  const changeBlockType = (id: string, newType: BlockType) => {
    updateBlock(id, {
      type: newType,
      checked: newType === 'checkList' ? false : undefined,
    })
    setShowSlashMenu(false)
    setSlashMenuFilter('')

    // Re-focus the block
    setTimeout(() => {
      blockRefs.current[id]?.focus()
    }, 0)
  }

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>, block: Block) => {
    const content = block.content

    // Slash command menu
    if (e.key === '/' && content === '') {
      setShowSlashMenu(true)
      setSlashMenuIndex(0)
      return
    }

    // Close slash menu on Escape
    if (e.key === 'Escape' && showSlashMenu) {
      setShowSlashMenu(false)
      setSlashMenuFilter('')
      return
    }

    // Navigate slash menu
    if (showSlashMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSlashMenuIndex(i => Math.min(i + 1, filteredCommands.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSlashMenuIndex(i => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const cmd = filteredCommands[slashMenuIndex]
        if (cmd) {
          // Remove the slash from content
          updateBlock(block.id, { content: '' })
          changeBlockType(block.id, cmd.type)
        }
        return
      }
    }

    // Enter to create new block
    if (e.key === 'Enter' && !e.shiftKey && !showSlashMenu) {
      e.preventDefault()

      if (block.type === 'divider') {
        insertBlockAfter(block.id)
        return
      }

      // If content is empty and it's a list, convert to paragraph
      if (content === '' && ['bulletList', 'numberedList', 'checkList'].includes(block.type)) {
        changeBlockType(block.id, 'paragraph')
        return
      }

      // Create new block of same type for lists
      const newType = ['bulletList', 'numberedList', 'checkList'].includes(block.type)
        ? block.type
        : 'paragraph'
      insertBlockAfter(block.id, newType)
      return
    }

    // Backspace on empty block
    if (e.key === 'Backspace' && content === '') {
      e.preventDefault()

      // If not a paragraph, convert to paragraph first
      if (block.type !== 'paragraph') {
        changeBlockType(block.id, 'paragraph')
        return
      }

      deleteBlock(block.id)
      return
    }

    // Arrow key navigation between blocks
    if (e.key === 'ArrowUp' && !showSlashMenu) {
      const index = blocks.findIndex(b => b.id === block.id)
      if (index > 0) {
        const prevBlock = blocks[index - 1]
        blockRefs.current[prevBlock.id]?.focus()
      }
    }

    if (e.key === 'ArrowDown' && !showSlashMenu) {
      const index = blocks.findIndex(b => b.id === block.id)
      if (index < blocks.length - 1) {
        const nextBlock = blocks[index + 1]
        blockRefs.current[nextBlock.id]?.focus()
      }
    }
  }

  // Handle input for slash command filtering
  const handleInput = (e: React.FormEvent<HTMLElement>, block: Block) => {
    const target = e.target as HTMLElement
    const content = target.innerText || ''

    updateBlock(block.id, { content })

    // Update slash menu filter
    if (showSlashMenu && content.startsWith('/')) {
      setSlashMenuFilter(content.slice(1))
      setSlashMenuIndex(0)
    } else if (showSlashMenu && !content.startsWith('/')) {
      setShowSlashMenu(false)
      setSlashMenuFilter('')
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (draggedBlockId && draggedBlockId !== targetId) {
      const dragIndex = blocks.findIndex(b => b.id === draggedBlockId)
      const targetIndex = blocks.findIndex(b => b.id === targetId)

      if (dragIndex !== targetIndex) {
        const newBlocks = [...blocks]
        const [removed] = newBlocks.splice(dragIndex, 1)
        newBlocks.splice(targetIndex, 0, removed)
        onChange(newBlocks)
      }
    }
  }

  const handleDragEnd = () => {
    setDraggedBlockId(null)
  }

  // Get list item number
  const getListNumber = (block: Block) => {
    if (block.type !== 'numberedList') return 0
    let count = 1
    for (const b of blocks) {
      if (b.id === block.id) break
      if (b.type === 'numberedList') count++
      else count = 1
    }
    return count
  }

  return (
    <div
      className={cn('relative', className)}
      style={{ minHeight }}
    >
      <div className="space-y-1">
        {blocks.map((block, index) => {
          const config = blockTypeConfig[block.type]
          const isHovered = hoveredBlockId === block.id
          const isFocused = focusedBlockId === block.id
          const isDragging = draggedBlockId === block.id

          return (
            <div
              key={block.id}
              className={cn(
                'group relative flex items-start gap-1 rounded-sm transition-colors',
                isDragging && 'opacity-50',
                isHovered && 'bg-muted/30'
              )}
              onMouseEnter={() => setHoveredBlockId(block.id)}
              onMouseLeave={() => setHoveredBlockId(null)}
              onDragOver={(e) => handleDragOver(e, block.id)}
            >
              {/* Drag handle & actions */}
              <div
                className={cn(
                  'flex items-center gap-0.5 opacity-0 transition-opacity shrink-0 pt-1',
                  (isHovered || isFocused) && 'opacity-100'
                )}
              >
                <button
                  className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => handleDragStart(e, block.id)}
                  onDragEnd={handleDragEnd}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  className="p-1 rounded hover:bg-muted"
                  onClick={() => insertBlockAfter(block.id)}
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Block content */}
              <div className="flex-1 min-w-0">
                {block.type === 'divider' ? (
                  <div className="py-3">
                    <hr className="border-muted-foreground/20" />
                  </div>
                ) : block.type === 'checkList' ? (
                  <div className="flex items-start gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={block.checked || false}
                      onChange={(e) => updateBlock(block.id, { checked: e.target.checked })}
                      className="mt-1.5 h-4 w-4 rounded border-muted-foreground/50"
                    />
                    <div
                      ref={(el) => { blockRefs.current[block.id] = el }}
                      contentEditable
                      suppressContentEditableWarning
                      className={cn(
                        'flex-1 outline-none py-1',
                        config.className,
                        block.checked && 'line-through text-muted-foreground'
                      )}
                      onInput={(e) => handleInput(e, block)}
                      onKeyDown={(e) => handleKeyDown(e, block)}
                      onFocus={() => setFocusedBlockId(block.id)}
                      onBlur={() => setFocusedBlockId(null)}
                      data-placeholder={config.placeholder}
                      dangerouslySetInnerHTML={{ __html: block.content || '' }}
                    />
                  </div>
                ) : block.type === 'bulletList' ? (
                  <div className="flex items-start gap-2 py-1">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                    <div
                      ref={(el) => { blockRefs.current[block.id] = el }}
                      contentEditable
                      suppressContentEditableWarning
                      className={cn('flex-1 outline-none py-1', config.className)}
                      onInput={(e) => handleInput(e, block)}
                      onKeyDown={(e) => handleKeyDown(e, block)}
                      onFocus={() => setFocusedBlockId(block.id)}
                      onBlur={() => setFocusedBlockId(null)}
                      data-placeholder={config.placeholder}
                      dangerouslySetInnerHTML={{ __html: block.content || '' }}
                    />
                  </div>
                ) : block.type === 'numberedList' ? (
                  <div className="flex items-start gap-2 py-1">
                    <span className="mt-0.5 text-muted-foreground shrink-0 w-5 text-right">
                      {getListNumber(block)}.
                    </span>
                    <div
                      ref={(el) => { blockRefs.current[block.id] = el }}
                      contentEditable
                      suppressContentEditableWarning
                      className={cn('flex-1 outline-none py-1', config.className)}
                      onInput={(e) => handleInput(e, block)}
                      onKeyDown={(e) => handleKeyDown(e, block)}
                      onFocus={() => setFocusedBlockId(block.id)}
                      onBlur={() => setFocusedBlockId(null)}
                      data-placeholder={config.placeholder}
                      dangerouslySetInnerHTML={{ __html: block.content || '' }}
                    />
                  </div>
                ) : (
                  <div
                    ref={(el) => { blockRefs.current[block.id] = el }}
                    contentEditable
                    suppressContentEditableWarning
                    className={cn(
                      'outline-none py-1 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50',
                      config.className
                    )}
                    onInput={(e) => handleInput(e, block)}
                    onKeyDown={(e) => handleKeyDown(e, block)}
                    onFocus={() => setFocusedBlockId(block.id)}
                    onBlur={() => setFocusedBlockId(null)}
                    data-placeholder={
                      index === 0 && blocks.length === 1 && !block.content
                        ? placeholder || config.placeholder
                        : config.placeholder
                    }
                    dangerouslySetInnerHTML={{ __html: block.content || '' }}
                  />
                )}
              </div>

              {/* Delete button */}
              {blocks.length > 1 && (isHovered || isFocused) && (
                <button
                  className="p-1 rounded hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={() => deleteBlock(block.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Slash command menu */}
      {showSlashMenu && focusedBlockId && (
        <div
          ref={slashMenuRef}
          className="absolute z-50 mt-1 w-72 bg-popover border rounded-lg shadow-lg overflow-hidden"
          style={{
            top: blockRefs.current[focusedBlockId]?.offsetTop ?? 0 + 30,
            left: 40,
          }}
        >
          <div className="p-2 border-b">
            <p className="text-xs text-muted-foreground">Basic blocks</p>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filteredCommands.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No results
              </div>
            ) : (
              filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.type}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors',
                    index === slashMenuIndex ? 'bg-accent' : 'hover:bg-muted'
                  )}
                  onClick={() => {
                    if (focusedBlockId) {
                      updateBlock(focusedBlockId, { content: '' })
                      changeBlockType(focusedBlockId, cmd.type)
                    }
                  }}
                  onMouseEnter={() => setSlashMenuIndex(index)}
                >
                  <div className="p-1.5 rounded bg-muted">
                    <cmd.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{cmd.label}</p>
                    <p className="text-xs text-muted-foreground">{cmd.description}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper to convert blocks to/from markdown
export function blocksToMarkdown(blocks: Block[]): string {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading1':
        return `# ${block.content}`
      case 'heading2':
        return `## ${block.content}`
      case 'heading3':
        return `### ${block.content}`
      case 'bulletList':
        return `- ${block.content}`
      case 'numberedList':
        return `1. ${block.content}`
      case 'checkList':
        return `- [${block.checked ? 'x' : ' '}] ${block.content}`
      case 'quote':
        return `> ${block.content}`
      case 'code':
        return `\`${block.content}\``
      case 'divider':
        return '---'
      default:
        return block.content
    }
  }).join('\n')
}

export function markdownToBlocks(markdown: string): Block[] {
  if (!markdown) return []

  const lines = markdown.split('\n')
  return lines.map(line => {
    const id = generateId()

    if (line.startsWith('# ')) {
      return { id, type: 'heading1' as BlockType, content: line.slice(2) }
    }
    if (line.startsWith('## ')) {
      return { id, type: 'heading2' as BlockType, content: line.slice(3) }
    }
    if (line.startsWith('### ')) {
      return { id, type: 'heading3' as BlockType, content: line.slice(4) }
    }
    if (line.startsWith('- [x] ')) {
      return { id, type: 'checkList' as BlockType, content: line.slice(6), checked: true }
    }
    if (line.startsWith('- [ ] ')) {
      return { id, type: 'checkList' as BlockType, content: line.slice(6), checked: false }
    }
    if (line.startsWith('- ')) {
      return { id, type: 'bulletList' as BlockType, content: line.slice(2) }
    }
    if (/^\d+\. /.test(line)) {
      return { id, type: 'numberedList' as BlockType, content: line.replace(/^\d+\. /, '') }
    }
    if (line.startsWith('> ')) {
      return { id, type: 'quote' as BlockType, content: line.slice(2) }
    }
    if (line === '---') {
      return { id, type: 'divider' as BlockType, content: '' }
    }

    return { id, type: 'paragraph' as BlockType, content: line }
  }).filter(block => block.content !== '' || block.type === 'divider')
}
