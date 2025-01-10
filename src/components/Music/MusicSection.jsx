import React from "react";
import Grid from "@mui/material/Grid2";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Slide,
} from "@mui/material";
import { useState } from "react";
import { artists } from "../constants/MusicInfo";
import { SongContainer, SongList } from "./style";

const MusicSection = () => {
  const [expanded, setExpanded] = useState(null);

  const handleExpandClick = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <Box sx={{ flexGrow: 1, mb: 24 }}>
      <Grid container spacing={3} mt={4} p={3}>
        {artists.map((artist, index) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}
            key={artist.name}
            justifyItems={"center"}
          >
            <Card
              sx={{ position: "relative", cursor: "pointer", width: "70%" }}
            >
              <CardMedia
                component="img"
                height="auto"
                image={artist.albumCover}
                alt={`${artist.name}`}
                sx={{ objectFit: "cover", width: "100%" }}
              />
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
    </Box>
  );
};

export default MusicSection;
