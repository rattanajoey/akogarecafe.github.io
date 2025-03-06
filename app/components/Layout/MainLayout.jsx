"use client";

import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import HeaderComponent from "../Header/HeaderComponent";
import SpeedDialComponent from "../SpeedDial/SpeedDialComponent";

export default function MainLayout({ children }) {
  const [cursorInitialized, setCursorInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (cursorInitialized) return;

    let cursor = document.querySelector(".cursor");
    let follower = document.querySelector(".follower");

    if (!cursor) {
      cursor = document.createElement("div");
      cursor.className = "cursor";
      document.body.appendChild(cursor);
    }

    if (!follower) {
      follower = document.createElement("div");
      follower.className = "follower";
      document.body.appendChild(follower);
    }

    setCursorInitialized(true);
  }, [cursorInitialized]);

  return (
    <div className="App">
      <HeaderComponent />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <SpeedDialComponent />
    </div>
  );
}
