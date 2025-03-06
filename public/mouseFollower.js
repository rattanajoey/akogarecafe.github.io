document.addEventListener("mousemove", (e) => {
  const cursor = document.querySelector(".cursor");
  const follower = document.querySelector(".follower");

  if (cursor && follower) {
    cursor.style.top = `${e.clientY}px`;
    cursor.style.left = `${e.clientX}px`;
    follower.style.top = `${e.clientY}px`;
    follower.style.left = `${e.clientX}px`;
  }
});

// Function to attach hover effects
const attachListeners = () => {
  const cssElements = document.querySelectorAll(
    'a, button, [role="button"], [tabindex]:not([tabindex="-1"]), div[style*="cursor: pointer"]'
  );

  cssElements.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      document.querySelector(".follower")?.classList.add("is-active");
    });

    element.addEventListener("mouseleave", () => {
      document.querySelector(".follower")?.classList.remove("is-active");
    });
  });
};

// Attach listeners initially
attachListeners();

// ✅ Fix: Observe DOM changes in Next.js and reattach listeners when new elements load
const observer = new MutationObserver(() => {
  attachListeners();
});

observer.observe(document.body, { childList: true, subtree: true });
