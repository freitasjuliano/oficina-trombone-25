// Playlist manager - modular, usa localStorage
(() => {
  const SELECTORS = {
    container: ".playlist-itens",
    input: ".add-input",
    emptyState: ".empty-state-list",
    sendBtn: ".send"
  };

  const playlistContainer = document.querySelector(SELECTORS.container);
  const inputField = document.querySelector(SELECTORS.input);
  const emptyState = document.querySelector(SELECTORS.emptyState);
  const sendBtn = document.querySelector(SELECTORS.sendBtn);

  const STORAGE_KEY = "playlist";

  // ------- Utils -------
  function saveList() {
    const data = Array.from(playlistContainer.querySelectorAll("label")).map(label => {
      const checkbox = label.querySelector("input[type='checkbox']");
      const text = label.querySelector(".task-text").textContent.trim();
      return { text, checked: !!checkbox.checked };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    toggleEmptyState();
  }

  function loadList() {
    const raw = localStorage.getItem(STORAGE_KEY);
    let items = [];
    try {
      items = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Erro ao ler playlist do localStorage:", e);
      items = [];
    }
    renderList(items);
  }

  function toggleEmptyState() {
    if (!playlistContainer || !emptyState) return;
    if (playlistContainer.children.length === 0) {
      emptyState.classList.remove("hidden");
    } else {
      emptyState.classList.add("hidden");
    }
  }

  // ------- DOM creation -------
  function createListItem({ text, checked = false }) {
    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = checked;
    checkbox.setAttribute("aria-label", "Marcar item");

    const spanText = document.createElement("span");
    spanText.className = "task-text";
    spanText.textContent = text;

    const deleteBtn = document.createElement("div");
    deleteBtn.className = "delete";
    deleteBtn.setAttribute("role", "button");
    deleteBtn.setAttribute("title", "Remover item");

    const deleteIcon = document.createElement("img");
    deleteIcon.className = "icon-delete";
    deleteIcon.src = "./images/delete.svg";
    deleteIcon.alt = "delete";

    deleteBtn.appendChild(deleteIcon);



    // montar
    label.appendChild(checkbox);
    label.appendChild(spanText);
    label.appendChild(deleteBtn);

    return label;
  }

  function renderList(items = []) {
    playlistContainer.innerHTML = "";
    items.forEach(it => playlistContainer.appendChild(createListItem(it)));
    toggleEmptyState();
  }

  // ------- Actions -------
  function addNewItem(text) {
    const clean = String(text || "").trim();
    if (!clean) return;
    const item = createListItem({ text: clean, checked: false });
    playlistContainer.appendChild(item);
    saveList();
  }

  // ------- Event delegation para playlistContainer -------
  playlistContainer.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".delete");
    if (deleteBtn) {
      const label = deleteBtn.closest("label");
      if (label) {
        label.remove();
        saveList();
      }
      return;
    }
  });

  playlistContainer.addEventListener("change", (e) => {
    const checkbox = e.target;
    if (checkbox && checkbox.type === "checkbox") {
      const label = checkbox.closest("label");
      if (!label) return;

      // se estiver marcado, mover para o final
      if (checkbox.checked) {
        playlistContainer.appendChild(label);
      } else {
        // opcional: mover para o início quando desmarcado
        playlistContainer.insertBefore(label, playlistContainer.firstChild);
      }
      saveList();
    }
  });

  // Enter para adicionar
  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addNewItem(inputField.value);
      inputField.value = "";
      inputField.focus();
    }
  });

  // botão enviar
  sendBtn.addEventListener("click", () => {
    addNewItem(inputField.value);
    inputField.value = "";
    inputField.focus();
  });

  // inicialização
  loadList();
  toggleEmptyState();
})();
