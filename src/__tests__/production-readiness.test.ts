/**
 * Tests for production readiness fixes.
 * 
 * Covers: middleware, SSRF protection, error sanitization, storage auth,
 * username race condition handling, not-found page, and more.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── 1. Middleware file exists and exports correctly ─────────────────────────

describe('Fix #1: Middleware', () => {
    it('exports a function named "middleware"', async () => {
        // Dynamic import the middleware file to verify exports
        const mod = await import('../../middleware')
        expect(typeof mod.middleware).toBe('function')
    })

    it('exports a config with a matcher', async () => {
        const mod = await import('../../middleware')
        expect(mod.config).toBeDefined()
        expect(mod.config.matcher).toBeDefined()
        expect(Array.isArray(mod.config.matcher)).toBe(true)
        expect(mod.config.matcher.length).toBeGreaterThan(0)
    })

    it('does NOT export a function named "proxy"', async () => {
        const mod = await import('../../middleware')
        expect((mod as any).proxy).toBeUndefined()
    })
})

// ─── 2. AddSectionPanel (dead code) is removed ──────────────────────────────

describe('Fix #2: Dead code removal', () => {
    it('AddSectionPanel.tsx no longer exists', async () => {
        const fs = await import('fs')
        const path = await import('path')
        const exists = fs.existsSync(
            path.resolve(__dirname, '../components/admin/AddSectionPanel.tsx')
        )
        expect(exists).toBe(false)
    })

    it('AddSectionPanel test no longer exists', async () => {
        const fs = await import('fs')
        const path = await import('path')
        const exists = fs.existsSync(
            path.resolve(__dirname, '../components/admin/__tests__/AddSectionPanel.test.tsx')
        )
        expect(exists).toBe(false)
    })
})

// ─── 4. SSRF protection on /api/og ──────────────────────────────────────────

describe('Fix #4: OG route SSRF protection', () => {
    // We test the URL validation logic inline since we can't easily
    // call Next.js API routes in vitest. We extract the validation rules.
    const blockedPatterns = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '169.254.',
        '10.',
        '192.168.',
        'metadata.google',
        '[::1]',
    ]

    function isBlocked(urlString: string): boolean {
        try {
            const parsed = new URL(urlString)
            if (parsed.protocol !== 'https:') return true

            const hostname = parsed.hostname.toLowerCase()
            if (blockedPatterns.some(p => hostname.startsWith(p))) return true
            if (hostname.match(/^172\.(1[6-9]|2\d|3[01])\./)) return true
            if (hostname.endsWith('.internal')) return true
            if (hostname.endsWith('.local')) return true

            return false
        } catch {
            return true
        }
    }

    it('blocks HTTP URLs', () => {
        expect(isBlocked('http://example.com')).toBe(true)
    })

    it('blocks localhost', () => {
        expect(isBlocked('https://localhost/admin')).toBe(true)
    })

    it('blocks 127.0.0.1', () => {
        expect(isBlocked('https://127.0.0.1/secret')).toBe(true)
    })

    it('blocks AWS metadata endpoint (169.254.169.254)', () => {
        expect(isBlocked('https://169.254.169.254/latest/meta-data/')).toBe(true)
    })

    it('blocks private class A (10.x.x.x)', () => {
        expect(isBlocked('https://10.0.0.1/internal')).toBe(true)
    })

    it('blocks private class B (172.16-31.x.x)', () => {
        expect(isBlocked('https://172.16.0.1/internal')).toBe(true)
        expect(isBlocked('https://172.31.255.255/internal')).toBe(true)
    })

    it('allows 172.15.x (not private range)', () => {
        expect(isBlocked('https://172.15.0.1/page')).toBe(false)
    })

    it('blocks private class C (192.168.x.x)', () => {
        expect(isBlocked('https://192.168.1.1/admin')).toBe(true)
    })

    it('blocks GCP metadata', () => {
        expect(isBlocked('https://metadata.google.internal/computeMetadata/v1/')).toBe(true)
    })

    it('blocks .internal domains', () => {
        expect(isBlocked('https://my-service.internal/api')).toBe(true)
    })

    it('blocks .local domains', () => {
        expect(isBlocked('https://my-service.local/api')).toBe(true)
    })

    it('allows legitimate HTTPS URLs', () => {
        expect(isBlocked('https://www.nytimes.com/article')).toBe(false)
        expect(isBlocked('https://eliteprospects.com/player/123')).toBe(false)
        expect(isBlocked('https://www.espn.com/nhl/story')).toBe(false)
    })

    it('blocks invalid URLs', () => {
        expect(isBlocked('not-a-url')).toBe(true)
        expect(isBlocked('')).toBe(true)
    })
})

// ─── 5. Error detail sanitization ───────────────────────────────────────────

describe('Fix #5: Error detail sanitization', () => {
    it('profile route does not expose err.message to client', async () => {
        // Read the profile route source and verify `details:` is not present
        const fs = await import('fs')
        const path = await import('path')
        const routeSource = fs.readFileSync(
            path.resolve(__dirname, '../app/api/profile/route.ts'),
            'utf-8'
        )
        expect(routeSource).not.toContain('details:')
        expect(routeSource).not.toContain('JSON.stringify(err)')
    })

    it('claim route does not expose err.message to client', async () => {
        const fs = await import('fs')
        const path = await import('path')
        const routeSource = fs.readFileSync(
            path.resolve(__dirname, '../app/api/claim/route.ts'),
            'utf-8'
        )
        // The 500 catch should use a hardcoded generic string
        expect(routeSource).toContain("{ error: 'Something went wrong' }")
        expect(routeSource).not.toContain('err.message ||')
    })

    it('check-email route does not expose err.message to client', async () => {
        const fs = await import('fs')
        const path = await import('path')
        const routeSource = fs.readFileSync(
            path.resolve(__dirname, '../app/api/auth/check-email/route.ts'),
            'utf-8'
        )
        // Should NOT have a "details" field in the response
        expect(routeSource).not.toContain('details:')
    })
})

// ─── 6. OTP console.log removed ─────────────────────────────────────────────

describe('Fix #6: OTP console.log removal', () => {
    it('RegisterForm does not log OTP codes', async () => {
        const fs = await import('fs')
        const path = await import('path')
        const source = fs.readFileSync(
            path.resolve(__dirname, '../app/(auth)/register/RegisterForm.tsx'),
            'utf-8'
        )
        expect(source).not.toContain('Verifying OTP for:')
        expect(source).not.toContain("console.log('Verifying OTP")
    })
})

// ─── 8. storage.ts uses getUser() not getSession() ─────────────────────────

describe('Fix #8: Storage auth method', () => {
    it('storage.ts uses getUser() instead of getSession()', async () => {
        const fs = await import('fs')
        const path = await import('path')
        const source = fs.readFileSync(
            path.resolve(__dirname, '../lib/supabase/storage.ts'),
            'utf-8'
        )
        expect(source).toContain('auth.getUser()')
        expect(source).not.toContain('auth.getSession()')
    })
})

// ─── 9. next.config.ts has remotePatterns ───────────────────────────────────

describe('Fix #9: Image remote patterns', () => {
    it('next.config.ts includes Supabase Storage remote pattern', async () => {
        const fs = await import('fs')
        const path = await import('path')
        const source = fs.readFileSync(
            path.resolve(__dirname, '../../next.config.ts'),
            'utf-8'
        )
        expect(source).toContain('remotePatterns')
        expect(source).toContain('abytjsltxtckufmfezwc.supabase.co')
        expect(source).toContain('/storage/v1/object/public/**')
    })
})

// ─── 11. Schedule API requires auth ─────────────────────────────────────────

describe('Fix #11: Schedule API auth', () => {
    it('schedule route imports createClient for auth', async () => {
        const fs = await import('fs')
        const path = await import('path')
        const source = fs.readFileSync(
            path.resolve(__dirname, '../app/api/schedule/route.ts'),
            'utf-8'
        )
        expect(source).toContain('createClient')
        expect(source).toContain('@/lib/supabase/server')
        expect(source).toContain('auth.getUser()')
        expect(source).toContain('status: 401')
    })
})

// ─── 12. Username race condition ─────────────────────────────────────────────

describe('Fix #12: Username race condition', () => {
    it('dashboard page handles unique constraint violations with retry', async () => {
        const fs = await import('fs')
        const path = await import('path')
        const source = fs.readFileSync(
            path.resolve(__dirname, '../app/(app)/dashboard/page.tsx'),
            'utf-8'
        )
        // Should have retry loop
        expect(source).toContain('for (let attempt')
        // Should check postgres unique violation code
        expect(source).toContain("'23505'")
        // Should append random suffix on conflict
        expect(source).toContain('Math.floor(Math.random()')
    })
})

// ─── 13. Root test files removed ─────────────────────────────────────────────

describe('Fix #13: Root test file cleanup', () => {
    const testFiles = [
        'test-benchmark.ts',
        'test-html.ts',
        'test-len-fixed.ts',
        'test-len.ts',
        'test-llm.ts',
        'test-regex.ts',
    ]

    testFiles.forEach(file => {
        it(`${file} does not exist at project root`, async () => {
            const fs = await import('fs')
            const path = await import('path')
            const exists = fs.existsSync(path.resolve(__dirname, `../../${file}`))
            expect(exists).toBe(false)
        })
    })
})

// ─── 15. Duplicate error check removed ───────────────────────────────────────

describe('Fix #15: Duplicate error check', () => {
    it('claim route does not have duplicate "if (error) throw error"', async () => {
        const fs = await import('fs')
        const path = await import('path')
        const source = fs.readFileSync(
            path.resolve(__dirname, '../app/api/claim/route.ts'),
            'utf-8'
        )
        // Count occurrences of "if (error) throw error" in the create action block
        const matches = source.match(/if \(error\) throw error/g) || []
        // There should be exactly 2: one in 'create' and one in 'update'
        // Previously there were 3 (doubled in 'create')
        expect(matches.length).toBe(2)
    })
})

// ─── 17. robots.txt exists ──────────────────────────────────────────────────

describe('Fix #17: robots.txt', () => {
    it('robots.txt exists in public directory', async () => {
        const fs = await import('fs')
        const path = await import('path')
        const exists = fs.existsSync(
            path.resolve(__dirname, '../../public/robots.txt')
        )
        expect(exists).toBe(true)
    })

    it('robots.txt blocks sensitive routes', async () => {
        const fs = await import('fs')
        const path = await import('path')
        const content = fs.readFileSync(
            path.resolve(__dirname, '../../public/robots.txt'),
            'utf-8'
        )
        expect(content).toContain('Disallow: /dashboard')
        expect(content).toContain('Disallow: /login')
        expect(content).toContain('Disallow: /api/')
    })
})

// ─── 18. Custom 404 page ────────────────────────────────────────────────────

describe('Fix #18: Custom not-found page', () => {
    it('not-found.tsx exists in app directory', async () => {
        const fs = await import('fs')
        const path = await import('path')
        const exists = fs.existsSync(
            path.resolve(__dirname, '../app/not-found.tsx')
        )
        expect(exists).toBe(true)
    })

    it('not-found page renders 404 content', async () => {
        const fs = await import('fs')
        const path = await import('path')
        const source = fs.readFileSync(
            path.resolve(__dirname, '../app/not-found.tsx'),
            'utf-8'
        )
        expect(source).toContain('404')
        expect(source).toContain('Page not found')
    })
})
