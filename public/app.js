// 1. Importações do nosso módulo isolado e do SDK do Firebase Auth/Firestore
import { auth, db, googleProvider } from './firebase-config.js';
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * ESTADO GLOBAL DA APLICAÇÃO
 */
let todosOsArtigos = [];
let revistaAtual = 'Todas';
let artigoAbertoAtual = null; 
let currentUser = null; // Guarda o utilizador logado
let currentUserRole = null; // Guarda a profissão/papel
let avaliacaoAtual = 0; // Quantas estrelas o usuário marcou

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
// NOVOS ELEMENTOS DA DOM (Adicione estes à sua lista de consts)
const btnLoginNav = document.getElementById('btn-login-nav');
const btnLoginComments = document.getElementById('btn-login-comments');
const btnLogout = document.getElementById('btn-logout');
const userProfileMenu = document.getElementById('user-profile-menu');
const userAvatar = document.getElementById('user-avatar');
const profileSetupModal = document.getElementById('profile-setup-modal');
const btnSaveProfile = document.getElementById('btn-save-profile');
const userRoleSelect = document.getElementById('user-role-select');
const sidebarTabs = document.querySelectorAll('.s-tab');
const commentsAuthPrompt = document.getElementById('comments-auth-prompt');
const commentsForm = document.getElementById('comments-form');
const commentsList = document.getElementById('comments-list');
const stars = document.querySelectorAll('.star');
const btnSubmitComment = document.getElementById('btn-submit-comment');
const commentText = document.getElementById('comment-text');

let userProgress = {}; // Guarda os artigos lidos/lendo do utilizador

const statusLeituraSelect = document.getElementById('status-leitura');
const filterGroupProgresso = document.getElementById('filter-group-progresso');
const secaoRelacionados = document.getElementById('secao-relacionados'); // Para o bug da barra
const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
/**
 * LÓGICA DE AUTENTICAÇÃO (LOGIN GOOGLE) E PERFIL
 */
// Monitoriza o estado de login em tempo real
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        btnLoginNav.classList.add('hidden');
        userProfileMenu.classList.remove('hidden');
        userAvatar.src = user.photoURL;
        
        // Esconde o aviso de login nos comentários e mostra o formulário
        commentsAuthPrompt.classList.add('hidden');
        commentsForm.classList.remove('hidden');

        // Verifica se o utilizador já preencheu o papel (Professor, Seminarista...)
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            currentUserRole = docSnap.data().role;
        } else {
            // Se é o primeiro login, abre o modal de perfil
            profileSetupModal.classList.remove('hidden');
        }
        filterGroupProgresso.classList.remove('hidden'); // Mostra o filtro lateral
        carregarProgressoUsuario(); // Puxa os crachás
    } else {
        currentUser = null;
        currentUserRole = null;
        btnLoginNav.classList.remove('hidden');
        userProfileMenu.classList.add('hidden');
        
        // Volta a pedir login nos comentários
        commentsAuthPrompt.classList.remove('hidden');
        commentsForm.classList.add('hidden');
        filterGroupProgresso.classList.add('hidden'); // Esconde o filtro
        userProgress = {}; // Limpa os dados de quem saiu
        aplicarFiltros();
    }
});

const fazerLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (error) { console.error("Erro no login:", error); alert("Falha ao entrar com Google."); }
};

if(btnLoginNav) btnLoginNav.addEventListener('click', fazerLogin);
if(btnLoginComments) btnLoginComments.addEventListener('click', fazerLogin);
if(btnLogout) btnLogout.addEventListener('click', () => signOut(auth));

// Salvar Perfil (Profissão) no Firestore
if(btnSaveProfile) {
    btnSaveProfile.addEventListener('click', async () => {
        const role = userRoleSelect.value;
        try {
            await setDoc(doc(db, "usuarios", currentUser.uid), {
                nome: currentUser.displayName,
                email: currentUser.email,
                foto: currentUser.photoURL,
                role: role,
                dataCriacao: serverTimestamp()
            });
            currentUserRole = role;
            profileSetupModal.classList.add('hidden');
        } catch (e) { alert("Erro ao salvar perfil."); }
    });
}

