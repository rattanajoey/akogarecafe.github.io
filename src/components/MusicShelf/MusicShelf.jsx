import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Typography } from "@mui/material";
import { MusicShelfWrapper, Album, AlbumCover, AlbumDetails } from "./style";
import { artists } from "../constants/MusicInfo";
import CloseIcon from "@mui/icons-material/Close";
import { CloseIconContainer } from "./style";
import { AlbumDetailsImg } from "./style";

const MusicShelf = () => {
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const handleAlbumClick = (album) => {
    if (selectedAlbum) {
      setSelectedAlbum(null);
      setTimeout(() => {
        setSelectedAlbum(album);
      }, 300);
    } else {
      setSelectedAlbum(album);
    }
  };

  return (
    <MusicShelfWrapper>
      {artists.map((album, index) => {
        const isSelected =
          selectedAlbum &&
          selectedAlbum.title === album.title &&
          selectedAlbum.name === album.name;
        const hasSelected = selectedAlbum !== null;
        return (
          <motion.div
            key={index}
            layoutId={`album-${index}`}
            whileHover={
              !isSelected && !hasSelected
                ? {
                    scale: 1.08,
                    rotate: 3,
                    y: -8,
                    transition: { duration: 0.2 },
                  }
                : {}
            }
            whileTap={!isSelected && !hasSelected ? { scale: 0.95 } : {}}
            onClick={() =>
              !isSelected && !hasSelected && handleAlbumClick(album)
            }
            animate={{
              opacity: isSelected ? 0 : hasSelected ? 0.3 : 1,
              scale: isSelected ? 0 : 1,
            }}
            transition={{ duration: 0.3 }}
            style={{
              cursor: isSelected || hasSelected ? "default" : "pointer",
              pointerEvents: isSelected ? "none" : "auto",
            }}
          >
            <Album>
              <AlbumCover src={album.albumCover} alt={album.title} />
            </Album>
          </motion.div>
        );
      })}

      <AnimatePresence>
        {selectedAlbum && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedAlbum(null)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                zIndex: 999,
                backdropFilter: "blur(4px)",
                pointerEvents: "auto",
              }}
            />

            {/* Album Details - Pulled out from shelf */}
            <AlbumDetails
              key={`details-${selectedAlbum.title}-${selectedAlbum.name}`}
              layoutId={`album-${artists.findIndex(
                (a) =>
                  a.title === selectedAlbum.title &&
                  a.name === selectedAlbum.name
              )}`}
              initial={{
                opacity: 0,
                scale: 0.8,
                rotateX: 15,
                rotateY: -5,
                z: -200,
                x: "-50%",
                y: "-50%",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                rotateX: 0,
                rotateY: 0,
                z: 0,
                x: "-50%",
                y: "-50%",
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
                rotateX: 15,
                rotateY: -5,
                z: -200,
                x: "-50%",
                y: "-50%",
              }}
              style={{
                top: "50%",
                left: "50%",
              }}
              transition={{
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1], // Custom ease for smooth pull-out
                opacity: { duration: 0.3 },
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <AlbumDetailsImg
                  component="img"
                  src={selectedAlbum.albumCover}
                  alt={selectedAlbum.title}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <Typography variant="h4">{selectedAlbum.title}</Typography>
                <Typography
                  variant="body1"
                  sx={{ marginTop: "8px", opacity: 0.8 }}
                >
                  {selectedAlbum.name} - {selectedAlbum.year}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ marginTop: "12px", fontStyle: "italic" }}
                >
                  {selectedAlbum.description}
                </Typography>
              </motion.div>

              <CloseIconContainer
                onClick={() => setSelectedAlbum(null)}
                as={motion.div}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <CloseIcon />
              </CloseIconContainer>
            </AlbumDetails>
          </>
        )}
      </AnimatePresence>
    </MusicShelfWrapper>
  );
};

export default MusicShelf;
