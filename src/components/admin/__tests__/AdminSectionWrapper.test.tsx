import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { AdminSectionWrapper } from '../AdminSectionWrapper'

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
    useSortable: () => ({
        attributes: { role: 'button', tabIndex: 0 },
        listeners: { onPointerDown: vi.fn() },
        setNodeRef: vi.fn(),
        transform: null,
        transition: null,
        isDragging: false,
    }),
}))

vi.mock('@dnd-kit/utilities', () => ({
    CSS: {
        Transform: {
            toString: () => null,
        },
    },
}))

describe('AdminSectionWrapper', () => {
    const defaultProps = {
        id: 'stats',
        label: 'Stats',
        isHero: false,
        isEditing: false,
        onToggleEdit: vi.fn(),
        onRemove: vi.fn(),
    }

    it('renders children content', () => {
        render(
            <AdminSectionWrapper {...defaultProps}>
                <div data-testid="child-content">Hello World</div>
            </AdminSectionWrapper>
        )
        expect(screen.getByTestId('child-content')).toBeInTheDocument()
        expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('renders the section label', () => {
        render(
            <AdminSectionWrapper {...defaultProps}>
                <div>Content</div>
            </AdminSectionWrapper>
        )
        expect(screen.getByText('Stats')).toBeInTheDocument()
    })

    it('shows drag handle for non-hero sections', () => {
        render(
            <AdminSectionWrapper {...defaultProps}>
                <div>Content</div>
            </AdminSectionWrapper>
        )
        expect(screen.getByTestId('drag-handle-stats')).toBeInTheDocument()
    })

    it('does NOT show drag handle for hero sections', () => {
        render(
            <AdminSectionWrapper {...defaultProps} isHero={true} id="hero">
                <div>Content</div>
            </AdminSectionWrapper>
        )
        expect(screen.queryByTestId('drag-handle-hero')).not.toBeInTheDocument()
    })

    it('shows remove button for non-hero sections', () => {
        render(
            <AdminSectionWrapper {...defaultProps}>
                <div>Content</div>
            </AdminSectionWrapper>
        )
        expect(screen.getByTestId('remove-btn-stats')).toBeInTheDocument()
    })

    it('does NOT show remove button for hero sections', () => {
        render(
            <AdminSectionWrapper {...defaultProps} isHero={true} id="hero">
                <div>Content</div>
            </AdminSectionWrapper>
        )
        expect(screen.queryByTestId('remove-btn-hero')).not.toBeInTheDocument()
    })

    it('calls onRemove when remove button is clicked', () => {
        const onRemove = vi.fn()
        render(
            <AdminSectionWrapper {...defaultProps} onRemove={onRemove}>
                <div>Content</div>
            </AdminSectionWrapper>
        )
        fireEvent.click(screen.getByTestId('remove-btn-stats'))
        expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it('calls onToggleEdit when edit button is clicked', () => {
        const onToggleEdit = vi.fn()
        render(
            <AdminSectionWrapper {...defaultProps} onToggleEdit={onToggleEdit}>
                <div>Content</div>
            </AdminSectionWrapper>
        )
        fireEvent.click(screen.getByTestId('edit-toggle-stats'))
        expect(onToggleEdit).toHaveBeenCalledTimes(1)
    })

    it('toggles edit icon based on isEditing prop', () => {
        const { rerender } = render(
            <AdminSectionWrapper {...defaultProps} isEditing={false}>
                <div>Content</div>
            </AdminSectionWrapper>
        )
        // When not editing, the edit icon should be a pencil (path with "M18.5 2.5...")
        const editBtn = screen.getByTestId('edit-toggle-stats')
        expect(editBtn).toBeInTheDocument()

        rerender(
            <AdminSectionWrapper {...defaultProps} isEditing={true}>
                <div>Content</div>
            </AdminSectionWrapper>
        )
        // When editing, the close icon (X) should appear
        expect(editBtn).toBeInTheDocument()
    })
})
