// 1. Importações do Firebase (Versão Modular v10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// 2. Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDYSIY3zAj6gsvscWWZBzF1Juu-UQoNFI8",
    authDomain: "acervo-luterano.firebaseapp.com",
    projectId: "acervo-luterano",
    storageBucket: "acervo-luterano.firebasestorage.app",
    messagingSenderId: "561041322186",
    appId: "1:561041322186:web:031b6c399d9ab0929d4433",
    measurementId: "G-D36RK4VRV8"
};

// 3. Inicialização
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

/**
 * ESTADO GLOBAL DA APLICAÇÃO
 */
let todosOsArtigos = [];
let revistaAtual = 'Todas';
let analyticsTimeout; // Variável para controlar o debounce do Analytics

// Elementos da DOM
const grid = document.getElementById('results-grid');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById('pdf-modal');
const pdfViewer = document.getElementById('pdf-viewer');
const closeModalBtn = document.getElementById('close-modal');
const toggleBtns = document.querySelectorAll('.toggle-btn');
const modalContent = document.getElementById('modal-content');
const loadingSpinner = document.getElementById('loading-spinner');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// Novos elementos de Filtro
const checkboxesTipo = document.querySelectorAll('.filter-tipo');
const selectAno = document.getElementById('filter-ano');
const btnLimparFiltros = document.getElementById('btn-limpar-filtros');

/**
 * 1. CARREGAMENTO DOS DADOS (JSON EXTERNO)
 */
async function carregarAcervo() {
    try {
        console.log("Iniciando o carregamento do acervo..."); // Log para teste
        const response = await fetch('./file.json');

        if (!response.ok) throw new Error("Não foi possível carregar o ficheiro de dados.");

        const revistasData = await response.json();
        // Planificação (Flattening)
        todosOsArtigos = revistasData.flatMap(revista => {
            return revista.artigos.map(artigo => {
                return {
                    ...artigo,
                    nomeRevista: revista.revista,
                    ano: revista.edicao.ano,
                    volume: revista.edicao.volume,
                    numero: revista.edicao.numero
                };
            });
        });

        // Configuração Inicial da Interface
        document.getElementById('revista-titulo').textContent = "Acervo Luterano Digital";
        document.getElementById('revista-edicao').textContent = `${todosOsArtigos.length} artigos disponíveis nas revistas luteranas.`;
        construirFiltrosDinamicos();
        renderArticles(todosOsArtigos);
        console.log("Acervo carregado com sucesso!"); // Log para teste

    } catch (error) {
        console.error("Erro na inicialização:", error);
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444; font-weight: bold;">Erro ao carregar o acervo: ${error.message}</p>`;
    }
}

/**
 * 2. RENDERIZAÇÃO DOS CARTÕES
 */
