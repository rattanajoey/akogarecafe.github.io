import axios from "axios";

export const parseDuration = (duration) => {
  const match = typeof duration === "string" && duration.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!match) return 0;
  const [days, hours, minutes, seconds] = match.slice(1).map((value) => Number(value) || 0);
  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
};

export const fetchChannelVideos = async ({ apiKey, channelId, signal }) => {
  if (!apiKey) throw new Error("Video feed unavailable");
  const request = async (resource, params) => {
    const { data } = await axios.get(`https://www.googleapis.com/youtube/v3/${resource}`, {
      params: { key: apiKey, ...params }, signal, timeout: 10000,
    });
    return data;
  };
  const channel = await request("channels", { part: "contentDetails", id: channelId });
  const uploads = channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error("Video feed unavailable");
  const playlist = await request("playlistItems", { part: "contentDetails", playlistId: uploads, maxResults: 50 });
  const ids = [...new Set((playlist.items || []).map((item) => item.contentDetails?.videoId).filter(Boolean))];
  if (!ids.length) return [];
  const details = await request("videos", { part: "snippet,contentDetails", id: ids.join(",") });
  const byId = new Map((details.items || [])
    .filter((item) => item.id && item.snippet?.title)
    .map((item) => [item.id, { id: item.id, title: item.snippet.title, duration: parseDuration(item.contentDetails?.duration) }]));
  // videos.list can return a different order or omit removed/private uploads.
  return ids.map((id) => byId.get(id)).filter(Boolean);
};
