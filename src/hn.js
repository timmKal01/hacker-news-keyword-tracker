const UA = 'HackerNewsKeywordTracker/0.1 (+contact: hn-tracker-admin@example.com)';
const API_URL = 'https://hn.algolia.com/api/v1/search_by_date';

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const REQUEST_TIMEOUT_MS = 15_000;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options) {
    let lastError;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        let res;
        try {
            res = await fetch(url, { ...options, signal: controller.signal });
        } catch (err) {
            lastError = err.name === 'AbortError' ? new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms: ${url}`) : err;
            if (attempt < MAX_ATTEMPTS) {
                await sleep(1000 * 2 ** (attempt - 1));
                continue;
            }
            throw lastError;
        } finally {
            clearTimeout(timeoutId);
        }
        if (res.ok) return res;
        if (!TRANSIENT_STATUSES.has(res.status)) {
            throw new Error(`HN Algolia search failed: ${res.status} ${res.statusText}`);
        }
        lastError = new Error(`HN Algolia search failed: ${res.status} ${res.statusText}`);
        if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
    }
    throw lastError;
}

export async function fetchMentions({ keyword, includeComments, startDate, maxResults }) {
    const tags = includeComments ? '(story,comment)' : 'story';
    const startUnix = Math.floor(startDate.getTime() / 1000);

    const url = new URL(API_URL);
    url.searchParams.set('query', keyword);
    url.searchParams.set('tags', tags);
    url.searchParams.set('numericFilters', `created_at_i>${startUnix}`);
    url.searchParams.set('hitsPerPage', String(Math.min(maxResults, 100)));

    const res = await fetchWithRetry(url, { headers: { 'User-Agent': UA } });
    const data = await res.json();

    return (data.hits ?? []).slice(0, maxResults).map((h) => {
        const isStory = h._tags?.includes('story');
        return {
            keyword,
            type: isStory ? 'story' : 'comment',
            objectID: h.objectID,
            title: h.title ?? h.story_title ?? null,
            author: h.author ?? null,
            points: h.points ?? null,
            numComments: h.num_comments ?? null,
            createdAt: h.created_at,
            externalUrl: h.url ?? null,
            hnUrl: isStory ? `https://news.ycombinator.com/item?id=${h.objectID}` : `https://news.ycombinator.com/item?id=${h.story_id}#${h.objectID}`,
        };
    });
}
