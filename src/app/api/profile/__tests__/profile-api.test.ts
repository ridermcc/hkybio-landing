import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSupabaseFrom = vi.fn()
const mockGetUser = vi.fn()
const mockAdminFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn().mockImplementation(async () => ({
        auth: {
            getUser: mockGetUser,
        },
        from: mockSupabaseFrom,
    })),
}))

vi.mock('@/lib/supabase/admin', () => ({
    supabaseAdmin: {
        from: (...args: any[]) => mockAdminFrom(...args),
    },
}))

import { PUT } from '@/app/api/profile/route'
import { NextRequest } from 'next/server'

function createRequest(body: any): NextRequest {
    return new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
}

// ─── Helpers ────────────────────────────────────────────────────────

function setupAuthAndOwnership(userId = 'user-1', playerId = 'player-1') {
    mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
    })

    // Auth client: only used for ownership check (select)
    mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: playerId, auth_user_id: userId },
                }),
            }),
        }),
    }))

    // Admin client: used for all write operations (delete + insert)
    const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
    })
    const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
    })
    const mockInsert = vi.fn().mockResolvedValue({ error: null })

    mockAdminFrom.mockImplementation(() => ({
        update: mockUpdate,
        delete: mockDelete,
        insert: mockInsert,
    }))

    return { mockUpdate, mockDelete, mockInsert }
}

// ─── Common payload fragments ───────────────────────────────────────

const baseHero = {
    playerName: 'Rider McCallum',
    username: 'rider',
    imageUrl: '',
    nationality: 'CA',
    teamName: 'Plymouth State',
    leagueName: 'LEC',
    socialLinks: [],
}

const baseStats = {
    season: '2024-25',
    stats: [{ label: 'GP', value: '32' }],
    bio: { position: 'F', birthYear: 2003 },
}

const baseVideo = { url: 'https://youtube.com/watch?v=abc', title: 'Highlights' }

const baseJourney = {
    stops: [
        { teamName: 'Plymouth State', league: 'LEC', startYear: 2023, accolades: [] },
    ],
}

const baseSponsors = {
    sponsors: [
        { name: 'BrandX', imageUrl: 'https://img.com/logo.png', linkUrl: 'https://brandx.com', description: 'Gear sponsor' },
    ],
}

const baseArticles = {
    urls: ['https://athletics.plymouth.edu/news/article1', 'https://athletics.plymouth.edu/news/article2'],
}

const baseFooter = { agentName: 'Nick DiLisi', agencyName: '93 Hockey' }

const fullPayload = {
    playerId: 'player-1',
    sections: ['stats', 'video', 'journey', 'sponsors', 'articles', 'footer'],
    hero: baseHero,
    stats: baseStats,
    schedule: { scheduleUrl: 'https://schedule.example.com' },
    video: baseVideo,
    journey: baseJourney,
    sponsors: baseSponsors,
    articles: baseArticles,
    footer: baseFooter,
}

// ─── Tests ──────────────────────────────────────────────────────────

