// Configuração da API
const API_URL = 'https://optimistic-compassion-3d906711a0.strapiapp.com/api'; // Nova URL do Strapi Cloud

// Seletor e variáveis principais
const SELECTORS = {
    container: ".playlist-itens",
    emptyState: ".empty-state-list",
};

const playlistContainer = document.querySelector(SELECTORS.container);
const emptyState = document.querySelector(SELECTORS.emptyState);
const STORAGE_KEY = "playlist_checked_status";

// ------- Utils -------

/**
 * Salva o estado atual de checked/unchecked no localStorage.
 * Não salva o texto da tarefa, apenas o status de conclusão.
 */
function saveCheckedStatus() {
    // Captura os IDs ou Textos das tarefas marcadas
    const data = Array.from(playlistContainer.querySelectorAll("input[type='checkbox']"))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.closest("label").dataset.taskId); // Usa o ID da API como chave
        
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    toggleEmptyState();
}

/**
 * Verifica se a lista está vazia (útil para quando o Strapi não retornar tarefas).
 */
function toggleEmptyState() {
    if (!playlistContainer || !emptyState) return;
    if (playlistContainer.children.length === 0) {
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");
    }
}

// ------- DOM creation -------

/**
 * Cria o item da lista usando os dados do Strapi (ID e Título).
 */
function createListItem({ id, titulo }) {
    const label = document.createElement("label");
    label.dataset.taskId = id; // Armazena o ID da API no elemento
    label.className = "task-item-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("aria-label", "Marcar tarefa como concluída");

    const spanText = document.createElement("span");
    spanText.className = "task-text";
    spanText.textContent = titulo;

    label.appendChild(checkbox);
    label.appendChild(spanText);

    return label;
}

/**
 * Renderiza a lista com tarefas do Strapi e aplica o status de checked do localStorage.
 * @param {Array} apiItems - Tarefas vindas do Strapi.
 */
function renderList(apiItems = []) {
    playlistContainer.innerHTML = "";
    
    // ... código de carregamento do localStorage omitido ...
    const checkedIds = rawCheckedIds ? JSON.parse(rawCheckedIds) : [];
    
    apiItems.forEach(item => {
    
   // Verificação de segurança:
   if (!item || !item.id || !item.attributes) {
        console.warn('Item pulado devido à falta de ID ou Attributes:', item);
        return; 
   }

    const id = item.id;
    // 🎯 CORREÇÃO CRUCIAL AQUI: 
    // Garanta que 'Titulo' (com 'T' maiúsculo) seja usado, pois é a chave do JSON do Strapi.
    const titulo = item.attributes.Titulo; // <<<<<< GARANTA QUE ESTA LINHA ESTEJA ASSIM

    const isChecked = checkedIds.includes(String(id));
    
    // Garantir que a função de criação de item receba o ID e o título
    const label = createListItem({ id, titulo });
    label.querySelector('input[type="checkbox"]').checked = isChecked;

    playlistContainer.appendChild(label);
});
    
    toggleEmptyState();
}

// ------- Integração Strapi & LocalStorage -------

async function loadTasksFromStrapiAndLocal() {
    try {
        const response = await fetch(`${API_URL}/lista-tarefas`);
        
        // Verifica se a resposta foi bem-sucedida antes de tentar o JSON
        if (!response.ok) {
            throw new Error(`Erro de rede ou Strapi: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        // Passa o array de tarefas para renderização
        renderList(jsonData.data);

    } catch (error) {
        console.error('Falha ao carregar tarefas:', error);
        // Exibir uma mensagem de erro simples no container
        playlistContainer.innerHTML = '<li>Não foi possível conectar ao servidor de tarefas.</li>';
        toggleEmptyState();
    }
}


// ------- Event delegation (Apenas para marcar/desmarcar) -------

playlistContainer.addEventListener("change", (e) => {
    const checkbox = e.target;
    if (checkbox && checkbox.type === "checkbox") {
        // Apenas salva o estado de conclusão no localStorage
        saveCheckedStatus();

        // Lógica opcional de mover tarefas marcadas para o final (se você quiser manter)
        const label = checkbox.closest("label");
        if (checkbox.checked) {
            playlistContainer.appendChild(label);
        } else {
            playlistContainer.insertBefore(label, playlistContainer.firstChild);
        }
    }
});


// Inicialização (Substitui o antigo loadList())
loadTasksFromStrapiAndLocal();