function renderArticles(artigos) {
    grid.innerHTML = '';

    if (artigos.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 40px;">Nenhum artigo encontrado para os critérios selecionados.</p>';
        return;
    }

    artigos.forEach(artigo => {
        const card = document.createElement('div');
        card.className = 'card';

        const imagemExibida = artigo.url_capa || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=400';

        card.innerHTML = `
            <img src="${imagemExibida}" alt="Capa" class="card-image" loading="lazy">
            <div class="card-content">
                <div class="meta-info">
                    <span class="material-symbols-outlined">auto_stories</span>
                    ${artigo.nomeRevista} • ${artigo.ano}
                </div>
                <h3>${artigo.titulo}</h3>
                <div class="info-row">
                    <span class="material-symbols-outlined">person</span> ${artigo.autor}
                </div>
                <p class="resumo">${artigo.resumo}</p>
                <div class="tags">
                    ${artigo.palavras_chave.map(tag => `<span>#${tag}</span>`).join(' ')}
                </div>
                <button class="btn-read" onclick="abrirPDF('${artigo.id}')">
                    <span class="material-symbols-outlined">menu_book</span> Ler Artigo
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

/**
 * MOTOR DE GERAÇÃO DINÂMICA DE FILTROS (Data-Driven)
 */
function construirFiltrosDinamicos() {
    const contagemAnos = {};
    const contagemAutores = {};
    const contagemAssuntos = {};

    // 1. Extração e Contagem de Dados do JSON
    todosOsArtigos.forEach(artigo => {
        // Conta Anos
        contagemAnos[artigo.ano] = (contagemAnos[artigo.ano] || 0) + 1;

        // Conta Autores (separando os múltiplos autores por "e" ou ";")
        const autoresSeparados = artigo.autor.split(/ e |;/).map(a => a.trim());
        autoresSeparados.forEach(autor => {
            contagemAutores[autor] = (contagemAutores[autor] || 0) + 1;
        });

        // Conta Assuntos (Palavras-Chave)
        artigo.palavras_chave.forEach(tag => {
            const termo = tag.trim();
            contagemAssuntos[termo] = (contagemAssuntos[termo] || 0) + 1;
        });
    });

    // 2. Função Helper para injetar o HTML
    function renderizarCheckboxes(containerId, dataObj, inputClass, sortBy = 'count') {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Limpa antes de renderizar

        let entradas = Object.entries(dataObj);

        // Ordenação Inteligente
        if (sortBy === 'count') {
            entradas.sort((a, b) => b[1] - a[1]); // Ordena pelos mais comuns primeiro
        } else if (sortBy === 'desc') {
            entradas.sort((a, b) => b[0] - a[0]); // Ordena numérico decrescente (ideal para Anos)
        }

        entradas.forEach(([nome, quantidade]) => {
            const label = document.createElement('label');
            label.className = 'filter-label';
            label.innerHTML = `
                <div>
                    <input type="checkbox" class="${inputClass}" value="${nome}">
                    <span>${nome}</span>
                </div>
                <span class="filter-count">${quantidade}</span>
            `;
            container.appendChild(label);
        });
    }

    // 3. Renderiza no DOM
    renderizarCheckboxes('filter-ano-list', contagemAnos, 'cb-ano', 'desc');
    renderizarCheckboxes('filter-autor-list', contagemAutores, 'cb-autor', 'count');
    renderizarCheckboxes('filter-assunto-list', contagemAssuntos, 'cb-assunto', 'count');

    // 4. Acopla os Event Listeners dinamicamente
    document.querySelectorAll('.cb-ano, .cb-autor, .cb-assunto').forEach(cb => {
        cb.addEventListener('change', aplicarFiltros);
    });
}

/**
 * APLICAÇÃO DOS FILTROS UNIFICADOS
 */
function aplicarFiltros() {
    const termoBusca = searchInput.value.toLowerCase().trim();
    const palavrasChave = termoBusca === "" ? [] : termoBusca.split(/\s+/);

    // Função auxiliar para capturar o que o utilizador selecionou
    const getSelecionados = (className) => Array.from(document.querySelectorAll(`.${className}:checked`)).map(cb => cb.value);

    const anosSel = getSelecionados('cb-ano');
    const autoresSel = getSelecionados('cb-autor');
    const assuntosSel = getSelecionados('cb-assunto');

    let resultado = todosOsArtigos;

    // Aba da Revista no Topo
    if (revistaAtual !== 'Todas') {
        resultado = resultado.filter(artigo => artigo.nomeRevista === revistaAtual);
    }

    // Filtros Dinâmicos
    if (anosSel.length > 0) {
        resultado = resultado.filter(a => anosSel.includes(a.ano.toString()));
    }

    if (autoresSel.length > 0) {
        resultado = resultado.filter(a => autoresSel.some(autorSel => a.autor.includes(autorSel)));
    }

    if (assuntosSel.length > 0) {
        resultado = resultado.filter(a => assuntosSel.some(assuntoSel => a.palavras_chave.includes(assuntoSel)));
    }

    // Pesquisa de Texto Livre
    if (palavrasChave.length > 0) {
        resultado = resultado.filter(artigo => {
            const citacoes = artigo.autores_citados ? artigo.autores_citados.join(' ') : '';
            const indiceTexto = `${artigo.titulo} ${artigo.autor} ${artigo.palavras_chave.join(' ')} ${artigo.resumo} ${citacoes}`.toLowerCase();
            return palavrasChave.every(palavra => indiceTexto.includes(palavra));
        });
    }

    renderArticles(resultado);
}

// Lógica de Limpeza do Botão "X"
document.getElementById('btn-limpar-filtros').addEventListener('click', () => {
    searchInput.value = '';
    document.querySelectorAll('.cb-ano, .cb-autor, .cb-assunto').forEach(cb => cb.checked = false);
    aplicarFiltros();
});

/**
 * 4. EVENTOS DE INTERAÇÃO (Listeners)
 */

// Listener da Barra de Busca
searchInput.addEventListener('input', aplicarFiltros);

// Listener dos Botões de Alternância (Abas)
toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        revistaAtual = e.currentTarget.getAttribute('data-revista');

        // Registo no Analytics: Mudança de Aba
        logEvent(analytics, 'select_item_list', {
            item_list_name: revistaAtual
        });

        aplicarFiltros();
    });
});

