// =====================
// Configuração da API
// =====================
const API_URL = 'https://optimistic-compassion-3d906711a0.strapiapp.com/api';

// =====================
// Seletores
// =====================
const SELECTORS = {
    container: ".playlist-itens",
    emptyState: ".empty-state-list",
};

const playlistContainer = document.querySelector(SELECTORS.container);
const emptyState = document.querySelector(SELECTORS.emptyState);
const STORAGE_KEY = "playlist_checked_status";

// =====================
// Utils
// =====================

/** Salva apenas o ID dos cards marcados */
function saveCheckedStatus() {
    const checkedIds = Array.from(
        playlistContainer.querySelectorAll("input[type='checkbox']")
    )
        .filter(c => c.checked)
        .map(c => c.dataset.id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedIds));
}

/** Empty state */
function toggleEmptyState() {
    if (playlistContainer.children.length === 0) {
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");
    }
}

/** Formata a data do createdAt */
function formatDate(isoString) {
    const date = new Date(isoString);
    const formatter = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
    return formatter.format(date);
}

// =====================
// DOM creation — NOVO CARD COMPLETO
// =====================

function createTaskCard({ id, titulo, descricao, data, isChecked }) {
    const card = document.createElement("div");
    card.className = "card-checkbox";

    // HEADER ------------------------
    const header = document.createElement("div");
    header.className = "card-checkbox-header";

    const label = document.createElement("label");
    label.textContent = titulo;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.id = id;
    checkbox.checked = isChecked;

    header.appendChild(label);
    header.appendChild(checkbox);

    // BODY ---------------------------
    const body = document.createElement("div");
    body.className = "card-checkbox-body";

    const desc = document.createElement("p");
    desc.className = "descricao-tarefa";
    desc.textContent = descricao;

    body.appendChild(desc);

    // FOOTER -------------------------
    const footer = document.createElement("div");
    footer.className = "card-checkbox-footer";

    const dateText = document.createElement("p");
    dateText.className = "data-tarefa";
    dateText.textContent = data;

    footer.appendChild(dateText);

    // MONTAGEM FINAL -----------------
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);

    return card;
}

// =====================
// Renderização
// =====================

function renderList(apiItems = []) {
    playlistContainer.innerHTML = "";

    const checkedIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    const completed = [];
    const pending = [];

    apiItems.forEach(item => {
        const id = item.id;

        const titulo = item.Titulo;
        const descricao = item.descricao; // minúsculo, como vem do Strapi
        const data = formatDate(item.createdAt); // usa createdAt formatado como data

        const isChecked = checkedIds.includes(String(id));

        const card = createTaskCard({
            id,
            titulo,
            descricao,
            data,
            isChecked
        });

        if (isChecked) {
            completed.push(card);
        } else {
            pending.push(card);
        }
    });

    pending.forEach(c => playlistContainer.appendChild(c));
    completed.forEach(c => playlistContainer.appendChild(c));

    toggleEmptyState();
}

// =====================
// Strapi
// =====================

async function loadTasksFromStrapi() {
    try {
        const response = await fetch(`${API_URL}/lista-tarefas`);

        if (!response.ok) throw new Error("Erro Strapi: " + response.status);

        const json = await response.json();
        renderList(json.data);

    } catch (e) {
        console.error(e);
        playlistContainer.innerHTML = `<p>Erro ao carregar tarefas.</p>`;
    }
}

// =====================
// Eventos
// =====================

playlistContainer.addEventListener("change", (e) => {
    const checkbox = e.target;

    if (checkbox.type === "checkbox") {
        saveCheckedStatus();

        const card = checkbox.closest(".card-checkbox");

        if (checkbox.checked) {
            playlistContainer.appendChild(card);
        } else {
            const firstCompleted = playlistContainer.querySelector(".card-checkbox input:checked");
            if (firstCompleted) {
                playlistContainer.insertBefore(card, firstCompleted.closest(".card-checkbox"));
            } else {
                playlistContainer.prepend(card);
            }
        }
    }
});

// =====================
// Inicialização
// =====================
loadTasksFromStrapi();
