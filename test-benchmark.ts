import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import * as cheerio from 'cheerio';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();


const groundTruth = [
    { opponent: 'Salve Regina', date: '2025-10-24', time: '6:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: 'Saint Anselm', date: '2025-10-25', time: '3:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: '#9 Univ. of New England', date: '2025-10-31', time: '6:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: 'Plattsburgh State', date: '2025-11-01', time: '7:00 PM', location: 'Plattsburgh, N.Y. Ronald B. Stafford Ice Arena', isHome: false },
    { opponent: 'Norwich', date: '2025-11-07', time: '7:00 PM', location: 'Northfield, Vt. Kreitzberg Arena', isHome: false },
    { opponent: 'VTSU Castleton', date: '2025-11-08', time: '4:00 PM', location: 'Castleton, Vt. Spartan Arena', isHome: false },
    { opponent: 'UMass Dartmouth', date: '2025-11-14', time: '6:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: 'UMass Boston', date: '2025-11-15', time: '2:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: 'Keene State', date: '2025-11-21', time: '6:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: 'Western Connecticut St.', date: '2025-11-22', time: '2:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: 'Trinity', date: '2025-11-25', time: '7:00 PM', location: 'Hartford, Conn. Albert Creighton Williams Rink', isHome: false },
    { opponent: 'Salem State', date: '2025-12-06', time: '6:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: 'Anna Maria', date: '2025-12-10', time: '6:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: '#5 Hamilton', date: '2026-01-02', time: '6:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: 'Skidmore', date: '2026-01-03', time: '6:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: '#7 Babson', date: '2026-01-09', time: '7:00 PM', location: 'Babson Park, Mass. Babson Skating Center', isHome: false },
    { opponent: 'Southern Maine', date: '2026-01-10', time: '4:00 PM', location: 'Gorham, Maine USM Ice Arena', isHome: false },
    { opponent: 'New England College', date: '2026-01-17', time: '6:00 PM', location: 'Henniker, N.H. Lee Clement Arena', isHome: false },
    { opponent: 'VTSU Castleton', date: '2026-01-23', time: '6:30 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: 'RV Norwich', date: '2026-01-24', time: '6:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: 'Western Connecticut St.', date: '2026-01-30', time: '6:30 PM', location: 'Danbury, Conn. Danbury Ice Arena', isHome: false },
    { opponent: 'Keene State', date: '2026-01-31', time: '5:00 PM', location: 'Keene, N.H. Keene ICE', isHome: false },
    { opponent: 'UMass Boston', date: '2026-02-06', time: '7:00 PM', location: 'Boston, Mass. Edward T. Barry Ice Rink', isHome: false },
    { opponent: 'UMass Dartmouth', date: '2026-02-07', time: '3:30 PM', location: 'New Bedford, Mass. Hetland Arena', isHome: false },
    { opponent: 'New England College', date: '2026-02-14', time: '6:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: 'Southern Maine', date: '2026-02-20', time: '6:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: '#11 Babson', date: '2026-02-21', time: '2:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: 'VTSU Castleton', date: '2026-02-25', time: '6:00 PM', location: 'Plymouth, N.H. Hanaway Rink', isHome: true },
    { opponent: '#13 Babson', date: '2026-02-28', time: '4:00 PM', location: 'Babson Park, Mass. Babson Skating Center', isHome: false },
    { opponent: 'LEC Tournament Finals Opponent', date: '2026-03-07', time: 'TBA', location: null, isHome: false }
];

const GameSchema = z.object({
    opponent: z.string(),
    date: z.string(),
    time: z.string().nullable(),
    location: z.string().nullable(),
    isHome: z.boolean()
});

const ITERATIONS = 10;
const URL = 'https://athletics.plymouth.edu/sports/mhockey/schedule';

async function fetchAndCleanHTML() {
    const response = await fetch(URL);
    const rawHtml = await response.text();
    const cheerioHtml = cheerio.load(rawHtml);
    cheerioHtml('script, style, noscript, svg, nav, footer, header').remove();
    return cheerioHtml('body').text().replace(/\s+/g, ' ').trim();
}

function calculateAccuracy(output: any[]) {
    if (!output || !Array.isArray(output)) return 0;

    let correct = 0;
    let total = groundTruth.length * 5; // 5 verifiable fields per game

    for (let i = 0; i < groundTruth.length; i++) {
        const truth = groundTruth[i];

        // Find matching game primarily by date to be fair if games are skipped/reordered
        const p = output.find(g => g.date === truth.date) || output[i];
        if (!p) continue; // Missed game

        const norm = (s: any) => typeof s === 'string' ? s.toLowerCase().trim().replace(/\s+/g, ' ') : s;

        if (norm(p.opponent) === norm(truth.opponent)) correct++;
        if (norm(p.date) === norm(truth.date)) correct++;
        if (norm(p.time) === norm(truth.time)) correct++;
        if (norm(p.location) === norm(truth.location)) correct++;
        if (p.isHome === truth.isHome) correct++;
    }

    return (correct / total) * 100;
}

const modelsToTest = [
    'bytedance-seed/seed-2.0-mini',
    'openai/gpt-oss-20b',
    'meta-llama/llama-3.1-8b-instruct',
    'anthropic/claude-instant-1.1',
    'anthropic/claude-instant-1',
    'openai/gpt-4o-mini'
];

async function runBenchmark(modelName: string, textPayload: string) {
    console.log(`\n🚀 Starting benchmark for: ${modelName}`);
    let totalTime = 0;
    let totalAccuracy = 0;
    let successfulRuns = 0;

    for (let i = 1; i <= ITERATIONS; i++) {
        const startTime = performance.now();

        try {
            const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
            const modelProvider = openrouter(modelName);

            const { object } = await generateObject({
                model: modelProvider,
                schema: z.object({ games: z.array(GameSchema) }),
                prompt: `Extract the games for this hockey team from the provided web page text.
                         Determine if the game is Home or Away. Standardize dates to ISO format.
                         
                         Web Page Text:
                         ${textPayload}`,
                maxRetries: 0,
                abortSignal: AbortSignal.timeout(60000)
            });

            const endTime = performance.now();
            const timeTaken = endTime - startTime;
            const accuracy = calculateAccuracy(object.games);

            totalTime += timeTaken;
            totalAccuracy += accuracy;
            successfulRuns++;

            console.log(`  [${modelName}] Run ${i}/${ITERATIONS}: ${(timeTaken / 1000).toFixed(2)}s | Accuracy: ${accuracy.toFixed(1)}% | Games Found: ${object.games.length}`);

            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error: any) {
            console.log(`  [${modelName}] Run ${i} failed: ${error.message}`);
            break; // Stop immediately if we hit a bad request so we don't spam 10 times
        }
    }

    if (successfulRuns === 0) {
        console.log(`❌ [${modelName}] Failed all ${ITERATIONS} iterations.`);
        return { model: modelName, time: 0, accuracy: 0, failed: true };
    }

    const averageTime = (totalTime / successfulRuns) / 1000;
    const averageAccuracy = (totalAccuracy / successfulRuns);
    console.log(`✅ [${modelName}] Avg Time: ${averageTime.toFixed(2)}s | Avg Accuracy: ${averageAccuracy.toFixed(1)}%`);

    return { model: modelName, time: averageTime, accuracy: averageAccuracy, failed: false };
}

async function main() {
    console.log("Preparing payload...");
    const textPayload = await fetchAndCleanHTML();
    console.log("Payload ready.");

    console.log(`🚀 Starting benchmark for ${modelsToTest.length} models in parallel...`);
    const results = await Promise.all(modelsToTest.map(model => runBenchmark(model, textPayload)));

    console.log("\n=======================================================");
    console.log("🏆 FINAL RESULTS (Average of 10 runs)");
    console.log("=======================================================");

    // Sort by accuracy descending, then time ascending
    results.sort((a, b) => {
        if (a.failed && !b.failed) return 1;
        if (!a.failed && b.failed) return -1;
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return a.time - b.time;
    });

    results.forEach(r => {
        if (r.failed) {
            console.log(`${r.model.padEnd(35)} | FAILED TO RUN`);
        } else {
            console.log(`${r.model.padEnd(35)} | Acc: ${r.accuracy.toFixed(1).padStart(5)}% | Time: ${r.time.toFixed(2)}s`);
        }
    });
}

main();
