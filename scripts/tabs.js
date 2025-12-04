// tab system universal
document.querySelectorAll(".tab, .tab-video").forEach(tab => {
  tab.addEventListener("click", () => {

    const group = tab.classList.contains("tab") ? "tab" : "tab-video";
    const contentClass = group === "tab" ? ".tab-content" : ".video-content";

    // Remove active dos botões do grupo
    document.querySelectorAll(`.${group}`).forEach(t =>
      t.classList.remove("active")
    );
    tab.addClass = tab.classList.add("active");

    // troca conteúdo
    const target = tab.getAttribute("data-target");
    document.querySelectorAll(contentClass).forEach(c =>
      c.classList.remove("active")
    );
    document.getElementById(target).classList.add("active");
  });
});
