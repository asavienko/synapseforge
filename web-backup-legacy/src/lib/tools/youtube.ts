import { AgentTool } from "./types";

export const youtubeTools: AgentTool[] = [
  {
    name: "youtube_get_comments",
    description: "Get recent comments on a YouTube video",
    parameters: {
      type: "object",
      properties: {
        video_id: {
          type: "string",
          description: "YouTube video ID (from URL after v=)",
        },
        max_results: {
          type: "string",
          description: "Number of comments (1-100)",
        },
      },
      required: ["video_id"],
    },
    requiredCredential: "youtube_api_key",
    execute: async ({ video_id, max_results }, { credentials }) => {
      const n = Math.min(
        100,
        parseInt((max_results as string) || "20") || 20
      );
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?videoId=${video_id}&key=${credentials.youtube_api_key}&maxResults=${n}&part=snippet&order=time`
      );
      const data = await res.json();
      if (data.error) return `YouTube API error: ${data.error.message}`;
      return (
        (data.items || [])
          .map(
            (item: {
              snippet: {
                topLevelComment: {
                  snippet: {
                    authorDisplayName: string;
                    textDisplay: string;
                    likeCount: number;
                  };
                };
              };
            }) => {
              const s = item.snippet.topLevelComment.snippet;
              return `${s.authorDisplayName}: ${s.textDisplay} (👍 ${s.likeCount})`;
            }
          )
          .join("\n") || "No comments found"
      );
    },
  },
  {
    name: "youtube_get_channel_stats",
    description:
      "Get YouTube channel statistics — subscriber count, view count, video count",
    parameters: {
      type: "object",
      properties: {
        channel_id: {
          type: "string",
          description: "YouTube channel ID",
        },
      },
      required: ["channel_id"],
    },
    requiredCredential: "youtube_api_key",
    execute: async ({ channel_id }, { credentials }) => {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?id=${channel_id}&key=${credentials.youtube_api_key}&part=statistics,snippet`
      );
      const data = await res.json();
      if (data.error) return `YouTube API error: ${data.error.message}`;
      const ch = data.items?.[0];
      if (!ch) return "Channel not found";
      const s = ch.statistics;
      return `Channel: ${ch.snippet.title}\nSubscribers: ${parseInt(
        s.subscriberCount || "0"
      ).toLocaleString()}\nTotal views: ${parseInt(
        s.viewCount || "0"
      ).toLocaleString()}\nVideos: ${s.videoCount}`;
    },
  },
  {
    name: "youtube_search",
    description: "Search for YouTube videos by keyword",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        max_results: {
          type: "string",
          description: "Number of results (1-10)",
        },
        channel_id: {
          type: "string",
          description: "Limit search to a specific channel (optional)",
        },
      },
      required: ["query"],
    },
    requiredCredential: "youtube_api_key",
    execute: async ({ query, max_results, channel_id }, { credentials }) => {
      const n = Math.min(10, parseInt((max_results as string) || "5") || 5);
      let url = `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(
        query as string
      )}&key=${
        credentials.youtube_api_key
      }&maxResults=${n}&part=snippet&type=video`;
      if (channel_id) url += `&channelId=${channel_id}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.error) return `YouTube API error: ${data.error.message}`;
      return (
        (data.items || [])
          .map(
            (item: {
              id: { videoId: string };
              snippet: {
                title: string;
                channelTitle: string;
                publishedAt: string;
                description: string;
              };
            }) =>
              `"${item.snippet.title}" by ${
                item.snippet.channelTitle
              }\nhttps://youtube.com/watch?v=${
                item.id.videoId
              }\n${item.snippet.description?.slice(0, 100)}`
          )
          .join("\n\n") || "No videos found"
      );
    },
  },
];