/**
 * LÓGICA DE UI: ABAS DO MODAL (Relacionados vs Comentários)
 */
sidebarTabs.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Desmarca todas as abas
        sidebarTabs.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.s-tab-content').forEach(c => c.classList.add('hidden'));
        
        // Ativa a aba clicada
        const targetId = e.target.getAttribute('data-tab');
        e.target.classList.add('active');
        document.getElementById(targetId).classList.remove('hidden');

        // Se abriu a aba de comentários, carrega as avaliações deste artigo da Base de Dados
        if(targetId === 'tab-comentarios' && artigoAbertoAtual) {
            carregarComentarios(artigoAbertoAtual.id);
        }
    });
});

/**
 * LÓGICA DE AVALIAÇÕES E COMENTÁRIOS (Firestore)
 */
// UX das Estrelas
stars.forEach(star => {
    star.addEventListener('click', (e) => {
        avaliacaoAtual = parseInt(e.target.getAttribute('data-value'));
        stars.forEach(s => {
            if(parseInt(s.getAttribute('data-value')) <= avaliacaoAtual) s.classList.add('active');
            else s.classList.remove('active');
        });
    });
});

// Enviar Comentário
if(btnSubmitComment) {
    btnSubmitComment.addEventListener('click', async () => {
        const texto = commentText.value.trim();
        if(avaliacaoAtual === 0) { alert("Por favor, selecione uma nota de 1 a 5 estrelas."); return; }
        
        btnSubmitComment.textContent = "Salvando...";
        btnSubmitComment.disabled = true;

        try {
            await addDoc(collection(db, "comentarios"), {
                artigoId: artigoAbertoAtual.id,
                userId: currentUser.uid,
                userName: currentUser.displayName,
                userPhoto: currentUser.photoURL,
                userRole: currentUserRole || 'Leitor',
                nota: avaliacaoAtual,
                texto: texto,
                data: serverTimestamp()
            });
            
            commentText.value = '';
            avaliacaoAtual = 0;
            stars.forEach(s => s.classList.remove('active'));
            carregarComentarios(artigoAbertoAtual.id); // Recarrega a lista
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao publicar avaliação.");
        } finally {
            btnSubmitComment.textContent = "Publicar";
            btnSubmitComment.disabled = false;
        }
    });
}

