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
 * Captura o 'data-id' de todos os checkboxes marcados.
 */
function saveCheckedStatus() {
    // Captura o valor do atributo data-id de todos os checkboxes marcados
    const checkedIds = Array.from(playlistContainer.querySelectorAll("input[type='checkbox']"))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.dataset.id); // Pega o ID da API do atributo data-id
        
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedIds));
    // A chamada a toggleEmptyState não é necessária aqui, pois a lista não muda.
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
 * Cria o item da lista (um elemento <label> contendo <input> e <span>).
 * @param {number} id - ID da tarefa vindo do Strapi.
 * @param {string} titulo - Título da tarefa vindo do Strapi.
 * @param {boolean} isChecked - Se a tarefa deve ser marcada como concluída.
 */
function createListItem({ id, titulo, isChecked = false }) {
    const label = document.createElement("label");
    label.className = "task-item-label";
    
    // Cria o input
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("aria-label", "Marcar tarefa como concluída");
    checkbox.setAttribute("data-id", id); // 🎯 CORREÇÃO: Define o ID no checkbox
    checkbox.checked = isChecked;
    
    // Cria o texto
    const spanText = document.createElement("span");
    spanText.className = "task-text";
    spanText.textContent = titulo;
    
    // Adiciona a classe 'completed' se estiver marcado
    if (isChecked) {
        label.classList.add('completed');
    }

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
    
    // 1. 🎯 CORREÇÃO CRUCIAL: Define 'rawCheckedIds' (Resolve o ReferenceError)
    const rawCheckedIds = localStorage.getItem(STORAGE_KEY); 
    
    // 2. Converte os IDs salvos em um Array para fácil verificação
    const checkedIds = rawCheckedIds ? JSON.parse(rawCheckedIds) : [];
    
    // Variáveis para ordenar no final
    const completedItems = [];
    const pendingItems = [];
    
    apiItems.forEach(item => {
    
        // Verificação de segurança:
        if (!item || !item.id || !item.attributes) {
            console.warn('Item pulado devido à falta de ID ou Attributes:', item);
            return; 
        }

        const id = item.id;
        // 3. Garantia: 'Titulo' (com 'T' maiúsculo) é a chave do JSON do Strapi.
        const titulo = item.attributes.Titulo;

        // Verifica se o ID desta tarefa está na lista de IDs marcados
        const isChecked = checkedIds.includes(String(id));
        
        const label = createListItem({ id, titulo, isChecked });
        
        // Separa para ordenação
        if (isChecked) {
            completedItems.push(label);
        } else {
            pendingItems.push(label);
        }
    });
    
    // Renderiza primeiro os pendentes, depois os concluídos
    pendingItems.forEach(item => playlistContainer.appendChild(item));
    completedItems.forEach(item => playlistContainer.appendChild(item));
    
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
        
        // Salva o novo estado de conclusão no localStorage
        saveCheckedStatus();

        // Lógica de adicionar/remover classe 'completed' no label pai
        const label = checkbox.closest("label");
        
        if (checkbox.checked) {
             label.classList.add("completed");
        } else {
             label.classList.remove("completed");
        }
        
        // Lógica de mover o item na lista (opcional, mas mantém a ordem visual)
        if (checkbox.checked) {
             // Move para o final da lista
             playlistContainer.appendChild(label);
        } else {
             // Move para o topo da lista (antes do primeiro concluído)
             const firstCompleted = playlistContainer.querySelector('.completed');
             if (firstCompleted) {
                 playlistContainer.insertBefore(label, firstCompleted);
             } else {
                 playlistContainer.prepend(label); // Se não houver concluídos, vai para o topo
             }
        }
    }
});


// Inicialização
loadTasksFromStrapiAndLocal();