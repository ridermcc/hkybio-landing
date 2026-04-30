import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ProfileEditorClient, ProfileData } from '@/app/(app)/dashboard/ProfileEditorClient'

// Mock all profile components
vi.mock('@/components/profile/PlayerHero', () => ({
    PlayerHero: (props: any) => (
        <div data-testid="preview-hero">
            <span>{props.playerName}</span>
            {props.isEditing && <span data-testid="hero-editing">editing</span>}
        </div>
    ),
}))
vi.mock('@/components/profile/PlayerLinks', () => ({
    PlayerLinks: () => <div data-testid="mock-links" />,
}))
vi.mock('@/components/profile/PlayerStats', () => ({
    PlayerStats: (props: any) => (
        <div data-testid="preview-stats">
            <span>{props.season}</span>
            {props.isEditing && <span data-testid="stats-editing">editing</span>}
        </div>
    ),
}))
vi.mock('@/components/profile/PlayerSchedule', () => ({
    PlayerSchedule: (props: any) => (
        <div data-testid="preview-schedule">
            {props.isEditing && <span data-testid="schedule-editing">editing</span>}
        </div>
    ),
}))
vi.mock('@/components/profile/PlayerVideo', () => ({
    PlayerVideo: (props: any) => (
        <div data-testid="preview-video">
            <span>{props.title}</span>
            {props.isEditing && <span data-testid="video-editing">editing</span>}
        </div>
    ),
}))
vi.mock('@/components/profile/PlayerJourney', () => ({
    PlayerJourney: (props: any) => (
        <div data-testid="preview-journey">
            <span>{props.stops.length} stops</span>
            {props.isEditing && <span data-testid="journey-editing">editing</span>}
        </div>
    ),
}))
vi.mock('@/components/profile/PlayerLinkItem', () => ({
    PlayerLinkItem: (props: any) => (
        <div data-testid={`preview-linkitem-${props.size}`}>
            <span>{props.link?.name || ''}</span>
            {props.isEditing && <span data-testid={`linkitem-${props.size}-editing`}>editing</span>}
        </div>
    ),
}))
vi.mock('@/components/profile/PlayerArticles', () => ({
    PlayerArticles: (props: any) => (
        <div data-testid="preview-articles">
            <span>{props.urls.length} articles</span>
            {props.isEditing && <span data-testid="articles-editing">editing</span>}
        </div>
    ),
}))
vi.mock('@/components/profile/ProfileFooter', () => ({
    ProfileFooter: (props: any) => (
        <div data-testid="preview-footer">
            <span>{props.mode}</span>
            {props.isEditing && <span data-testid="footer-editing">editing</span>}
        </div>
    ),
}))
vi.mock('@/components/profile/InlineEdit', () => ({
    InlineEdit: (props: any) => <span>{props.value}</span>,
}))

const createMockData = (overrides?: Partial<ProfileData>): ProfileData => ({
    playerId: 'player-123',
    hero: {
        playerName: 'John Doe',
        username: 'jdoe',
        imageUrl: 'https://example.com/photo.jpg',
        nationality: 'CA',
        teamName: 'London Knights',
        leagueName: 'OHL',
        socialLinks: [],
    },
    stats: {
        season: '2024-25',
        stats: [{ label: 'GP', value: '68' }],
        bio: { position: 'C' },
    },
    schedule: { scheduleUrl: '' },
    video: { url: 'https://youtube.com/watch?v=abc123', title: 'Highlights' },
    journey: {
        stops: [
            { teamName: 'London Knights', league: 'OHL', startYear: 2022, accolades: [] },
        ],
    },
    linkItems: [{
        id: 'linkitem-standard-0',
        size: 'standard',
        link: { name: 'BrandX', imageUrl: '', linkUrl: '', description: '' },
    }],
    articles: { urls: ['https://example.com/article'] },
    footer: {
        mode: 'player',
        playerName: 'John Doe',
        teamName: 'London Knights',
        leagueName: 'OHL',
        agentName: 'Nick DiLisi',
        agencyName: '93 Hockey',
    },
    // Footer is NOT in sections — it's always fixed at bottom
    sections: ['stats', 'video', 'journey', 'linkitem-standard-0', 'articles'],
    ...overrides,
})