// Carregar Comentários
async function carregarComentarios(artigoId) {
    commentsList.innerHTML = '<div class="spinner"></div>'; // Feedback visual
    try {
        const q = query(collection(db, "comentarios"), where("artigoId", "==", artigoId), orderBy("data", "desc"));
        const querySnapshot = await getDocs(q);
        
        commentsList.innerHTML = '';
        if(querySnapshot.empty) {
            commentsList.innerHTML = '<p style="text-align:center; color:#64748b; font-size:0.9rem;">Seja o primeiro a avaliar este artigo!</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let starsHTML = '';
            for(let i=0; i<5; i++) { starsHTML += `<span class="material-symbols-outlined" style="color: ${i < data.nota ? '#f59e0b' : '#e2e8f0'}">star</span>`; }
            
            const commentCard = document.createElement('div');
            commentCard.className = 'comment-card';
            commentCard.innerHTML = `
                <div class="comment-header">
                    <img src="${data.userPhoto}" alt="Foto" class="comment-avatar">
                    <div class="comment-meta">
                        <h4 class="comment-name">${data.userName}</h4>
                        <span class="comment-role">${data.userRole}</span>
                    </div>
                </div>
                <div class="comment-stars">${starsHTML}</div>
                <p class="comment-body">${data.texto}</p>
            `;
            commentsList.appendChild(commentCard);
        });
    } catch (error) {
        console.error(error);
        commentsList.innerHTML = '<p style="color:red; font-size:0.85rem;">Falha ao carregar as avaliações. O Firestore pode necessitar de Índices.</p>';
    }
}


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
        lerURLInicial();
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
    
    // UX Melhorado: Tela de Estado Vazio Amigável
    if (artigos.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <span class="material-symbols-outlined">search_off</span>
                <h3>Nenhum artigo encontrado</h3>
                <p>Tente remover alguns filtros ou buscar por outros termos.</p>
            </div>
        `;
        return;
    }

    const urlAtualParams = new URLSearchParams(window.location.search);

    artigos.forEach(artigo => {
        const card = document.createElement('div');
        card.className = 'card';
        const capa = artigo.url_capa || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=400';

        // VERIFICAÇÃO DE SEGURANÇA: Tem link do PDF?
        const temPDF = artigo.url_acesso && artigo.url_acesso.trim() !== "";
        
        urlAtualParams.set('artigo', artigo.id);
        
        // Se não tem PDF, o botão muda de cor, de ícone e não é clicável
        const linkHref = temPDF ? `?${urlAtualParams.toString()}` : `javascript:void(0)`;
        const btnClass = temPDF ? 'btn-read' : 'btn-read disabled';
        const onclickAttr = temPDF ? `onclick="return janelaModal(event, '${artigo.id}')"` : 'onclick="return false;"';
        const btnText = temPDF ? `<span class="material-symbols-outlined">menu_book</span> Ler Artigo` : `<span class="material-symbols-outlined">lock</span> Brevemente`;

        let badgeHTML = '';
        if (currentUser && userProgress[artigo.id]) {
            if (userProgress[artigo.id] === 'lido') {
                badgeHTML = `<div class="status-badge lido"><span class="material-symbols-outlined" style="font-size:14px;">done_all</span> Lido</div>`;
            } else if (userProgress[artigo.id] === 'lendo') {
                badgeHTML = `<div class="status-badge lendo"><span class="material-symbols-outlined" style="font-size:14px;">hourglass_bottom</span> Lendo</div>`;
            }
        }

        card.innerHTML = `
            ${badgeHTML}
            <img src="${capa}" alt="Capa" class="card-image" loading="lazy">
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
                
                <a href="${linkHref}" class="${btnClass}" ${onclickAttr}>
                    ${btnText}
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}

/**
 * MOTOR DE GERAÇÃO DINÂMICA DE FILTROS (Data-Driven)
 */
// Carrega o progresso do Firestore quando a pessoa faz login
async function carregarProgressoUsuario() {
    if(!currentUser) return;
    try {
        const q = query(collection(db, "progresso_leitura"), where("userId", "==", currentUser.uid));
        const snapshot = await getDocs(q);
        userProgress = {}; // Reseta o mapa
        snapshot.forEach(doc => {
            const data = doc.data();
            userProgress[data.artigoId] = data.status;
        });
        aplicarFiltros(); // Atualiza a tela para mostrar os crachás
    } catch (e) { console.error("Erro ao carregar progresso", e); }
}

