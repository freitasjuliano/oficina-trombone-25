    document.querySelectorAll(".note").forEach(note => {
      note.addEventListener("click", () => {
        const soundFile = note.getAttribute("data-sound");
        if (soundFile) {
          const audio = new Audio(`sounds/${soundFile}`);
          audio.play();
        }
      });
    });