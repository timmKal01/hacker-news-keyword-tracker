# Hacker News Keyword Tracker — New Mentions & Discussions

Track new Hacker News stories and comments mentioning a keyword — your
product, a competitor, or a topic. Get the title, points, comment count,
author, and link the moment it's posted, without refreshing HN's search
by hand.

Built for founders and marketers watching for mentions of their product,
and researchers or investors tracking how a topic is being discussed.

## Input

```json
{
  "keywords": ["apify", "web scraping"],
  "includeComments": true,
  "daysBack": 14,
  "maxResultsPerKeyword": 20
}
```

| Field | Type | Description |
|---|---|---|
| `keywords` | array of strings | Search terms. One search is billed per keyword. |
| `includeComments` | boolean | Also match comments, not just submitted stories. Default `true`. |
| `daysBack` | number | Only return posts/comments from within this many days of today. Default `14`, max `90`. |
| `maxResultsPerKeyword` | number | Max matches to return per keyword, most recent first. Default `20`, max `100`. |

## Output

One record per match:

```json
{
  "keyword": "apify",
  "type": "story",
  "objectID": "49119659",
  "title": "YouTube Shorts Scraper and MCP Connector",
  "author": "techforce_actor",
  "points": 2,
  "numComments": 0,
  "createdAt": "2026-07-31T06:23:39Z",
  "externalUrl": "https://apify.com/techforce.global/youtube-shorts-scraper",
  "hnUrl": "https://news.ycombinator.com/item?id=49119659"
}
```

A keyword with no matches in the requested window returns no items but
is still billed once for the search.

## How it works

Direct calls to the official [Algolia Hacker News Search
API](https://hn.algolia.com/api) (`hn.algolia.com`), the same search
index that powers HN's own search page. No proxy, no key, no scraping.

## Pricing note

Billed per **keyword searched**, not per mention returned — one charge
per keyword whether it matches 0 or 100 posts/comments.

## Related products

- [GitHub Release Tracker](https://github.com/timmKal01/github-release-tracker) — new versions of repos you depend on, a different kind of "watch this thing" tracker