// Salva o progresso quando o utilizador altera o Seletor no Modal
if(statusLeituraSelect) {
    statusLeituraSelect.addEventListener('change', async (e) => {
        if(!currentUser || !artigoAbertoAtual) return;
        const novoStatus = e.target.value;
        statusLeituraSelect.disabled = true;

        try {
            // Cria um ID único para o documento: IDdoUser_IDdoArtigo
            const docId = `${currentUser.uid}_${artigoAbertoAtual.id}`;
            
            if(novoStatus === "") {
                // Se marcou opção vazia, remove o progresso do dicionário local e anula no banco
                await setDoc(doc(db, "progresso_leitura", docId), { status: "" }, { merge: true });
                delete userProgress[artigoAbertoAtual.id];
            } else {
                await setDoc(doc(db, "progresso_leitura", docId), {
                    userId: currentUser.uid,
                    artigoId: artigoAbertoAtual.id,
                    status: novoStatus,
                    updatedAt: serverTimestamp()
                });
                userProgress[artigoAbertoAtual.id] = novoStatus;
            }
            // Atualiza os cartões lá no fundo
            aplicarFiltros();
        } catch (err) {
            console.error("Erro ao salvar progresso", err);
            alert("Erro ao sincronizar leitura.");
        } finally {
            statusLeituraSelect.disabled = false;
        }
    });
}
function atualizarContadoresCruzados(baseAnos, baseAutores, baseAssuntos) {
    const contagemAnos = {};
    const contagemAutores = {};
    const contagemAssuntos = {};

    // Conta os Anos
    baseAnos.forEach(a => contagemAnos[a.ano] = (contagemAnos[a.ano] || 0) + 1);
    
    // Conta os Autores
    baseAutores.forEach(a => {
        a.autor.split(/ e |;/).map(x => x.trim()).forEach(autor => {
            contagemAutores[autor] = (contagemAutores[autor] || 0) + 1;
        });
    });

    // Conta os Assuntos
    baseAssuntos.forEach(a => {
        a.palavras_chave.forEach(tag => {
            const termo = tag.trim();
            contagemAssuntos[termo] = (contagemAssuntos[termo] || 0) + 1;
        });
    });

    // Atualiza o DOM (HTML)
    document.querySelectorAll('.filter-label').forEach(label => {
        const checkbox = label.querySelector('input');
        if(!checkbox) return; // Proteção extra
        
        let novaQuantidade = 0;
        if (checkbox.classList.contains('cb-ano')) novaQuantidade = contagemAnos[checkbox.value] || 0;
        else if (checkbox.classList.contains('cb-autor')) novaQuantidade = contagemAutores[checkbox.value] || 0;
        else if (checkbox.classList.contains('cb-assunto')) novaQuantidade = contagemAssuntos[checkbox.value] || 0;
        else return; // Ignora o filtro de progresso nesta contagem cruzada

        label.querySelector('.filter-count').textContent = novaQuantidade;

        // Se for zero e não estiver selecionado, esmaece. Caso contrário, deixa clicável.
        if (novaQuantidade === 0 && !checkbox.checked) {
            label.style.opacity = '0.3';
            label.style.pointerEvents = 'none';
        } else {
            label.style.opacity = '1';
            label.style.pointerEvents = 'auto';
        }
    });
}
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
/**
 * LÓGICA DE DEEP LINKING (URLs Inteligentes)
 */
function atualizarURL() {
    const params = new URLSearchParams();
    
    // Captura o texto da busca
    const termo = searchInput.value.trim();
    if (termo) params.set('busca', termo);
    
    // Captura a aba da revista
    if (revistaAtual !== 'Todas') params.set('revista', revistaAtual);

    // Função auxiliar para capturar checkboxes
    const getSelecionados = (className) => Array.from(document.querySelectorAll(`.${className}:checked`)).map(cb => cb.value);
    
    // Captura os filtros facetados
    const anosSel = getSelecionados('cb-ano');
    if (anosSel.length > 0) params.set('anos', anosSel.join(','));

    const autoresSel = getSelecionados('cb-autor');
    if (autoresSel.length > 0) params.set('autores', autoresSel.join(','));

    const assuntosSel = getSelecionados('cb-assunto');
    if (assuntosSel.length > 0) params.set('assuntos', assuntosSel.join(','));

    // Atualiza a barra de endereço do navegador silenciosamente (History API)
    const stringParams = params.toString();
    const novaURL = `${window.location.pathname}${stringParams ? '?' + stringParams : ''}`;
    window.history.replaceState({}, '', novaURL);
}

