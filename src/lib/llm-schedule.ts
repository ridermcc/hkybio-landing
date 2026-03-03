import * as cheerio from 'cheerio';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export interface Game {
    opponent: string
    date: Date
    time: string | null
    location: string | null
    isHome: boolean
}

const GameSchema = z.object({
    opponent: z.string(),
    date: z.string().describe("ISO format date string"),
    time: z.string().nullable().describe("Time format like '7:00 PM', or null if TBD"),
    location: z.string().nullable(),
    isHome: z.boolean()
});

export async function getSchedule(url: string) {
    const reqId = Math.random().toString(36).substring(7)

    const response = await fetch(url)
    const rawHtml = await response.text()

    const cheerioHtml = cheerio.load(rawHtml)
    cheerioHtml('script, style, noscript, svg').remove()
    const allHtmlParsed = cheerioHtml.html()
    const bodyText = cheerioHtml('body').text()
    const trimmedBodyText = bodyText.replace(/\s+/g, ' ').trim()

    const { object } = await generateObject({
        model: google('gemini-2.5-flash-lite-preview-09-2025'),
        schema: z.array(GameSchema),
        prompt: `Extract the games for this hockey team from the provided web page text.
                 Determine if the game is Home or Away. Standardize dates to ISO format.
                 
                 Web Page HTML:
                 ${allHtmlParsed}`
    });

    return {
        games: object,
    }
}