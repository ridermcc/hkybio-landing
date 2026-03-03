import * as cheerio from 'cheerio';
async function run() {
    const url = 'https://athletics.plymouth.edu/sports/mhockey/schedule';
    console.time('fetch');
    const response = await fetch(url);
    const rawHtml = await response.text();
    console.timeEnd('fetch');
    
    console.time('cheerioload');
    const parsedHtml = cheerio.load(rawHtml);
    console.timeEnd('cheerioload');

    console.time('cheeriotext');
    let bodyText = parsedHtml('body').text();
    console.timeEnd('cheeriotext');
    
    console.time('regex');
    const trimmedBodyText = bodyText.replace(/\s+/g, ' ').trim();
    console.timeEnd('regex');
    
    console.log("Trimmed body text length:", trimmedBodyText.length);
}
run();
