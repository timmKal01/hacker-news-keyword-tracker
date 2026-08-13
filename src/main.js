import { Actor, log } from 'apify';
import { fetchMentions } from './hn.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { keywords = [], includeComments = true, daysBack = 14, maxResultsPerKeyword = 20 } = input;

if (keywords.length === 0) {
    throw new Error('No keywords provided.');
}

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const KEYWORD_SEARCH_EVENT = 'keyword-search';

const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

for (const keyword of keywords) {
    let mentions;
    try {
        mentions = await fetchMentions({
            keyword,
            includeComments,
            startDate,
            maxResults: Math.min(maxResultsPerKeyword, 100),
        });
    } catch (err) {
        log.warning(`Failed to fetch mentions`, { keyword, error: err.message });
        continue;
    }

    if (mentions.length > 0) {
        await Actor.pushData(mentions);
    }
    await Actor.charge({ eventName: KEYWORD_SEARCH_EVENT });

    log.info(`Searched keyword`, { keyword, mentionsFound: mentions.length });
}

await Actor.exit();
