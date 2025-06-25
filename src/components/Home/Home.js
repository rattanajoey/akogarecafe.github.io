import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Home.css";

// Helper function to parse ISO 8601 duration
const parseDuration = (duration) => {
  if (!duration) return 0;
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0; // Guard against unexpected formats
  match.shift();
  const [hours, minutes, seconds] = match.map(
    (part) => parseInt(part, 10) || 0
  );
  return hours * 3600 + minutes * 60 + seconds;
};

const HomeComponent = () => {
  const [activeView, setActiveView] = useState("youtube");
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("videos"); // 'videos' or 'shorts'
  const [isLiveOnTwitch, setIsLiveOnTwitch] = useState(false);
  const twitchUsername = "akogarecafe";

  const checkTwitchStatus = useCallback(async () => {
    try {
      const clientId = process.env.REACT_APP_TWITCH_CLIENT_ID;
      const clientSecret = process.env.REACT_APP_TWITCH_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        console.warn("Twitch credentials not found. Skipping live check.");
        return;
      }

      // 1. Get an App Access Token
      const tokenResponse = await axios.post(
        `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
      );
      const accessToken = tokenResponse.data.access_token;

      // 2. Check if the stream is live
      const streamResponse = await axios.get(
        `https://api.twitch.tv/helix/streams?user_login=${twitchUsername}`,
        {
          headers: {
            "Client-ID": clientId,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (streamResponse.data.data.length > 0) {
        setIsLiveOnTwitch(true);
        setActiveView("twitch"); // Default to Twitch view when live
      }
    } catch (err) {
      console.error(
        "Error checking Twitch status:",
        err.response ? err.response.data : err
      );
    }
  }, [twitchUsername]);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
      const channelId = "UCP77ij2ue_xEz2f5TmH0Rbw";

      // Step 1: Search for recent video IDs
      const searchResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            key: apiKey,
            channelId,
            part: "snippet,id",
            order: "date",
            maxResults: 30,
            type: "video",
          },
        }
      );

      const videoIds = searchResponse.data.items
        .map((item) => item.id.videoId)
        .join(",");

      // Step 2: Get video details, including duration
      const detailsResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos`,
        {
          params: { key: apiKey, id: videoIds, part: "snippet,contentDetails" },
        }
      );

      const allVideos = detailsResponse.data.items.map((item) => ({
        id: item.id,
        title: item.snippet.title,
        duration: parseDuration(item.contentDetails.duration),
      }));

      const regularVideos = allVideos.filter((video) => video.duration > 120);
      const shortVideos = allVideos.filter((video) => video.duration <= 120);

      setVideos(regularVideos);
      setShorts(shortVideos);

      if (regularVideos.length > 0) {
        setCurrentVideoId(regularVideos[0].id);
      } else if (shortVideos.length > 0) {
        setCurrentVideoId(shortVideos[0].id);
        setActiveTab("shorts");
      }

      setLoading(false);
    } catch (err) {
      console.error(
        "Error fetching YouTube videos:",
        err.response ? err.response.data : err
      );
      setError(
        "Failed to load videos. Please check the API key and try again."
      );
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
    checkTwitchStatus();
  }, [fetchVideos, checkTwitchStatus]);

  const handleVideoSelect = (videoId) => {
    setCurrentVideoId(videoId);
    setActiveView("youtube");
  };

  const renderPlaylist = () => {
    const playlist = activeTab === "videos" ? videos : shorts;
    return playlist.map((video) => (
      <div
        key={video.id}
        className={`video-item ${
          currentVideoId === video.id && activeView === "youtube"
            ? "active"
            : ""
        }`}
        onClick={() => handleVideoSelect(video.id)}
      >
        <img
          src={`https://i3.ytimg.com/vi/${video.id}/mqdefault.jpg`}
          alt={video.title}
          className="video-thumbnail"
        />
        <p className="video-title">{video.title}</p>
      </div>
    ));
  };

  return (
    <div className="digital-room">
      <div className="room-background"></div>

      <div className="main-layout">
        <div className="content-area">
          <div className="room-object pc-monitor">
            <div className="monitor-controls">
              <button
                onClick={() => setActiveView("youtube")}
                className={activeView === "youtube" ? "active" : ""}
              >
                YouTube
              </button>
              <button
                onClick={() => isLiveOnTwitch && setActiveView("twitch")}
                className={`twitch-button ${
                  activeView === "twitch" ? "active" : ""
                } ${isLiveOnTwitch ? "live" : "offline"}`}
                disabled={!isLiveOnTwitch}
              >
                Twitch
              </button>
            </div>
            {activeView === "youtube" && currentVideoId && (
              <iframe
                key={currentVideoId}
                className="video-embed"
                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=1&loop=1&playlist=${currentVideoId}&rel=0`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Featured Video"
              ></iframe>
            )}
            {activeView === "twitch" && isLiveOnTwitch && (
              <iframe
                className="video-embed"
                src={`https://player.twitch.tv/?channel=${twitchUsername}&parent=${window.location.hostname}&muted=true`}
                frameBorder="0"
                allowFullScreen={true}
                scrolling="no"
                title="Twitch Stream"
              ></iframe>
            )}
          </div>

          <div className="action-bar">
            <Link to="/music" className="action-button">
              Music
            </Link>
            <Link to="/MovieClub" className="action-button">
              Movie Club
            </Link>{" "}
            <Link to="/shogi" className="action-button">
              Shogi
            </Link>{" "}
            <Link to="/portfolio" className="action-button">
              Portfolio
            </Link>
          </div>
        </div>

        <div className="video-playlist">
          <div className="playlist-tabs">
            <button
              onClick={() => setActiveTab("videos")}
              className={`tab-button ${activeTab === "videos" ? "active" : ""}`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab("shorts")}
              className={`tab-button ${activeTab === "shorts" ? "active" : ""}`}
            >
              Shorts
            </button>
          </div>
          <div className="playlist-content">
            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && renderPlaylist()}
          </div>
          <a
            href="https://www.youtube.com/c/akogarecafe"
            target="_blank"
            rel="noopener noreferrer"
            className="action-button full-channel-link"
          >
            Full Channel
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomeComponent;
