import * as cheerio from 'cheerio';
async function run() {
    const url = 'https://athletics.plymouth.edu/sports/mhockey/schedule';
    const response = await fetch(url);
    const rawHtml = await response.text();
    const parsedHtml = cheerio.load(rawHtml);
    const bodyText = parsedHtml('body').text();
    const trimmedBodyText = bodyText.replace(/\s+/g, ' ').trim();
    console.log("Trimmed body text length:", trimmedBodyText.length);
}
run();
