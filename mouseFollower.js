document.addEventListener("mousemove", (e) => {
  const cursor = document.querySelector(".cursor");
  const follower = document.querySelector(".follower");

  // Move the cursor and follower with the mouse
  if (cursor && follower) {
    cursor.style.top = `${e.clientY}px`;
    cursor.style.left = `${e.clientX}px`;
    follower.style.top = `${e.clientY}px`;
    follower.style.left = `${e.clientX}px`;
  }
});

// Log all the elements with class starting with "css-"
window.onload = () => {
  setTimeout(() => {
    const rootElement = document.getElementById("root");
    const follower = document.querySelector(".follower");

    // Only add event listeners if follower element exists
    if (!follower) return;

    const cssElements = rootElement.querySelectorAll(
      'a, button, [role="button"], [tabindex]:not([tabindex="-1"]), div[style*="cursor: pointer"], .shogi-piece'
    );

    cssElements.forEach((element) => {
      element.addEventListener("mouseenter", () => {
        if (follower) {
          follower.classList.add("is-active");
        }
      });

      element.addEventListener("mouseleave", () => {
        if (follower) {
          follower.classList.remove("is-active");
        }
      });
    });
  }, 2000);
};
