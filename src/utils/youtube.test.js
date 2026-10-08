import axios from "axios";
import { fetchChannelVideos, parseDuration } from "./youtube";

jest.mock("axios");
beforeEach(() => jest.resetAllMocks());

test.each([["PT3M",180],["PT1H2M3S",3723],["P1DT2H",93600],["PT45S",45],[null,0],["PT4Mbroken",0]])("parses duration %s", (input, expected) => {
  expect(parseDuration(input)).toBe(expected);
});

const args = { apiKey: "test-key", channelId: "channel", signal: new AbortController().signal };
const channel = { data: { items: [{ contentDetails: { relatedPlaylists: { uploads: "uploads" } } }] } };
test("uses uploads, preserves newest order, and skips missing videos", async () => {
  axios.get.mockResolvedValueOnce(channel)
    .mockResolvedValueOnce({ data: { items: ["new", "removed", "old"].map((videoId) => ({ contentDetails: { videoId } })) } })
    .mockResolvedValueOnce({ data: { items: ["old", "new"].map((id) => ({ id, snippet: { title: id }, contentDetails: { duration: "PT3M" } })) } });
  expect(await fetchChannelVideos(args)).toEqual([{ id: "new", title: "new", duration: 180 }, { id: "old", title: "old", duration: 180 }]);
  expect(axios.get.mock.calls.map(([url]) => url.split("/").pop())).toEqual(["channels", "playlistItems", "videos"]);
  expect(axios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ signal: args.signal, timeout: 10000 }));
});
test("empty uploads do not request video details", async () => {
  axios.get.mockResolvedValueOnce(channel).mockResolvedValueOnce({ data: { items: [] } });
  expect(await fetchChannelVideos(args)).toEqual([]);
  expect(axios.get).toHaveBeenCalledTimes(2);
});
test("missing configuration makes no request", async () => {
  await expect(fetchChannelVideos({ ...args, apiKey: undefined })).rejects.toThrow();
  expect(axios.get).not.toHaveBeenCalled();
});
test("missing channel and failed requests fail without inventing uploads", async () => {
  axios.get.mockResolvedValueOnce({ data: {} });
  await expect(fetchChannelVideos(args)).rejects.toThrow();
  axios.get.mockRejectedValueOnce(new Error("Network failed"));
  await expect(fetchChannelVideos(args)).rejects.toThrow("Network failed");
});