/**
 * GERAÇÃO DE SEO ACADÉMICO (Highwire Press Tags)
 * Requisito para indexação no Google Scholar e ResearchGate
 */
function atualizarSEOAcademico(artigo) {
    // 1. Limpa as meta tags do artigo anterior (se existirem)
    document.querySelectorAll('meta[name^="citation_"]').forEach(el => el.remove());

    // 2. Define as tags obrigatórias do padrão académico
    const metaTags = [
        { name: 'citation_title', content: artigo.titulo },
        { name: 'citation_author', content: artigo.autor },
        { name: 'citation_publication_date', content: artigo.ano.toString() },
        { name: 'citation_journal_title', content: artigo.nomeRevista },
        { name: 'citation_pdf_url', content: artigo.url_acesso.replace(/\/view.*/, '/preview') },
        { name: 'citation_language', content: 'pt' }
    ];

    // 3. Injeta no <head> do documento
    metaTags.forEach(tagData => {
        const meta = document.createElement('meta');
        meta.name = tagData.name;
        meta.content = tagData.content;
        document.head.appendChild(meta);
    });

    // 4. Atualiza o título real da aba do navegador
    document.title = `${artigo.titulo} - Acervo Luterano`;
}

// Captura os novos elementos
const secaoRelacionados = document.getElementById('secao-relacionados');
const gridRelacionados = document.getElementById('grid-relacionados');
const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
const lateralSidebar = document.getElementById('lateral-sidebar');

// 1. AÇÃO DO BOTÃO LATERAL
btnToggleSidebar.addEventListener('click', () => {
    lateralSidebar.classList.toggle('hidden-sidebar');
});
function encontrarArtigosRelacionados(artigoBase) {
    // 1. Remove o próprio artigo da lista de candidatos
    let candidatos = todosOsArtigos.filter(a => a.id !== artigoBase.id);

    // 2. Calcula a Pontuação de Similaridade (Scoring)
    candidatos.forEach(candidato => {
        let pontuacao = 0;

        // Peso Maior: Palavras-chave em comum (2 pontos cada)
        artigoBase.palavras_chave.forEach(tag => {
            if (candidato.palavras_chave.includes(tag)) pontuacao += 2;
        });

        // Peso Médio: Mesmo autor (1 ponto)
        if (candidato.autor === artigoBase.autor) pontuacao += 1;

        // Peso Menor: Mesma Revista (0.5 pontos)
        if (candidato.nomeRevista === artigoBase.nomeRevista) pontuacao += 0.5;

        candidato.similaridade = pontuacao;
    });

    // 3. Ordena pelos mais similares e retorna o Top 3 (que tenham alguma pontuação)
    return candidatos
        .filter(c => c.similaridade > 0)
        .sort((a, b) => b.similaridade - a.similaridade)
        .slice(0, 3);
}
// 2. ATUALIZAR A FUNÇÃO RENDERIZAR
function renderizarRelacionados(artigoBase) {
    const recomendacoes = encontrarArtigosRelacionados(artigoBase); // A mesma função que criamos antes
    gridRelacionados.innerHTML = '';

    // Se não houver recomendações, esconde o botão da barra lateral
    if (recomendacoes.length === 0) {
        btnToggleSidebar.style.display = 'none';
        lateralSidebar.classList.add('hidden-sidebar');
        return;
    }

    btnToggleSidebar.style.display = 'flex';

    recomendacoes.forEach(artigo => {
        const card = document.createElement('div');
        card.className = 'related-card';
        card.onclick = () => window.abrirPDF(artigo.id);

        card.innerHTML = `
            <h5>${artigo.titulo}</h5>
            <div class="meta" style="font-size: 0.8rem; color: #64748b; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 14px;">person</span> 
                ${artigo.autor}
            </div>
        `;
        gridRelacionados.appendChild(card);
    });
}

/**
 * 5. VISUALIZADOR DE PDF E LÓGICA DO MODAL
 */