describe('ProfileEditorClient', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        global.fetch = vi.fn()
    })

    it('renders the top bar with profile info', () => {
        render(<ProfileEditorClient initialData={createMockData()} />)
        expect(screen.getByText('Edit Profile')).toBeInTheDocument()
        expect(screen.getByText('hky.bio/jdoe')).toBeInTheDocument()
    })

    it('renders View Profile link', () => {
        render(<ProfileEditorClient initialData={createMockData()} />)
        const viewLink = screen.getByText('View Profile')
        expect(viewLink).toHaveAttribute('href', '/jdoe')
    })

    it('renders the Save button', () => {
        render(<ProfileEditorClient initialData={createMockData()} />)
        expect(screen.getByTestId('save-button')).toBeInTheDocument()
        expect(screen.getByTestId('save-button')).toHaveTextContent('Save')
    })

    it('renders all active sortable sections', () => {
        render(<ProfileEditorClient initialData={createMockData()} />)
        expect(screen.getByTestId('preview-stats')).toBeInTheDocument()
        expect(screen.getByTestId('preview-video')).toBeInTheDocument()
        expect(screen.getByTestId('preview-journey')).toBeInTheDocument()
        expect(screen.getByTestId('preview-linkitem-standard')).toBeInTheDocument()
        expect(screen.getByTestId('preview-articles')).toBeInTheDocument()
    })

    it('renders the footer fixed at the bottom (not in sections)', () => {
        render(<ProfileEditorClient initialData={createMockData()} />)
        expect(screen.getByTestId('preview-footer')).toBeInTheDocument()
        // Footer should have its own edit toggle, not a drag handle
        expect(screen.getByTestId('edit-toggle-footer')).toBeInTheDocument()
        expect(screen.queryByTestId('drag-handle-footer')).not.toBeInTheDocument()
        expect(screen.queryByTestId('remove-btn-footer')).not.toBeInTheDocument()
    })

    it('hero has no drag handle or remove button', () => {
        render(<ProfileEditorClient initialData={createMockData()} />)
        expect(screen.queryByTestId('drag-handle-hero')).not.toBeInTheDocument()
        expect(screen.queryByTestId('remove-btn-hero')).not.toBeInTheDocument()
    })

    it('non-hero sections have drag handles and remove buttons', () => {
        render(<ProfileEditorClient initialData={createMockData()} />)
        expect(screen.getByTestId('drag-handle-stats')).toBeInTheDocument()
        expect(screen.getByTestId('remove-btn-stats')).toBeInTheDocument()
        expect(screen.getByTestId('drag-handle-video')).toBeInTheDocument()
        expect(screen.getByTestId('remove-btn-video')).toBeInTheDocument()
    })

    it('removing a section removes it from the layout', () => {
        render(<ProfileEditorClient initialData={createMockData()} />)
        fireEvent.click(screen.getByTestId('remove-btn-video'))
        expect(screen.queryByTestId('preview-video')).not.toBeInTheDocument()
    })

    it('removing a section makes it available in the picker', () => {
        render(<ProfileEditorClient initialData={createMockData()} />)
        // Schedule was never added, so it should already be available
        expect(screen.getByTestId('add-section-schedule')).toBeInTheDocument()
        
        // Remove video
        fireEvent.click(screen.getByTestId('remove-btn-video'))
        
        // Video should now be available in the picker
        expect(screen.getByTestId('add-section-video')).toBeInTheDocument()
    })

    it('picker shows available sections immediately (no toggle needed)', () => {
        render(<ProfileEditorClient initialData={createMockData()} />)
        // Sections should be visible immediately — picker is always open
        expect(screen.getByTestId('add-section-schedule')).toBeInTheDocument()
        // Link blocks always available
        expect(screen.getByTestId('add-section-link-standard')).toBeInTheDocument()
        expect(screen.getByTestId('add-section-link-compact')).toBeInTheDocument()
    })

    it('adding a section removes it from the picker (unique sections)', () => {
        render(<ProfileEditorClient initialData={createMockData()} />)
        // Schedule is available
        expect(screen.getByTestId('add-section-schedule')).toBeInTheDocument()
        // Add schedule
        fireEvent.click(screen.getByTestId('add-section-schedule'))
        // Schedule should disappear from the picker (it's a unique section)
        expect(screen.queryByTestId('add-section-schedule')).not.toBeInTheDocument()
    })

    it('save button triggers API call with correct payload', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) })
        global.fetch = mockFetch

        render(<ProfileEditorClient initialData={createMockData()} />)
        fireEvent.click(screen.getByTestId('save-button'))

        await vi.waitFor(() => {
            expect(mockFetch).toHaveBeenCalledTimes(1)
        })

        const [url, options] = mockFetch.mock.calls[0]
        expect(url).toBe('/api/profile')
        expect(options.method).toBe('PUT')

        const body = JSON.parse(options.body)
        expect(body.playerId).toBe('player-123')
        // Footer is NOT in sections
        expect(body.sections).toEqual(['stats', 'video', 'journey', 'linkitem-standard-0', 'articles'])
        expect(body.hero.playerName).toBe('John Doe')
        expect(body.stats.season).toBe('2024-25')
        // Footer data included separately
        expect(body.footer.mode).toBe('player')
        expect(body.footer.playerName).toBe('John Doe')
        // Sponsors format preserved for API compatibility
        expect(body.sponsors.sponsors).toHaveLength(1)
        expect(body.sponsors.sponsors[0].name).toBe('BrandX')
    })

    it('shows "Saved" state after successful save', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) })

        render(<ProfileEditorClient initialData={createMockData()} />)
        fireEvent.click(screen.getByTestId('save-button'))

        await vi.waitFor(() => {
            expect(screen.getByTestId('save-button')).toHaveTextContent('✓ Saved')
        })
    })

    it('renders with no sections gracefully, with picker options and footer', () => {
        render(<ProfileEditorClient initialData={createMockData({ sections: [], linkItems: [] })} />)
        expect(screen.getByText('Edit Profile')).toBeInTheDocument()
        // Footer always renders
        expect(screen.getByTestId('preview-footer')).toBeInTheDocument()
        // Picker container always renders
        expect(screen.getByTestId('component-picker-sticky-container')).toBeInTheDocument()
        // See available sections
        expect(screen.getByTestId('add-section-stats')).toBeInTheDocument()
        expect(screen.getByTestId('add-section-video')).toBeInTheDocument()
    })
})
