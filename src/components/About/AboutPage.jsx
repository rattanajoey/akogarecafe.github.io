import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid2,
  Card,
  CardContent,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const AboutWrapper = styled(Box)({
  backgroundColor: "#000",
  minHeight: "100vh",
  color: "white",
  paddingTop: "2rem",
  paddingBottom: "2rem",
});

const StyledCard = styled(Card)({
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "12px",
  marginBottom: "2rem",
});

const AboutPage = () => {
  return (
    <AboutWrapper>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            marginBottom: 4,
            fontSize: { xs: "2.25rem", sm: "3.75rem" },
            background: "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontWeight: "bold",
          }}
        >
          About Akogare Cafe
        </Typography>

        <Grid2 container spacing={4}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <StyledCard>
              <CardContent>
                <Typography variant="h4" component="h2" gutterBottom color="white">
                  What is Akogare Cafe?
                </Typography>
                <Typography variant="body1" paragraph color="white">
                  Akogare Cafe (憧れカフェ) is a unique digital space that
                  blends Japanese culture, technology, and personal passion
                  projects. The name "Akogare" means "yearning" or "admiration"
                  in Japanese, reflecting our deep appreciation for Japanese
                  aesthetics, gaming culture, and craftsmanship.
                </Typography>
                <Typography variant="body1" paragraph color="white">
                  This website serves as both a portfolio showcase and an
                  interactive hub featuring original games, curated music
                  collections, and community-driven content. It's designed to be
                  more than just a static portfolio - it's a living, breathing
                  digital cafe where visitors can engage with various forms of
                  media and entertainment.
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <StyledCard>
              <CardContent>
                <Typography variant="h4" component="h2" gutterBottom color="white">
                  Meet the Creator
                </Typography>
                <Typography variant="body1" paragraph color="white">
                  Hi, I'm Joey Rattana, a frontend product engineer with 6+ years
                  across front-end, full-stack, and QA. I build investor
                  experiences with React, Next.js, and TypeScript, focusing on
                  experimentation, performance, and reliable financial workflows.
                  Previously at StartEngine, I was the sole engineer on an
                  investor-facing redesign and built an in-house experimentation
                  agent.
                </Typography>
                <Typography variant="body1" paragraph color="white">
                  Outside engineering, I'm into Japanese culture, anime, gaming,
                  music, collecting, filming, and content creation. Akogare Cafe
                  brings those interests together through games, music, and
                  community projects.
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid2>

          <Grid2 size={12}>
            <StyledCard>
              <CardContent>
                <Typography variant="h4" component="h2" gutterBottom color="white">
                  What You'll Find Here
                </Typography>
                <Grid2 container spacing={3}>
                  <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="h6" component="h3" color="#ff6b6b" gutterBottom>
                      Interactive Shogi
                    </Typography>
                    <Typography variant="body2" color="white">
                      An interactive Shogi movement explorer with custom piece
                      movement logic and promotion practice.
                    </Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="h6" component="h3" color="#4ecdc4" gutterBottom>
                      Music Collection
                    </Typography>
                    <Typography variant="body2" color="white">
                      Curated playlists featuring Japanese artists, indie music,
                      and personal favorites with detailed album artwork and
                      information.
                    </Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="h6" component="h3" color="#45b7d1" gutterBottom>
                      Movie Club
                    </Typography>
                    <Typography variant="body2" color="white">
                      A community-driven platform for movie recommendations and
                      discussions, featuring genre-based selections and monthly
                      themes.
                    </Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="h6" component="h3" color="#f9ca24" gutterBottom>
                      Portfolio
                    </Typography>
                    <Typography variant="body2" color="white">
                      Professional portfolio showcasing technical skills, work
                      experience, and project highlights from my software
                      engineering career.
                    </Typography>
                  </Grid2>
                </Grid2>
              </CardContent>
            </StyledCard>
          </Grid2>

          <Grid2 size={12}>
            <StyledCard>
              <CardContent>
                <Typography variant="h4" component="h2" gutterBottom color="white">
                  Technical Implementation
                </Typography>
                <Typography variant="body1" paragraph color="white">
                  This website is built using modern web technologies including
                  React, Material-UI, Firebase for backend services, and various
                  APIs for dynamic content. The Shogi game features custom
                  algorithms for piece movement validation, while the music and
                  movie sections integrate with external services for rich media
                  experiences.
                </Typography>
                <Typography variant="body1" paragraph color="white">
                  The design philosophy emphasizes clean aesthetics, smooth
                  animations, and responsive layouts that work seamlessly across
                  all devices. Every component is carefully crafted to provide
                  an engaging user experience while maintaining optimal
                  performance.
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid2>

          <Grid2 size={12}>
            <StyledCard>
              <CardContent>
                <Typography variant="h4" component="h2" gutterBottom color="white">
                  Connect & Collaborate
                </Typography>
                <Typography variant="body1" paragraph color="white">
                  Akogare Cafe is more than just a showcase - it's a community.
                  Whether you're interested in technology, Japanese culture,
                  gaming, or just want to chat about shared interests, you're
                  welcome here.
                </Typography>
                <Typography variant="body1" color="white">
                  Follow our social media channels for updates,
                  behind-the-scenes content, and community discussions. Feel
                  free to reach out through any of our platforms or the contact
                  page for collaborations, feedback, or just to say hello!
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid2>
        </Grid2>
      </Container>
    </AboutWrapper>
  );
};

export default AboutPage;
