import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'
import { formatBytes } from '../lib/format'

export interface SortableFile {
    id: string
    file: File
    pageCount?: number
}

interface Props {
    items: SortableFile[]
    onReorder: (items: SortableFile[]) => void
    onRemove: (id: string) => void
}

export function SortableFileList({ items, onReorder, onRemove }: Props) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        onReorder(arrayMove(items, oldIndex, newIndex))
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <ul className="flex flex-col gap-2">
                    {items.map((item, index) => (
                        <SortableRow key={item.id} item={item} index={index} onRemove={onRemove} />
                    ))}
                </ul>
            </SortableContext>
        </DndContext>
    )
}

function SortableRow({
    item,
    index,
    onRemove,
}: {
    item: SortableFile
    index: number
    onRemove: (id: string) => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

    return (
        <li
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
            className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
        >
            <button
                type="button"
                {...attributes}
                {...listeners}
                aria-label="Drag to reorder"
                className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center text-[var(--color-text-subtle)] active:cursor-grabbing"
            >
                <GripVertical size={16} aria-hidden="true" />
            </button>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg)] text-xs font-medium text-[var(--color-text-muted)]">
                {index + 1}
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--color-text)]">{item.file.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                    {formatBytes(item.file.size)}
                    {item.pageCount !== undefined ? ` • ${item.pageCount} page${item.pageCount === 1 ? '' : 's'}` : ''}
                </p>
            </div>
            <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label={`Remove ${item.file.name}`}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--color-text-subtle)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            >
                <X size={16} aria-hidden="true" />
            </button>
        </li>
    )
}
