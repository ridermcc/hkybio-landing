import ical from 'node-ical'

export interface Game {
    opponent: string
    date: Date
    time: string | null
    location: string | null
    isHome: boolean
}

function parseSummary(summary: string): { opponent: string; isHome: boolean } {
    const opponentRegex: RegExp = / (?:vs\.?|at|@) (.+)$/i;
    const match = summary.match(opponentRegex);
    if (!match) return { opponent: summary, isHome: true }
    return {
        opponent: match[1],
        isHome: match[0].includes('vs')
    }
}

export async function parseSchedule(icalUrl: string): Promise<Game[]> {
    const data = await ical.async.fromURL(icalUrl)
    const events = Object.values(data).filter(
        (event): event is ical.VEvent => event?.type === 'VEVENT'
    )
    const upcomingGames = events.filter((event) => event.start > new Date())
    return upcomingGames.map((event) => {
        const summary = typeof event.summary === 'string' ? event.summary : event.summary?.val ?? 'Unknown'
        const parsedSummary = parseSummary(summary)
        return {
            opponent: parsedSummary.opponent,
            isHome: parsedSummary.isHome,
            date: event.start,
            time: event.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            location: typeof event.location === 'string' ? event.location : event.location?.val ?? null,
        }
    }).sort((a, b) => a.date.getTime() - b.date.getTime())
}