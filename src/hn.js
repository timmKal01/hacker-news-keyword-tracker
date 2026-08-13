const UA = 'HackerNewsKeywordTracker/0.1 (+contact: hn-tracker-admin@example.com)';
const API_URL = 'https://hn.algolia.com/api/v1/search_by_date';

export async function fetchMentions({ keyword, includeComments, startDate, maxResults }) {
    const tags = includeComments ? '(story,comment)' : 'story';
    const startUnix = Math.floor(startDate.getTime() / 1000);

    const url = new URL(API_URL);
    url.searchParams.set('query', keyword);
    url.searchParams.set('tags', tags);
    url.searchParams.set('numericFilters', `created_at_i>${startUnix}`);
    url.searchParams.set('hitsPerPage', String(Math.min(maxResults, 100)));

    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`HN Algolia search failed for "${keyword}": ${res.status}`);

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