describe('PUT /api/profile', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ── Auth & validation ───────────────────────────────────────────

    it('returns 401 when user is not authenticated', async () => {
        mockGetUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
        })

        const res = await PUT(createRequest({ playerId: '123' }))
        expect(res.status).toBe(401)
        expect((await res.json()).error).toBe('Unauthorized')
    })

    it('returns 400 when playerId is missing', async () => {
        mockGetUser.mockResolvedValue({
            data: { user: { id: 'user-1' } },
            error: null,
        })

        const res = await PUT(createRequest({}))
        expect(res.status).toBe(400)
        expect((await res.json()).error).toBe('playerId is required')
    })

    it('returns 404 when profile is not found', async () => {
        mockGetUser.mockResolvedValue({
            data: { user: { id: 'user-1' } },
            error: null,
        })
        mockSupabaseFrom.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: null }),
                }),
            }),
        })

        const res = await PUT(createRequest({ playerId: 'nonexistent' }))
        expect(res.status).toBe(404)
        expect((await res.json()).error).toBe('Profile not found')
    })

    it('returns 403 when user does not own the profile', async () => {
        mockGetUser.mockResolvedValue({
            data: { user: { id: 'user-1' } },
            error: null,
        })
        mockSupabaseFrom.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                        data: { id: 'player-1', auth_user_id: 'different-user' },
                    }),
                }),
            }),
        })

        const res = await PUT(createRequest({ playerId: 'player-1' }))
        expect(res.status).toBe(403)
        expect((await res.json()).error).toBe('Forbidden')
    })

    // ── Full profile save ───────────────────────────────────────────

    it('returns success when full profile is saved', async () => {
        setupAuthAndOwnership()
        const res = await PUT(createRequest(fullPayload))
        expect(res.status).toBe(200)
        expect((await res.json()).success).toBe(true)
    })

    // ── Hero & player fields ────────────────────────────────────────

    it('updates player fields from hero data', async () => {
        const { mockUpdate } = setupAuthAndOwnership()
        await PUT(createRequest({ playerId: 'player-1', hero: baseHero }))

        expect(mockUpdate).toHaveBeenCalled()
        const arg = mockUpdate.mock.calls[0][0]
        expect(arg.full_name).toBe('Rider McCallum')
        expect(arg.username).toBe('rider')
        expect(arg.nationality).toBe('CA')
        expect(arg.current_team).toBe('Plymouth State')
        expect(arg.current_league).toBe('LEC')
    })

    it('updates section_order when sections are provided', async () => {
        const { mockUpdate } = setupAuthAndOwnership()
        await PUT(createRequest({ playerId: 'player-1', sections: ['stats', 'video'] }))

        expect(mockUpdate).toHaveBeenCalled()
        expect(mockUpdate.mock.calls[0][0].section_order).toEqual(['stats', 'video'])
    })

    it('updates bio fields from stats data', async () => {
        const { mockUpdate } = setupAuthAndOwnership()
        await PUT(createRequest({
            playerId: 'player-1',
            stats: {
                ...baseStats,
                bio: { position: 'D', birthYear: 2002, shoots_catches: 'L', height: '6\'1"', weight: '190' },
            },
        }))

        const arg = mockUpdate.mock.calls[0][0]
        expect(arg.position).toBe('D')
        expect(arg.birth_year).toBe(2002)
        expect(arg.shoots_catches).toBe('L')
    })

    it('updates schedule_url from schedule data', async () => {
        const { mockUpdate } = setupAuthAndOwnership()
        await PUT(createRequest({ playerId: 'player-1', schedule: { scheduleUrl: 'https://psu.schedule.com' } }))
        expect(mockUpdate.mock.calls[0][0].schedule_url).toBe('https://psu.schedule.com')
    })

    it('skips player update when no updatable fields are provided', async () => {
        const { mockUpdate } = setupAuthAndOwnership()
        const res = await PUT(createRequest({ playerId: 'player-1' }))
        expect(res.status).toBe(200)
        expect(mockUpdate).not.toHaveBeenCalled()
    })

    // ── Social links ────────────────────────────────────────────────

    it('inserts social links with correct data', async () => {
        const { mockInsert } = setupAuthAndOwnership()
        await PUT(createRequest({
            playerId: 'player-1',
            hero: {
                ...baseHero,
                socialLinks: [
                    { platform: 'Instagram', url: 'https://instagram.com/rider' },
                    { platform: 'Twitter', url: 'https://twitter.com/rider' },
                ],
            },
        }))

        const insertCall = mockInsert.mock.calls.find((call: any[]) =>
            Array.isArray(call[0]) && call[0][0]?.platform === 'instagram'
        )
        expect(insertCall).toBeTruthy()
        expect(insertCall![0]).toHaveLength(2)
        expect(insertCall![0][0].platform).toBe('instagram')
        expect(insertCall![0][1].platform).toBe('twitter')
    })

    it('deduplicates social links by platform (keeps last)', async () => {
        const { mockInsert } = setupAuthAndOwnership()
        await PUT(createRequest({
            playerId: 'player-1',
            hero: {
                ...baseHero,
                socialLinks: [
                    { platform: 'Instagram', url: 'https://instagram.com/old' },
                    { platform: 'instagram', url: 'https://instagram.com/new' },
                ],
            },
        }))

        const insertCall = mockInsert.mock.calls.find((call: any[]) =>
            Array.isArray(call[0]) && call[0][0]?.platform === 'instagram'
        )
        expect(insertCall).toBeTruthy()
        expect(insertCall![0]).toHaveLength(1)
        expect(insertCall![0][0].url).toBe('https://instagram.com/new')
    })

    it('normalizes social link platforms to lowercase', async () => {
        const { mockInsert } = setupAuthAndOwnership()
        await PUT(createRequest({
            playerId: 'player-1',
            hero: { ...baseHero, socialLinks: [{ platform: 'Instagram', url: 'https://instagram.com/rider' }] },
        }))

        const insertCall = mockInsert.mock.calls.find((call: any[]) =>
            Array.isArray(call[0]) && call[0][0]?.platform === 'instagram'
        )
        expect(insertCall).toBeTruthy()
        expect(insertCall![0][0].platform).toBe('instagram')
    })

    it('skips social links with empty platform', async () => {
        const { mockInsert } = setupAuthAndOwnership()
        await PUT(createRequest({
            playerId: 'player-1',
            hero: {
                ...baseHero,
                socialLinks: [
                    { platform: '', url: 'https://example.com' },
                    { platform: 'twitter', url: 'https://twitter.com/x' },
                ],
            },
        }))

        const insertCall = mockInsert.mock.calls.find((call: any[]) =>
            Array.isArray(call[0]) && call[0][0]?.platform === 'twitter'
        )
        expect(insertCall).toBeTruthy()
        expect(insertCall![0]).toHaveLength(1)
    })

    it('handles empty social links array (delete only)', async () => {
        const { mockDelete } = setupAuthAndOwnership()
        const res = await PUT(createRequest({
            playerId: 'player-1',
            hero: { ...baseHero, socialLinks: [] },
        }))
        expect(res.status).toBe(200)
        expect(mockDelete).toHaveBeenCalled()
    })

    // ── Stats ───────────────────────────────────────────────────────

    it('inserts stats with season and stat items', async () => {
        const { mockInsert } = setupAuthAndOwnership()
        await PUT(createRequest({ playerId: 'player-1', stats: baseStats }))

        const insertCall = mockInsert.mock.calls.find((call: any[]) =>
            !Array.isArray(call[0]) && call[0]?.season === '2024-25'
        )
        expect(insertCall).toBeTruthy()
        expect(insertCall![0].player_id).toBe('player-1')
        expect(insertCall![0].stats).toEqual([{ label: 'GP', value: '32' }])
    })

    it('handles stats with empty stats array (delete only)', async () => {
        setupAuthAndOwnership()
        const res = await PUT(createRequest({ playerId: 'player-1', stats: { season: '2024-25', stats: [], bio: {} } }))
        expect(res.status).toBe(200)
    })

    // ── Video / highlights ──────────────────────────────────────────

    it('inserts video highlight', async () => {
        const { mockInsert } = setupAuthAndOwnership()
        await PUT(createRequest({ playerId: 'player-1', video: baseVideo }))

        const insertCall = mockInsert.mock.calls.find((call: any[]) =>
            !Array.isArray(call[0]) && call[0]?.video_url
        )
        expect(insertCall).toBeTruthy()
        expect(insertCall![0].video_url).toBe('https://youtube.com/watch?v=abc')
        expect(insertCall![0].title).toBe('Highlights')
    })

    it('handles video with empty url (delete only)', async () => {
        setupAuthAndOwnership()
        const res = await PUT(createRequest({ playerId: 'player-1', video: { url: '', title: '' } }))
        expect(res.status).toBe(200)
    })

    // ── Journey ─────────────────────────────────────────────────────

    it('inserts journey stops', async () => {
        const { mockInsert } = setupAuthAndOwnership()
        await PUT(createRequest({
            playerId: 'player-1',
            journey: {
                stops: [
                    { teamName: 'Fernie Ghostriders', league: 'KIJHL', startYear: 2021, endYear: 2022, accolades: ['Top Scorer'] },
                    { teamName: 'Plymouth State', league: 'LEC', startYear: 2023, accolades: [] },
                ],
            },
        }))

        const insertCall = mockInsert.mock.calls.find((call: any[]) =>
            Array.isArray(call[0]) && call[0][0]?.team_name
        )
        expect(insertCall).toBeTruthy()
        expect(insertCall![0]).toHaveLength(2)
        expect(insertCall![0][0].team_name).toBe('Fernie Ghostriders')
        expect(insertCall![0][0].league).toBe('KIJHL')
        expect(insertCall![0][0].start_year).toBe(2021)
        expect(insertCall![0][0].end_year).toBe(2022)
        expect(insertCall![0][0].accolades).toEqual(['Top Scorer'])
        expect(insertCall![0][0].display_order).toBe(0)
        expect(insertCall![0][1].display_order).toBe(1)
    })

    it('handles journey with empty stops (delete only)', async () => {
        setupAuthAndOwnership()
        const res = await PUT(createRequest({ playerId: 'player-1', journey: { stops: [] } }))
        expect(res.status).toBe(200)
    })

    // ── Sponsors ────────────────────────────────────────────────────

    it('inserts sponsors', async () => {
        const { mockInsert } = setupAuthAndOwnership()
        await PUT(createRequest({ playerId: 'player-1', sponsors: baseSponsors }))

        const insertCall = mockInsert.mock.calls.find((call: any[]) =>
            Array.isArray(call[0]) && call[0][0]?.name === 'BrandX'
        )
        expect(insertCall).toBeTruthy()
        expect(insertCall![0][0].image_url).toBe('https://img.com/logo.png')
        expect(insertCall![0][0].link_url).toBe('https://brandx.com')
        expect(insertCall![0][0].description).toBe('Gear sponsor')
    })

    it('handles sponsors with empty array (delete only)', async () => {
        setupAuthAndOwnership()
        const res = await PUT(createRequest({ playerId: 'player-1', sponsors: { sponsors: [] } }))
        expect(res.status).toBe(200)
    })

    // ── Articles ────────────────────────────────────────────────────

    it('inserts articles', async () => {
        const { mockInsert } = setupAuthAndOwnership()
        await PUT(createRequest({ playerId: 'player-1', articles: baseArticles }))

        const insertCall = mockInsert.mock.calls.find((call: any[]) =>
            Array.isArray(call[0]) && call[0][0]?.article_url
        )
        expect(insertCall).toBeTruthy()
        expect(insertCall![0]).toHaveLength(2)
        expect(insertCall![0][0].article_url).toBe('https://athletics.plymouth.edu/news/article1')
    })

    it('filters empty/whitespace article urls', async () => {
        const { mockInsert } = setupAuthAndOwnership()
        await PUT(createRequest({
            playerId: 'player-1',
            articles: { urls: ['https://example.com/article', '', '  ', 'https://example.com/article2'] },
        }))

        const insertCall = mockInsert.mock.calls.find((call: any[]) =>
            Array.isArray(call[0]) && call[0][0]?.article_url
        )
        expect(insertCall).toBeTruthy()
        expect(insertCall![0]).toHaveLength(2)
    })

    it('handles articles with only whitespace urls (delete only)', async () => {
        setupAuthAndOwnership()
        const res = await PUT(createRequest({ playerId: 'player-1', articles: { urls: ['', '   '] } }))
        expect(res.status).toBe(200)
    })

    // ── Footer / representatives ────────────────────────────────────

    it('inserts representatives from footer data', async () => {
        const { mockInsert } = setupAuthAndOwnership()
        await PUT(createRequest({ playerId: 'player-1', footer: baseFooter }))

        const insertCall = mockInsert.mock.calls.find((call: any[]) =>
            !Array.isArray(call[0]) && call[0]?.name === 'Nick DiLisi'
        )
        expect(insertCall).toBeTruthy()
        expect(insertCall![0].company).toBe('93 Hockey')
    })

    it('handles footer with no agent/agency (delete only)', async () => {
        setupAuthAndOwnership()
        const res = await PUT(createRequest({ playerId: 'player-1', footer: { agentName: '', agencyName: '' } }))
        expect(res.status).toBe(200)
    })

    // ── Error handling ──────────────────────────────────────────────

    it('returns 500 when player update fails', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
        mockSupabaseFrom.mockImplementation(() => ({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                        data: { id: 'player-1', auth_user_id: 'user-1' },
                    }),
                }),
            }),
        }))
        mockAdminFrom.mockImplementation(() => ({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: { message: 'DB update failed', code: '42000' } }),
            }),
            delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
            insert: vi.fn().mockResolvedValue({ error: null }),
        }))

        const res = await PUT(createRequest({ playerId: 'player-1', hero: baseHero }))
        expect(res.status).toBe(500)
        const body = await res.json()
        expect(body.error).toBe('Failed to save profile')
        // Verify we do NOT expose internal error details to the client
        expect(body.details).toBeUndefined()
    })

    it('returns 500 when insert for social links fails', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
        mockSupabaseFrom.mockImplementation(() => ({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                        data: { id: 'player-1', auth_user_id: 'user-1' },
                    }),
                }),
            }),
        }))
        mockAdminFrom.mockImplementation(() => ({
            update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
            delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
            insert: vi.fn().mockResolvedValue({ error: { message: 'Insert failed', code: '23505' } }),
        }))

        const res = await PUT(createRequest({
            playerId: 'player-1',
            hero: { ...baseHero, socialLinks: [{ platform: 'twitter', url: 'https://twitter.com/x' }] },
        }))
        expect(res.status).toBe(500)
        expect((await res.json()).error).toBe('Failed to save profile')
    })

    // ── Partial payloads ────────────────────────────────────────────

    it('handles a payload with only hero (no child tables)', async () => {
        setupAuthAndOwnership()
        const res = await PUT(createRequest({ playerId: 'player-1', hero: { ...baseHero, socialLinks: undefined } }))
        expect(res.status).toBe(200)
    })

    it('handles a complete payload with all sections', async () => {
        const { mockInsert, mockDelete, mockUpdate } = setupAuthAndOwnership()
        const res = await PUT(createRequest(fullPayload))
        expect(res.status).toBe(200)
        expect(mockUpdate).toHaveBeenCalled()
        expect(mockDelete).toHaveBeenCalled()
        expect(mockInsert).toHaveBeenCalled()
    })
})
