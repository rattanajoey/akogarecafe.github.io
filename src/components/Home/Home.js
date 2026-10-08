import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchChannelVideos } from "../../utils/youtube";
import Grid2 from "@mui/material/Grid2";
import { Box, Button, Tabs, Tab, Typography, useMediaQuery } from "@mui/material";

const HomeComponent = () => {
  const canEmbedTwitch = useMediaQuery("(min-width: 600px)");
  const [activeView, setActiveView] = useState("youtube");
  const [selectedVideoId, setCurrentVideoId] = useState(null);
  const [activeTab, setActiveTab] = useState("videos");
  const twitchUsername = "akogarecafe";
  const { data: videos = [], isPending: loading, isError: error } = useQuery({
    queryKey: ["youtube-uploads"],
    queryFn: ({ signal }) => fetchChannelVideos({ apiKey: process.env.REACT_APP_YOUTUBE_API_KEY, channelId: "UCP77ij2ue_xEz2f5TmH0Rbw", signal }),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const shorts = videos.filter((video) => video.duration > 0 && video.duration <= 180);
  const playlist = activeTab === "videos" ? videos : shorts;
  const currentVideoId = playlist.some((video) => video.id === selectedVideoId) ? selectedVideoId : playlist[0]?.id;

  const handleVideoSelect = (videoId) => {
    setCurrentVideoId(videoId);
    setActiveView("youtube");
  };

  const renderPlaylist = () => {
    return playlist.map((video) => (
      <Box
        component="button"
        type="button"
        aria-pressed={currentVideoId === video.id && activeView === "youtube"}
        key={video.id}
        sx={{
          display: "flex",
          width: "100%",
          color: "inherit",
          font: "inherit",
          textAlign: "left",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          borderRadius: 1,
          border: 2,
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
          alt=""
          loading="lazy"
          sx={{
            width: { xs: 60, sm: 80, md: 100 },
            height: { xs: 34, sm: 45, md: 56 },
            objectFit: "cover",
            flexShrink: 0,
            borderRadius: 1,
          }}
        />
        <Typography
          variant="body2"
          sx={{
            minWidth: 0,
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
        width: "100%",
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
        pb: { xs: 14, md: 16 },
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
          width: "100%",
          maxWidth: 1200,
          alignItems: "flex-start",
        }}
      >
        <Grid2 size={12}>
          <Typography component="h1" variant="h4" sx={{ mb: 2, textAlign: "center", fontSize: { xs: "1.75rem", sm: "2.25rem" } }}>Welcome to Akogare Cafe</Typography>
        </Grid2>
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
              {/* Monitor Controls */}
              <Box
                sx={{
                  bgcolor: "rgba(0,0,0,0.7)",
                  borderRadius: 2,
                  p: { xs: 0.5, md: 1 },
                  display: "flex",
                  gap: { xs: 1, md: 2 },
                }}
                role="group"
                aria-label="Video source"
              >
                <Button
                  aria-pressed={activeView === "youtube"}
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
                  aria-pressed={activeView === "twitch"}
                  onClick={() => setActiveView("twitch")}
                  variant={activeView === "twitch" ? "contained" : "outlined"}
                  color={activeView === "twitch" ? "primary" : "inherit"}
                  size="small"
                  sx={{
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    borderRadius: 1,
                    position: "relative",
                  }}
                >
                  Twitch
                </Button>
              </Box>
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
                minHeight: activeView === "twitch" && canEmbedTwitch ? 324 : 0,
                borderRadius: 2,
              }}
              className="pc-monitor"
            >
              {activeView === "youtube" && !currentVideoId && (
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", p: 2, textAlign: "center" }} role="status">
                  <Typography sx={{ mb: 1 }}>{loading ? "Loading videos…" : error ? "The video feed is unavailable right now." : "No videos in this selection."}</Typography>
                  {!loading && <Button href="https://www.youtube.com/c/akogarecafe" target="_blank" rel="noopener noreferrer" color="inherit">Watch on YouTube</Button>}
                </Box>
              )}
              {activeView === "twitch" && !canEmbedTwitch && (
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", p: 2, textAlign: "center" }}>
                  <Typography sx={{ mb: 1 }}>Catch my streams on Twitch.</Typography>
                  <Button href="https://www.twitch.tv/akogarecafe" target="_blank" rel="noopener noreferrer" variant="outlined" color="inherit">Watch on Twitch</Button>
                </Box>
              )}
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
                  title={`YouTube: ${playlist.find((video) => video.id === currentVideoId)?.title || "Featured video"}`}
                />
              )}
              {activeView === "twitch" && canEmbedTwitch && (
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
                  allow="autoplay; fullscreen"
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
              textColor="inherit"
              aria-label="Video length"
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="fullWidth"
              sx={{
                "& .MuiTabs-indicator": { bgcolor: "#4ecdc4" },
                "& .Mui-selected": { color: "white" },
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
                  minWidth: 0,
                  fontSize: { xs: "0.85rem", md: "0.9rem" },
                  textTransform: "uppercase",
                }}
                className={
                  activeTab === "videos" ? "tab-button active" : "tab-button"
                }
              />
              <Tab
                label="Short videos"
                value="shorts"
                sx={{
                  flexGrow: 1,
                  fontWeight: "bold",
                  color:
                    activeTab === "shorts" ? "white" : "rgba(255,255,255,0.5)",
                  borderBottom: activeTab === "shorts" ? 3 : 0,
                  borderBottomColor:
                    activeTab === "shorts" ? "error.main" : "transparent",
                  minWidth: 0,
                  fontSize: { xs: "0.85rem", md: "0.9rem" },
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
              {activeTab === "shorts" && <Typography variant="caption" sx={{ display: "block", mb: 1 }}>Uploads up to 3 minutes</Typography>}
              {loading && <Typography role="status">Loading videos…</Typography>}
              {error && <Typography role="status">The video feed is unavailable. Visit the full channel below.</Typography>}
              {!loading && !error && (playlist.length ? renderPlaylist() : <Typography>No videos in this selection.</Typography>)}
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
