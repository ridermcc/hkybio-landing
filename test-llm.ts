import { getSchedule } from './src/lib/llm-schedule';

async function run() {
    try {
        console.log("Fetching schedule...");
        const result = await getSchedule('https://athletics.plymouth.edu/sports/mhockey/schedule');
        console.log("Result:");
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
