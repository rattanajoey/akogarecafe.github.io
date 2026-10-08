import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MusicShelfWrapper, Album, AlbumCover, AlbumDetailsImg } from "./style";
import { artists } from "../constants/MusicInfo";

const MusicShelf = () => {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const reduceMotion = useReducedMotion();
  return (
    <MusicShelfWrapper>
      {artists.map((album) => (
        <motion.button
          key={`${album.title}-${album.name}`}
          type="button"
          aria-label={`${album.title} by ${album.name}`}
          whileHover={reduceMotion ? {} : { scale: 1.05, rotate: 3, y: -5 }}
          whileTap={reduceMotion ? {} : { scale: 0.95 }}
          onClick={() => setSelectedAlbum(album)}
          style={{ cursor: "pointer", border: 0, padding: 0, borderRadius: 12, background: "transparent" }}
        >
          <Album><AlbumCover src={album.albumCover} alt="" loading="lazy" /></Album>
        </motion.button>
      ))}
      <Dialog
        open={Boolean(selectedAlbum)}
        onClose={() => setSelectedAlbum(null)}
        aria-labelledby="album-title"
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: "#1e1e2e", color: "white", borderRadius: 3, textAlign: "center" } }}
      >
        {selectedAlbum && <>
          <DialogTitle id="album-title" sx={{ pt: 7, pb: 1 }}>{selectedAlbum.title}</DialogTitle>
          <IconButton aria-label="Close album details" onClick={() => setSelectedAlbum(null)} sx={{ position: "absolute", top: 12, right: 12, color: "white" }}><CloseIcon /></IconButton>
          <DialogContent>
            <AlbumDetailsImg component="img" src={selectedAlbum.albumCover} alt={`${selectedAlbum.title} album cover`} />
            <Typography sx={{ mb: 2 }}>{selectedAlbum.name} · {selectedAlbum.year}</Typography>
            <Box sx={{ color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}>{selectedAlbum.description}</Box>
          </DialogContent>
        </>}
      </Dialog>
    </MusicShelfWrapper>
  );
};
export default MusicShelf;
