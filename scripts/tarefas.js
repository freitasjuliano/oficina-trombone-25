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

/**
 * Salva o estado atual de checked/unchecked no localStorage.
 */
function saveCheckedStatus() {
    const checkedIds = Array.from(
        playlistContainer.querySelectorAll("input[type='checkbox']")
    )
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.dataset.id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedIds));
}

/**
 * Exibe ou oculta o empty state
 */
function toggleEmptyState() {
    if (!playlistContainer || !emptyState) return;

    if (playlistContainer.children.length === 0) {
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");
    }
}

// =====================
// DOM creation
// =====================

/**
 * Cria o item visual da tarefa
 */
function createListItem({ id, titulo, isChecked = false }) {
    const label = document.createElement("label");
    label.className = "task-item-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("aria-label", "Marcar tarefa como concluída");
    checkbox.setAttribute("data-id", id);
    checkbox.checked = isChecked;

    const spanText = document.createElement("span");
    spanText.className = "task-text";
    spanText.textContent = titulo;

    if (isChecked) {
        label.classList.add("completed");
    }

    label.appendChild(checkbox);
    label.appendChild(spanText);

    return label;
}

/**
 * Renderiza a lista usando os dados do Strapi e o localStorage
 */
function renderList(apiItems = []) {
    playlistContainer.innerHTML = "";

    // IDs salvos
    const rawCheckedIds = localStorage.getItem(STORAGE_KEY);
    const checkedIds = rawCheckedIds ? JSON.parse(rawCheckedIds) : [];

    const completedItems = [];
    const pendingItems = [];

    apiItems.forEach(item => {
        if (!item || !item.id) {
            console.warn("Item ignorado por falta de ID:", item);
            return;
        }

        const id = item.id;
        const titulo = item.Titulo; // <-- CORREÇÃO AQUI!

        const isChecked = checkedIds.includes(String(id));

        const label = createListItem({
            id,
            titulo,
            isChecked
        });

        if (isChecked) {
            completedItems.push(label);
        } else {
            pendingItems.push(label);
        }
    });

    // Renderiza pendentes primeiro
    pendingItems.forEach(item => playlistContainer.appendChild(item));
    completedItems.forEach(item => playlistContainer.appendChild(item));

    toggleEmptyState();
}

// =====================
// Strapi Integration
// =====================

async function loadTasksFromStrapiAndLocal() {
    try {
        const response = await fetch(`${API_URL}/lista-tarefas`);

        if (!response.ok) {
            throw new Error(`Strapi retornou erro: ${response.status}`);
        }

        const jsonData = await response.json();

        // Strapi Cloud v5 retorna dados no root
        const tasks = jsonData.data;

        renderList(tasks);

    } catch (error) {
        console.error("Erro ao carregar Strapi:", error);
        playlistContainer.innerHTML =
            "<li>Não foi possível conectar ao servidor de tarefas.</li>";
        toggleEmptyState();
    }
}

// =====================
// Event delegation
// =====================

playlistContainer.addEventListener("change", (e) => {
    const checkbox = e.target;

    if (checkbox && checkbox.type === "checkbox") {
        saveCheckedStatus();

        const label = checkbox.closest("label");

        if (checkbox.checked) {
            label.classList.add("completed");
            playlistContainer.appendChild(label);
        } else {
            label.classList.remove("completed");

            const firstCompleted = playlistContainer.querySelector(".completed");

            if (firstCompleted) {
                playlistContainer.insertBefore(label, firstCompleted);
            } else {
                playlistContainer.prepend(label);
            }
        }
    }
});

// =====================
// Inicialização
// =====================
loadTasksFromStrapiAndLocal();
