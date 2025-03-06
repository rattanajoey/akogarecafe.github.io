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
    const cssElements = rootElement.querySelectorAll(
      'a, button, [role="button"], [tabindex]:not([tabindex="-1"]), div[style*="cursor: pointer"], .shogi-piece'
    );

    cssElements.forEach((element) => {
      element.addEventListener("mouseenter", () => {
        document.querySelector(".follower").classList.add("is-active");
      });

      element.addEventListener("mouseleave", () => {
        document.querySelector(".follower").classList.remove("is-active");
      });
    });
  }, 2000);
};