function lerURLInicial() {
    const params = new URLSearchParams(window.location.search);
    
    // 1. Preenche a barra de pesquisa
    if (params.has('busca')) {
        searchInput.value = params.get('busca');
    }
    
    // 2. Ativa a aba da revista correta
    if (params.has('revista')) {
        const revistaParam = params.get('revista');
        const aba = Array.from(toggleBtns).find(btn => btn.getAttribute('data-revista') === revistaParam);
        if (aba) {
            toggleBtns.forEach(b => b.classList.remove('active'));
            aba.classList.add('active');
            revistaAtual = revistaParam;
        }
    }

    // 3. Preenche os checkboxes (anos, autores, assuntos)
    const preencherCheckboxes = (paramNome, className) => {
        if (params.has(paramNome)) {
            const valores = params.get(paramNome).split(',');
            const checkboxes = document.querySelectorAll(`.${className}`);
            checkboxes.forEach(cb => {
                if (valores.includes(cb.value)) cb.checked = true;
            });
        }
    };

    preencherCheckboxes('anos', 'cb-ano');
    preencherCheckboxes('autores', 'cb-autor');
    preencherCheckboxes('assuntos', 'cb-assunto');

    // Após ler tudo, aplica os filtros para renderizar a tela
    aplicarFiltros();
    // 4. ABERTURA DIRETA DO ARTIGO (Deep Linking do Modal)
    if (params.has('artigo')) {
        const idArtigo = params.get('artigo');
        const artigoExiste = todosOsArtigos.find(a => a.id === idArtigo);
        
        if (artigoExiste) {
            // Um pequeno atraso (500ms) garante que a grelha de fundo já foi desenhada 
            // antes de o modal sobrepor a tela, evitando travamentos visuais.
            setTimeout(() => {
                window.abrirPDF(idArtigo);
            }, 500);
        }
    }
}
function aplicarFiltros() {
    const busca = searchInput.value.toLowerCase().trim();
    const palavras = busca === "" ? [] : busca.split(/\s+/);
    
    // A função 'sel' existe AQUI
    const sel = (c) => Array.from(document.querySelectorAll(`.${c}:checked`)).map(cb => cb.value);
    
    const sAnos = sel('cb-ano');
    const sAut = sel('cb-autor');
    const sAss = sel('cb-assunto');
    const sProgresso = sel('cb-progresso'); // Lê o filtro de progresso

    let base = todosOsArtigos;
    
    if (revistaAtual !== 'Todas') {
        base = base.filter(a => a.nomeRevista === revistaAtual);
    }
    
    if (palavras.length > 0) {
        base = base.filter(a => {
            const texto = `${a.titulo} ${a.autor} ${a.palavras_chave.join(' ')} ${a.resumo}`.toLowerCase();
            const textoLimpo = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const palavrasLimpas = palavras.map(p => p.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
            return palavrasLimpas.every(p => textoLimpo.includes(p));
        });
    }

    // NOVO: Filtrar pelo Progresso do Utilizador
    if (sProgresso.length > 0 && currentUser) {
        base = base.filter(a => {
            const statusAtual = userProgress[a.id] || "nao_lido";
            return sProgresso.includes(statusAtual);
        });
    }

    const fAno = l => sAnos.length === 0 ? l : l.filter(a => sAnos.includes(a.ano.toString()));
    const fAut = l => sAut.length === 0 ? l : l.filter(a => sAut.some(x => a.autor.includes(x)));
    const fAss = l => sAss.length === 0 ? l : l.filter(a => sAss.some(x => a.palavras_chave.includes(x)));

    atualizarContadoresCruzados(fAss(fAut(base)), fAss(fAno(base)), fAut(fAno(base)));
    
    const resultado = fAss(fAut(fAno(base)));
    renderArticles(resultado);
    atualizarURL(); 
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
//const secaoRelacionados = document.getElementById('secao-relacionados');
const gridRelacionados = document.getElementById('grid-relacionados');
//const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
const lateralSidebar = document.getElementById('lateral-sidebar');

// 1. AÇÃO DO BOTÃO LATERAL
if (btnToggleSidebar && secaoRelacionados) {
    btnToggleSidebar.addEventListener('click', () => {
        // Agora esconde a barra CERTA do modal
        secaoRelacionados.classList.toggle('hidden');
        btnToggleSidebar.classList.toggle('active-state');
    });
}
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
    // 1. PRIMEIRO: Buscar o artigo na base de dados
    const artigo = todosOsArtigos.find(a => String(a.id) === String(artigoId));
    
    // Proteção Dupla: Se não achou o artigo ou se ele não tem URL, a função aborta
    if (!artigo || !artigo.url_acesso || artigo.url_acesso.trim() === "") return;

    // 2. AGORA SIM: Como já sabemos qual é o artigo, verificamos o status de leitura dele
    if(currentUser) {
        statusLeituraSelect.classList.remove('hidden');
        statusLeituraSelect.value = userProgress[artigo.id] || "";
    } else {
        statusLeituraSelect.classList.add('hidden');
    }

    artigoAbertoAtual = artigo;

    document.body.classList.add('no-scroll');
    loadingSpinner.style.display = 'flex';
    pdfViewer.style.opacity = '0';
    
    atualizarSEOAcademico(artigo);
    renderizarRelacionados(artigo);

    // Proteção contra artigos que possam não ter o objeto "paginas.inicio" no JSON
    const paginaInicio = (artigo.paginas && artigo.paginas.inicio) ? artigo.paginas.inicio : 1;
    let embedUrl = artigo.url_acesso.replace(/\/view.*/, '/preview') + `#page=${paginaInicio}`;
    
    pdfViewer.src = embedUrl;
    modal.classList.remove('hidden');

    atualizarURL(); 
    
    if (typeof logEvent === 'function') logEvent(analytics, 'select_content', { content_type: 'pdf', item_id: artigo.id });
};

// Remove o Spinner assim que o Google Drive terminar de renderizar o PDF
pdfViewer.onload = function () {
    loadingSpinner.style.display = 'none';
    pdfViewer.style.opacity = '1';
};
const btnPartilhar = document.getElementById('btn-partilhar');

/**
 * AÇÃO DE PARTILHAR O LINK DIRETO DO ARTIGO
 */
btnPartilhar.addEventListener('click', async () => {
    if (!artigoAbertoAtual) return;

    // Constrói a URL limpa com o ID do artigo
    // Exemplo: https://seu-site.web.app/?artigo=RL_2018_V78_N2_001
    const urlPartilha = `${window.location.origin}${window.location.pathname}?artigo=${artigoAbertoAtual.id}`;

    // Regista no Analytics que o artigo foi partilhado
    logEvent(analytics, 'share', {
        method: 'link_direto',
        content_type: 'artigo_academico',
        item_id: artigoAbertoAtual.id
    });

    // Tenta usar a Web Share API (Nativa em Telemóveis)
    if (navigator.share) {
        try {
            await navigator.share({
                title: `${artigoAbertoAtual.titulo} - Acervo Luterano`,
                text: `Leia este artigo no Acervo Luterano Digital: ${artigoAbertoAtual.titulo} (${artigoAbertoAtual.autor})`,
                url: urlPartilha
            });
        } catch (err) {
            // O utilizador fechou a janela de partilha nativa (não é um erro real)
            console.log('Partilha cancelada pelo utilizador.');
        }
    } else {
        // Fallback para Computadores (Copia para a Área de Transferência)
        try {
            await navigator.clipboard.writeText(urlPartilha);
            
            // Feedback Visual (UX)
            const conteudoOriginal = btnPartilhar.innerHTML;
            btnPartilhar.innerHTML = `<span class="material-symbols-outlined">check</span> Link Copiado!`;
            btnPartilhar.style.backgroundColor = "#e2e8f0";
            
            setTimeout(() => {
                btnPartilhar.innerHTML = conteudoOriginal;
                btnPartilhar.style.backgroundColor = "";
            }, 2000);
            
        } catch (err) {
            console.error('Erro ao copiar o link: ', err);
            alert("O seu navegador bloqueou a cópia automática do link.");
        }
    }
});
// Captura o novo botão
const btnCitar = document.getElementById('btn-citar');
//let artigoAbertoAtual = null; // Nova variável global para saber qual artigo está aberto
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
 * 8. UX E PERFORMANCE: DEBOUNCE E MINI-PESQUISAS
 */

// 8.1 DEBOUNCE: Impede que a pesquisa principal "engasgue" o navegador
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Substituímos o evento antigo da barra de pesquisa principal por este otimizado:
const aplicarFiltrosOtimizado = debounce(aplicarFiltros, 300); // Espera 300ms após o utilizador parar de digitar
searchInput.removeEventListener('input', aplicarFiltros); // Remove o antigo (se existir)
searchInput.addEventListener('input', aplicarFiltrosOtimizado);


// 8.2 MINI-PESQUISA: Filtra os itens da barra lateral (Autores e Assuntos)
function configurarMiniPesquisa(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    if (!input || !list) return;

    input.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase().trim();
        // Remove os acentos para facilitar a busca (ex: "Lutero" acha "Lútero")
        const termoLimpo = termo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const labels = list.querySelectorAll('.filter-label');
        
        labels.forEach(label => {
            const textoLabel = label.querySelector('span').textContent.toLowerCase();
            const textoLimpo = textoLabel.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            if (textoLimpo.includes(termoLimpo)) {
                label.style.display = 'flex'; // Mostra o autor/assunto
            } else {
                label.style.display = 'none'; // Esconde
            }
        });
    });
}

