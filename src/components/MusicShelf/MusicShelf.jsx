import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Typography } from "@mui/material";
import { MusicShelfWrapper, Album, AlbumCover, AlbumDetails } from "./style";
import { artists } from "../constants/MusicInfo";
import CloseIcon from "@mui/icons-material/Close";
import { CloseIconContainer } from "./style";
import { AlbumDetailsImg } from "./style";

const MusicShelf = () => {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const albumRefs = useRef({});

  const handleAlbumClick = (album, id) => {
    if (selectedAlbum) {
      setSelectedAlbum(null);
      setTimeout(() => {
        openAlbum(album, id);
      }, 800);
    } else {
      openAlbum(album, id);
    }
  };

  const openAlbum = (album, id) => {
    setSelectedAlbum(album);
  };

  return (
    <MusicShelfWrapper>
      {artists
        .filter((album) => album !== selectedAlbum)
        .map((album) => (
          <motion.div
            key={album.id}
            layoutId={album.id}
            ref={(el) => (albumRefs.current[album.id] = el)}
            whileHover={{ scale: 1.1, rotate: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAlbumClick(album, album.id)}
          >
            <Album>
              <AlbumCover src={album.albumCover} alt={album.title} />
            </Album>
          </motion.div>
        ))}

      <AnimatePresence>
        {selectedAlbum && (
          <AlbumDetails
            key={selectedAlbum.id}
            initial={{
              opacity: 0,
              scale: 0.5,
              rotateX: -100,
              rotateY: 100,
              y: -500,
            }}
            animate={{
              opacity: 1,
              y: "50vh",
              x: "50vw",
              scale: 1,
              rotateX: 0,
              transform: "translate(-50%, -50%)",
            }}
            exit={{
              opacity: 0,
              y: -500,
              scale: 0.5,
              rotateX: -100,
              rotateY: 100,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <AlbumDetailsImg
              component="img"
              src={selectedAlbum.albumCover}
              alt={selectedAlbum.title}
            />
            <Typography variant="h4">{selectedAlbum.title}</Typography>
            <Typography variant="body1" sx={{ marginTop: "8px", opacity: 0.8 }}>
              {selectedAlbum.name} - {selectedAlbum.year}
            </Typography>
            <Typography
              variant="body2"
              sx={{ marginTop: "12px", fontStyle: "italic" }}
            >
              {selectedAlbum.description}
            </Typography>
            <CloseIconContainer onClick={() => setSelectedAlbum(null)}>
              <CloseIcon />
            </CloseIconContainer>
          </AlbumDetails>
        )}
      </AnimatePresence>
    </MusicShelfWrapper>
  );
};

export default MusicShelf;
