import React from "react";
import { useState } from "react";
import Grid from "@mui/material/Grid2";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Slide,
} from "@mui/material";
import { MusicWrapper, SongContainer, SongList } from "./style";
import { artists } from "../constants/MusicInfo";
import Image from "next/image";
import MusicEffect from "../MusicEffect/MusicEffect";

const MusicSection = () => {
  const [expanded, setExpanded] = useState(null);

  const handleExpandClick = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <MusicWrapper>
      <MusicEffect />
      <Grid container spacing={3} p={3} pb={32}>
        {artists.map((artist, index) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}
            key={artist.name}
            justifyItems={"center"}
          >
            <Card
              sx={{
                position: "relative",
                cursor: "pointer",
                width: "70%",
                bgcolor: "transparent",
              }}
            >
              <Box sx={{ position: "relative", paddingTop: "100%" }}>
                <Image
                  src={artist.albumCover}
                  alt={`${artist.name}'s album cover`}
                  width={300}
                  height={300}
                  priority
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </Box>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {artist.name}
                </Typography>
                <Button
                  size="small"
                  onClick={() => handleExpandClick(index)}
                  sx={{ marginTop: 1 }}
                >
                  Explore
                </Button>
              </CardContent>
              <Slide
                direction="right"
                in={expanded === index}
                mountOnEnter
                unmountOnExit
              >
                <SongContainer
                  sx={{
                    display: expanded === index ? "block" : "none",
                  }}
                  onClick={() => handleExpandClick(index)}
                >
                  <Typography variant="h6">Favorite Songs</Typography>
                  <SongList>
                    {artist.favoriteSongs.map((song) => (
                      <li key={song}>{song}</li>
                    ))}
                  </SongList>
                  <Button
                    href={artist.moreInfoLink}
                    target="_blank"
                    size="small"
                    sx={{ marginTop: 1 }}
                  >
                    More Info
                  </Button>
                </SongContainer>
              </Slide>
            </Card>
          </Grid>
        ))}
      </Grid>
    </MusicWrapper>
  );
};

export default MusicSection;
