import { useState } from "react";
import { Drawer, Box, Typography, Divider, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MaoMaoImage, MaoMaoTextBox } from "../style";

const MovieClubInfoModal = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

  return (
    <>
      <Box
        onClick={toggleDrawer(true)}
        sx={{ height: "1vh", position: "relative" }}
      >
        <MaoMaoImage src="/movie/maomao.png" alt="maomao" />
        <MaoMaoTextBox>
          <Typography variant="h6" fontWeight="bold">
            Need help? Click Me
          </Typography>
        </MaoMaoTextBox>
      </Box>

      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "#2c2c2c",
              color: "white",
              p: 3,
              width: { sm: "50vw" },
            },
          },
        }}
      >
        <Box>
          <IconButton
            onClick={toggleDrawer(false)}
            sx={{ color: "white", position: "absolute", top: 10, right: 10 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🎥 Movie Club Info
          </Typography>
          <Divider sx={{ mb: 2, backgroundColor: "rgba(255,255,255,0.2)" }} />

          <Typography variant="body2" gutterBottom>
            Each month, submit up to one movie per catergory.:
          </Typography>
          <ul>
            <li>🎬 Action / Sci-Fi / Fantasy</li>
            <li>🎭 Drama / Documentary</li>
            <li>😂 Comedy / Musical</li>
            <li>😱 Thriller / Horror</li>
          </ul>

          <Typography variant="body2" gutterBottom mt={2}>
            You can resubmit to update your picks until the submission period
            closes (usually one week). Submitting again with the same nickname
            and password will replace your priorsubmission.
          </Typography>

          <Typography variant="body2" gutterBottom mt={2}>
            We will announce when the submission period is open and closed.
          </Typography>

          <Typography variant="body2" gutterBottom mt={2}>
            After the period ends, one movie per catergory will be selected
            randomly from all submissions. These will be displayed as the
            official Movie Club picks for the month.
          </Typography>

          <Typography variant="body2" gutterBottom mt={2}>
            Movies not picked will carry over to the next month.
          </Typography>
        </Box>
      </Drawer>
    </>
  );
};

export default MovieClubInfoModal;