// Função no escopo global para ser chamada pelo HTML
window.abrirPDF = function (artigoId) {
    // Busca todos os dados do artigo diretamente na memória usando o ID
    const artigo = todosOsArtigos.find(a => a.id === artigoId);

    // Trava de segurança
    if (!artigo) {
        console.error("Artigo não encontrado no banco de dados.");
        return;
    }

    document.body.classList.add('no-scroll');
    loadingSpinner.style.display = 'flex';
    pdfViewer.style.opacity = '0';

    // GUARDA O ARTIGO ATUAL PARA A CITAÇÃO E SEO
    artigoAbertoAtual = artigo;
    atualizarSEOAcademico(artigo);
    // NOVO: Chama o motor de recomendação
    renderizarRelacionados(artigo);
    // Converte a URL e adiciona a página de início
    let embedUrl = artigo.url_acesso.replace(/\/view.*/, '/preview');
    embedUrl += `#page=${artigo.paginas.inicio}`;

    pdfViewer.src = embedUrl;
    modal.classList.remove('hidden');

    // Registo no Analytics (agora com acesso seguro ao título)
    logEvent(analytics, 'select_content', {
        content_type: 'artigo_pdf',
        item_id: artigo.id,
        item_name: artigo.titulo
    });
};

// Remove o Spinner assim que o Google Drive terminar de renderizar o PDF
pdfViewer.onload = function () {
    loadingSpinner.style.display = 'none';
    pdfViewer.style.opacity = '1';
};

// Captura o novo botão
const btnCitar = document.getElementById('btn-citar');
let artigoAbertoAtual = null; // Nova variável global para saber qual artigo está aberto
btnCitar.addEventListener('click', async () => {
    if (!artigoAbertoAtual) return;

    const a = artigoAbertoAtual;
    const autoresABNT = formatarAutoresABNT(a.autor);

    // Formata a data de acesso (ex: 26 fev. 2026)
    const dataAtual = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).replace('de ', '').replace('.', '');

    // Estrutura ABNT: SOBRENOME, Nome. Título. Revista, v. X, n. Y, p. inicio-fim, ano. Disponível em: <URL>. Acesso em: data.
    const citacaoABNT = `${autoresABNT}. ${a.titulo}. ${a.nomeRevista}, v. ${a.volume}, n. ${a.numero}, p. ${a.paginas.inicio}-${a.paginas.fim}, ${a.ano}. Disponível em: <${a.url_acesso}>. Acesso em: ${dataAtual}.`;

    try {
        // Usa a API moderna do W3C para copiar o texto
        await navigator.clipboard.writeText(citacaoABNT);

        // Feedback Visual (UX)
        const conteudoOriginal = btnCitar.innerHTML;
        btnCitar.innerHTML = `<span class="material-symbols-outlined">check</span> Copiado!`;
        btnCitar.style.backgroundColor = "#e2e8f0"; // Muda a cor levemente

        // Retorna ao estado original após 2 segundos
        setTimeout(() => {
            btnCitar.innerHTML = conteudoOriginal;
            btnCitar.style.backgroundColor = "";
        }, 2000);

        // Regista o evento de partilha no Firebase Analytics
        logEvent(analytics, 'share', {
            method: 'copy_citation',
            content_type: 'artigo_academico',
            item_id: a.id
        });

    } catch (err) {
        console.error('Erro ao copiar a citação: ', err);
        alert("O seu navegador bloqueou a cópia automática. Verifique as permissões.");
    }
});
/**
 * LÓGICA DE FORMATAÇÃO ABNT
 */
function formatarAutoresABNT(autoresString) {
    // Separa múltiplos autores ligados por "e" ou ";"
    const autores = autoresString.split(/ e |;/).map(a => a.trim());

    const autoresFormatados = autores.map(autor => {
        const partes = autor.split(' ');
        if (partes.length === 1) return partes[0].toUpperCase();

        const sobrenome = partes.pop().toUpperCase(); // Pega o último nome e capitaliza
        const restoDoNome = partes.join(' ');
        return `${sobrenome}, ${restoDoNome}`;
    });

    return autoresFormatados.join('; ');
}

// Lógica Única para Fechar o Modal
closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    pdfViewer.src = "";
    document.body.classList.remove('no-scroll');

    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    document.title = "Acervo Luterano Digital";
    lateralSidebar.classList.add('hidden-sidebar');
});

// Lógica da Fullscreen API (W3C)
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        modalContent.requestFullscreen().catch(err => {
            console.warn(`Erro ao tentar tela cheia: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});

// Atualiza o texto do botão Fullscreen dinamicamente
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        fullscreenBtn.innerHTML = `<span class="material-symbols-outlined">fullscreen_exit</span> Sair da Tela Cheia`;
    } else {
        fullscreenBtn.innerHTML = `<span class="material-symbols-outlined">fullscreen</span> Expandir`;
    }
});

/**
 * INICIALIZAÇÃO DA APLICAÇÃO
 */
carregarAcervo();