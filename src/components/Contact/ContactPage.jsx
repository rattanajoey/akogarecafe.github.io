import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid2,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import GamesIcon from "@mui/icons-material/Games";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";

const ContactWrapper = styled(Box)({
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

const SocialCard = styled(Card)({
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "12px",
  textAlign: "center",
  transition: "transform 0.3s ease, background-color 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just show a success message
    // In a real implementation, you'd send this to a backend service
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const socialLinks = [
    {
      name: "YouTube",
      icon: <YouTubeIcon sx={{ fontSize: 40 }} />,
      url: "https://www.youtube.com/c/akogarecafe",
      description: "Latest videos and content",
      color: "#FF0000",
    },
    {
      name: "Instagram",
      icon: <InstagramIcon sx={{ fontSize: 40 }} />,
      url: "https://www.instagram.com/akogarecafe",
      description: "Behind the scenes content",
      color: "#E4405F",
    },
    {
      name: "Twitter/X",
      icon: <TwitterIcon sx={{ fontSize: 40 }} />,
      url: "https://x.com/AkogareCafe_JR",
      description: "Updates and quick thoughts",
      color: "#1DA1F2",
    },
    {
      name: "Twitch",
      icon: <GamesIcon sx={{ fontSize: 40 }} />,
      url: "https://www.twitch.tv/akogarecafe",
      description: "Live streaming and gaming",
      color: "#9146FF",
    },
    {
      name: "GitHub",
      icon: <GitHubIcon sx={{ fontSize: 40 }} />,
      url: "https://github.com/rattanajoey",
      description: "Code and projects",
      color: "#333",
    },
  ];

  return (
    <ContactWrapper>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            marginBottom: 4,
            background: "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontWeight: "bold",
          }}
        >
          Get In Touch
        </Typography>

        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{
            marginBottom: 6,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          Let's connect and collaborate!
        </Typography>

        {showAlert && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              color: "white",
              border: "1px solid rgba(76, 175, 80, 0.3)",
            }}
          >
            Thank you for your message! I'll get back to you soon.
          </Alert>
        )}

        <Grid2 container spacing={4}>
          <Grid2 item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography
                  variant="h4"
                  gutterBottom
                  color="white"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <EmailIcon />
                  Send a Message
                </Typography>
                <Typography
                  variant="body1"
                  color="rgba(255,255,255,0.7)"
                  paragraph
                >
                  Have a question, project idea, or just want to say hello? Feel
                  free to reach out!
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                  <Grid2 container spacing={2}>
                    <Grid2 item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="name"
                        label="Your Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "white",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.3)",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(255,255,255,0.5)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#4ecdc4",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                        }}
                      />
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="email"
                        label="Your Email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "white",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.3)",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(255,255,255,0.5)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#4ecdc4",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                        }}
                      />
                    </Grid2>
                    <Grid2 item xs={12}>
                      <TextField
                        fullWidth
                        name="subject"
                        label="Subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "white",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.3)",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(255,255,255,0.5)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#4ecdc4",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                        }}
                      />
                    </Grid2>
                    <Grid2 item xs={12}>
                      <TextField
                        fullWidth
                        name="message"
                        label="Your Message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "white",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.3)",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(255,255,255,0.5)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#4ecdc4",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                        }}
                      />
                    </Grid2>
                    <Grid2 item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        endIcon={<SendIcon />}
                        sx={{
                          background:
                            "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
                          color: "white",
                          fontWeight: "bold",
                          py: 1.5,
                          px: 4,
                          "&:hover": {
                            background:
                              "linear-gradient(45deg, #ff5252, #26a69a)",
                          },
                        }}
                      >
                        Send Message
                      </Button>
                    </Grid2>
                  </Grid2>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid2>

          <Grid2 item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography variant="h4" gutterBottom color="white">
                  Connect on Social Media
                </Typography>
                <Typography
                  variant="body1"
                  color="rgba(255,255,255,0.7)"
                  paragraph
                >
                  Follow me on various platforms for updates, content, and
                  community discussions.
                </Typography>

                <Grid2 container spacing={2} sx={{ mt: 2 }}>
                  {socialLinks.map((social) => (
                    <Grid2 item xs={12} sm={6} key={social.name}>
                      <SocialCard>
                        <CardContent sx={{ py: 3 }}>
                          <IconButton
                            href={social.url}
                            target="_blank"
                            sx={{
                              color: social.color,
                              mb: 1,
                              "&:hover": {
                                transform: "scale(1.1)",
                              },
                            }}
                          >
                            {social.icon}
                          </IconButton>
                          <Typography variant="h6" color="white" gutterBottom>
                            {social.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="rgba(255,255,255,0.6)"
                          >
                            {social.description}
                          </Typography>
                        </CardContent>
                      </SocialCard>
                    </Grid2>
                  ))}
                </Grid2>
              </CardContent>
            </StyledCard>

            <StyledCard>
              <CardContent>
                <Typography variant="h5" gutterBottom color="white">
                  What I'm Looking For
                </Typography>
                <Typography
                  variant="body1"
                  color="rgba(255,255,255,0.8)"
                  paragraph
                >
                  • Collaboration opportunities on interesting projects
                </Typography>
                <Typography
                  variant="body1"
                  color="rgba(255,255,255,0.8)"
                  paragraph
                >
                  • Feedback and suggestions for website improvements
                </Typography>
                <Typography
                  variant="body1"
                  color="rgba(255,255,255,0.8)"
                  paragraph
                >
                  • Discussions about technology, Japanese culture, gaming, or
                  music
                </Typography>
                <Typography
                  variant="body1"
                  color="rgba(255,255,255,0.8)"
                  paragraph
                >
                  • Potential job opportunities in software engineering
                </Typography>
                <Typography variant="body1" color="rgba(255,255,255,0.8)">
                  • Just friendly conversations with like-minded people!
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid2>
        </Grid2>
      </Container>
    </ContactWrapper>
  );
};

export default ContactPage;
