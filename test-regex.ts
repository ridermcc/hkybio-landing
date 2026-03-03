import * as cheerio from 'cheerio';
async function run() {
    console.time('fetch');
    const response = await fetch('https://athletics.plymouth.edu/sports/mhockey/schedule');
    const rawHtml = await response.text();
    console.timeEnd('fetch');

    console.time('cheerio');
    const parsedHtml = cheerio.load(rawHtml);
    const bodyText = parsedHtml('body').text();
    console.timeEnd('cheerio');

    console.time('replace');
    const a = bodyText.replace(/\s+/g, ' ').trim();
    console.timeEnd('replace');
}
run();