// Ativa a mini-pesquisa para Autores e Assuntos
configurarMiniPesquisa('search-autor', 'filter-autor-list');
configurarMiniPesquisa('search-assunto', 'filter-assunto-list');

// 8.3 BOTÕES DE LIMPAR POR GRUPO
document.querySelectorAll('.btn-clear-group').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetClass = e.target.getAttribute('data-target');
        const inputSearchId = targetClass === 'cb-autor' ? 'search-autor' : (targetClass === 'cb-assunto' ? 'search-assunto' : null);
        
        // Desmarca as checkboxes do grupo específico
        document.querySelectorAll(`.${targetClass}`).forEach(cb => cb.checked = false);
        
        // Limpa a mini-pesquisa e mostra todos os itens novamente
        if (inputSearchId) {
            const input = document.getElementById(inputSearchId);
            if(input) {
                input.value = '';
                input.dispatchEvent(new Event('input')); // Força a re-renderização visual
            }
        }
        
        aplicarFiltros();
    });
});
/**
 * LÓGICA DE UI: GAVETA DE FILTROS (MOBILE)
 */
const btnMobileFilters = document.getElementById('btn-mobile-filters');
const btnCloseFilters = document.getElementById('btn-close-filters');
const sidebar = document.getElementById('lateral-sidebar');
const mobileOverlay = document.getElementById('mobile-overlay');

