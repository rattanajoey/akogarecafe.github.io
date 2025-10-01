import React, { useState, useEffect, useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import axios from "axios";
import Grid2 from "@mui/material/Grid2";
import { Box, Button, Tabs, Tab, Typography } from "@mui/material";

// Helper function to parse ISO 8601 duration
const parseDuration = (duration) => {
  if (!duration) return 0;
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
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
  const [activeTab, setActiveTab] = useState("videos");
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
      const tokenResponse = await axios.post(
        `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
      );
      const accessToken = tokenResponse.data.access_token;
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
        setActiveView("twitch");
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
      <Box
        key={video.id}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          borderRadius: 1,
          border:
            currentVideoId === video.id && activeView === "youtube" ? 2 : 0,
          borderColor:
            currentVideoId === video.id && activeView === "youtube"
              ? "error.main"
              : "transparent",
          bgcolor:
            currentVideoId === video.id && activeView === "youtube"
              ? "rgba(255, 71, 87, 0.2)"
              : "transparent",
          p: 0.5,
          mb: 0.5,
          transition: "background-color 0.3s",
          "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
        }}
        onClick={() => handleVideoSelect(video.id)}
      >
        <Box
          component="img"
          src={`https://i3.ytimg.com/vi/${video.id}/mqdefault.jpg`}
          alt={video.title}
          sx={{
            width: { xs: 60, sm: 80, md: 100 },
            height: { xs: 34, sm: 45, md: 56 },
            objectFit: "cover",
            borderRadius: 1,
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: "0.8rem", sm: "0.9rem" },
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: { xs: 2, sm: 3 },
            WebkitBoxOrient: "vertical",
          }}
        >
          {video.title}
        </Typography>
      </Box>
    ));
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at center, #3a3a3a 0%, #1a1a1a 70%)",
        color: "white",
        overflow: "hidden",
        fontFamily: "'Montserrat', sans-serif",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        pt: { xs: 2, md: 5 },
        boxSizing: "border-box",
        px: { xs: 1.5, sm: 2, md: 0 },
        pb: { xs: 25, md: 15 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
        className="room-background"
      />

      <Grid2
        container
        spacing={{ xs: 1, md: 4 }}
        sx={{
          width: { xs: "100vw", md: "90vw" },
          maxWidth: 1200,
          minHeight: { xs: "auto", md: "80vh" },
          height: { md: "80vh" },
        }}
      >
        <Grid2 size={{ xs: 12, md: 9 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: { xs: 1, md: 2 },
              height: "100%",
            }}
          >
            {/* PC Monitor */}
            <Box
              sx={{
                width: "100%",
                bgcolor: "#0c0c0c",
                border: "4px solid #333",
                boxShadow: "0 0 20px rgba(255, 71, 87, 0.2)",
                p: { xs: 0.5, md: 1 },
                position: "relative",
                display: "flex",
                justifyContent: "center",
                overflow: "hidden",
                aspectRatio: "16 / 9",
                minHeight: 0,
                borderRadius: 2,
              }}
              className="pc-monitor"
            >
              {/* Monitor Controls */}
              <Box
                sx={{
                  position: "absolute",
                  top: { xs: 8, md: 16 },
                  left: "50%",
                  transform: "translateX(-50%)",
                  bgcolor: "rgba(0,0,0,0.7)",
                  borderRadius: 2,
                  p: { xs: 0.5, md: 1 },
                  display: "flex",
                  gap: { xs: 1, md: 2 },
                  opacity: 1,
                  zIndex: 10,
                }}
                className="monitor-controls"
              >
                <Button
                  onClick={() => setActiveView("youtube")}
                  variant={activeView === "youtube" ? "contained" : "outlined"}
                  color={activeView === "youtube" ? "error" : "inherit"}
                  size="small"
                  sx={{
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    borderRadius: 1,
                  }}
                >
                  YouTube
                </Button>
                <Button
                  onClick={() => isLiveOnTwitch && setActiveView("twitch")}
                  variant={activeView === "twitch" ? "contained" : "outlined"}
                  color={activeView === "twitch" ? "primary" : "inherit"}
                  size="small"
                  disabled={!isLiveOnTwitch}
                  sx={{
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    borderRadius: 1,
                    opacity: isLiveOnTwitch ? 1 : 0.5,
                    position: "relative",
                  }}
                >
                  Twitch
                  {isLiveOnTwitch && (
                    <Box
                      component="span"
                      sx={{
                        ml: 1,
                        bgcolor: "error.main",
                        color: "white",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        px: 1,
                        borderRadius: 1,
                        animation: "pulse 1.5s infinite",
                        position: "absolute",
                        top: -8,
                        right: -15,
                      }}
                    >
                      LIVE
                    </Box>
                  )}
                </Button>
              </Box>
              {/* Video Embeds */}
              {activeView === "youtube" && currentVideoId && (
                <Box
                  component="iframe"
                  key={currentVideoId}
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 1,
                  }}
                  src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=1&loop=1&playlist=${currentVideoId}&rel=0`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Featured Video"
                />
              )}
              {activeView === "twitch" && isLiveOnTwitch && (
                <Box
                  component="iframe"
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 1,
                  }}
                  src={`https://player.twitch.tv/?channel=${twitchUsername}&parent=${window.location.hostname}&muted=true`}
                  frameBorder="0"
                  allowFullScreen
                  scrolling="no"
                  title="Twitch Stream"
                />
              )}
            </Box>
            {/* Action Bar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: { xs: 0.5, md: 2 },
                flexWrap: { xs: "wrap", md: "nowrap" },
                width: "100%",
                mt: 2,
              }}
              className="action-bar"
            >
              <Button
                component={RouterLink}
                to="/music"
                variant="outlined"
                color="inherit"
                sx={{
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.5 },
                  borderRadius: 2,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  width: { xs: "100%", sm: "auto" },
                }}
                className="action-button"
              >
                Music
              </Button>
              <Button
                component={RouterLink}
                to="/MovieClub"
                variant="outlined"
                color="inherit"
                sx={{
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.5 },
                  borderRadius: 2,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  width: { xs: "100%", sm: "auto" },
                }}
                className="action-button"
              >
                Movie Club
              </Button>
              <Button
                component={RouterLink}
                to="/shogi"
                variant="outlined"
                color="inherit"
                sx={{
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.5 },
                  borderRadius: 2,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  width: { xs: "100%", sm: "auto" },
                }}
                className="action-button"
              >
                Shogi
              </Button>
              <Button
                component={RouterLink}
                to="/portfolio"
                variant="outlined"
                color="inherit"
                sx={{
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.5 },
                  borderRadius: 2,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  width: { xs: "100%", sm: "auto" },
                }}
                className="action-button"
              >
                Portfolio
              </Button>
            </Box>
          </Box>
        </Grid2>
        {/* Video Playlist */}
        <Grid2 size={{ xs: 12, md: 3 }}>
          <Box
            sx={{
              bgcolor: "rgba(0,0,0,0.2)",
              borderRadius: 2,
              p: { xs: 0.5, md: 0 },
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: { xs: "400px", md: "500px" },
              minWidth: 0,
              width: "100%",
              maxWidth: "100vw",
              mt: { xs: 2, md: 0 },
            }}
            className="video-playlist"
          >
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="fullWidth"
              sx={{
                mb: 1,
                flexDirection: { xs: "column", sm: "row" },
                minHeight: 0,
              }}
              className="playlist-tabs"
            >
              <Tab
                label="Videos"
                value="videos"
                sx={{
                  flexGrow: 1,
                  fontWeight: "bold",
                  color:
                    activeTab === "videos" ? "white" : "rgba(255,255,255,0.5)",
                  borderBottom: activeTab === "videos" ? 3 : 0,
                  borderBottomColor:
                    activeTab === "videos" ? "error.main" : "transparent",
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  textTransform: "uppercase",
                }}
                className={
                  activeTab === "videos" ? "tab-button active" : "tab-button"
                }
              />
              <Tab
                label="Shorts"
                value="shorts"
                sx={{
                  flexGrow: 1,
                  fontWeight: "bold",
                  color:
                    activeTab === "shorts" ? "white" : "rgba(255,255,255,0.5)",
                  borderBottom: activeTab === "shorts" ? 3 : 0,
                  borderBottomColor:
                    activeTab === "shorts" ? "error.main" : "transparent",
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  textTransform: "uppercase",
                }}
                className={
                  activeTab === "shorts" ? "tab-button active" : "tab-button"
                }
              />
            </Tabs>
            <Box
              sx={{
                p: { xs: 0.5, md: 1 },
                overflowY: "auto",
                flexGrow: 1,
              }}
              className="playlist-content"
            >
              {loading && <Typography>Loading...</Typography>}
              {error && <Typography color="error.main">{error}</Typography>}
              {!loading && !error && renderPlaylist()}
            </Box>
            <Button
              href="https://www.youtube.com/c/akogarecafe"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              color="inherit"
              sx={{
                mt: "auto",
                textAlign: "center",
                fontSize: { xs: "0.9rem", md: "1rem" },
                borderRadius: 2,
                py: 1,
              }}
              className="full-channel-link"
            >
              Full Channel
            </Button>

            {/* Subtle Social Media Section */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "rgba(255,255,255,0.05)",
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  mb: 1.5,
                  fontWeight: "medium",
                }}
              >
                Stay Connected
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                }}
              >
                <Box
                  component="a"
                  href="https://www.youtube.com/c/akogarecafe"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    fontSize: "0.8rem",
                    transition: "color 0.3s ease",
                    "&:hover": {
                      color: "#ff4757",
                      textDecoration: "none",
                    },
                  }}
                >
                  📺 YouTube
                </Box>
                <Box
                  component="a"
                  href="https://www.twitch.tv/akogarecafe"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    fontSize: "0.8rem",
                    transition: "color 0.3s ease",
                    "&:hover": {
                      color: "#9146ff",
                      textDecoration: "none",
                    },
                  }}
                >
                  🎮 Twitch
                </Box>
                <Box
                  component="a"
                  href="https://linktr.ee/akogarecafe"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    fontSize: "0.8rem",
                    transition: "color 0.3s ease",
                    "&:hover": {
                      color: "#00d4aa",
                      textDecoration: "none",
                    },
                  }}
                >
                  🔗 All Links
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default HomeComponent;
