import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import * as cheerio from 'cheerio';

const GameSchema = z.object({
    opponent: z.string(),
    date: z.string(),
    time: z.string().nullable(),
    location: z.string().nullable(),
    isHome: z.boolean()
});

async function run() {
    const response = await fetch('https://athletics.plymouth.edu/sports/mhockey/schedule');
    const rawHtml = await response.text();
    const cheerioHtml = cheerio.load(rawHtml)
    cheerioHtml('script, style, noscript, svg, nav, footer, header').remove()
    const allHtmlParsed = cheerioHtml.html()
    const bodyText = cheerioHtml('body').text()
    const trimmedBodyText = bodyText.replace(/\s+/g, ' ').trim()

    console.time("Gemini fast");
    const { object } = await generateObject({
        model: google('gemini-2.5-flash', { structuredOutputs: false }),
        schema: z.array(GameSchema),
        prompt: `Extract ONLY the NEXT 3 upcoming hockey games from today's date forward from the provided web page text. Ignore all past games. Determine if the game is Home or Away. Standardize dates to ISO format. Web Page Text: ${trimmedBodyText}`
    });
    console.timeEnd("Gemini fast");
    console.log(object.length, "games found");
}
run();