function toggleMobileFilters() {
    sidebar.classList.toggle('drawer-open');
    mobileOverlay.classList.toggle('overlay-visible');
    // Previne o scroll da página de fundo quando o menu está aberto
    document.body.style.overflow = sidebar.classList.contains('drawer-open') ? 'hidden' : '';
}

// Abrir e Fechar Menu
if(btnMobileFilters) btnMobileFilters.addEventListener('click', toggleMobileFilters);
if(btnCloseFilters) btnCloseFilters.addEventListener('click', toggleMobileFilters);

// Fechar menu se o utilizador clicar na área escura (Overlay)
if(mobileOverlay) mobileOverlay.addEventListener('click', toggleMobileFilters);

// Fechar a gaveta automaticamente quando um filtro for clicado (Melhoria de UX no mobile)
document.querySelectorAll('.cb-ano, .cb-autor, .cb-assunto').forEach(cb => {
    cb.addEventListener('change', () => {
        if (window.innerWidth <= 900 && sidebar.classList.contains('drawer-open')) {
            // Pequeno atraso para o utilizador ver que clicou antes de fechar
            setTimeout(toggleMobileFilters, 300); 
        }
    });
});
/**
 * INICIALIZAÇÃO DA APLICAÇÃO
 */
carregarAcervo();