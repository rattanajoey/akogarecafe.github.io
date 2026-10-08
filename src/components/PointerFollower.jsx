import { useEffect, useRef } from "react";
import { useMediaQuery } from "@mui/material";

const PointerFollower = () => {
  const enabled = useMediaQuery("(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  const follower = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    let frame;
    const move = (event) => {
      cancelAnimationFrame(frame);
      const { clientX, clientY, target } = event;
      frame = requestAnimationFrame(() => {
        if (!follower.current) return;
        follower.current.style.left = `${clientX}px`;
        follower.current.style.top = `${clientY}px`;
        follower.current.style.visibility = "visible";
        follower.current.classList.toggle("is-active", Boolean(target.closest("a, button, [role='button']")));
      });
    };
    document.addEventListener("pointermove", move, { passive: true });
    return () => { document.removeEventListener("pointermove", move); cancelAnimationFrame(frame); };
  }, [enabled]);
  return enabled ? <div ref={follower} className="follower" aria-hidden="true" style={{ visibility: "hidden" }} /> : null;
};
export default PointerFollower;
