

//!SECTION Tratando de revistas

const array_revistas = [
    {
        "color": "red",
        "ano": "2016",
        "edicao": 1,
        "objectId": "1",
        "url": "https://drive.google.com/file/d/1Wk6L85DsIxa8FTGSs2SArd-joFdS0xtQ/view?usp=drive_link"
    },
    {
        "color": "green",
        "ano": 2017,
        "edicao": 2,
        "objectId": "2",
        "url": "https://drive.google.com/file/d/1bjsCAC0KeOe1o_bBty0NrjmNwx8A0VkB/view?usp=drive_link"
    },
    {
        "color": "green",
        "ano": 2017,
        "edicao": 1,
        "objectId": "3",
        "url": "https://drive.google.com/file/d/14pwP2SPtSe3xbLewAYIyhhgfmxC84lHc/view?usp=drive_link"
    },
    {
        "color": "blue",
        "ano": 2018,
        "edicao": 1,
        "objectId": "4",
        "url": "https://drive.google.com/file/d/1ckewjvRXzs4aV04EDbQL0Ew1I9tVJAsA/view?usp=drive_link"
    },
    {
        "color": "blue",
        "ano": "2018",
        "edicao": 2,
        "objectId": "5",
        "url": "https://drive.google.com/file/d/15418wpJn2I8OB7h6CYyWKAWJ87wug80M/view?usp=drive_link"
    },
    {
        "color": "red",
        "ano": "2019",
        "edicao": "1",
        "objectId": "6",
        "url": "https://drive.google.com/file/d/1EDCVlKj8WfWFbuucsUYQQV9e6IkYqxrY/view?usp=drive_link"
    },
    {
        "color": "red",
        "ano": 2019,
        "edicao": 2,
        "objectId": "7",
        "url": "https://drive.google.com/file/d/146PQB9ZZqUzyn-B0u9aQFlwOBGjwzI7m/view?usp=drive_link"
    }
]
function drawn_revist(array_revistas) {
    const revist_list = document.querySelector("#revist-list")
    let lists_html = ""

    for (const rev of array_revistas) {
        //console.log(rev);

        lists_html += `<div data-color="${rev.color}" data-url="${rev.url}" data-edicao="${rev.edicao == 2 ? "II" : "I"}" data-ano="${rev.ano}" id="${rev.objectId}" class="revist rev-${rev.color}" onclick="get_description(this) ">
        <div class="tit-igreja">IGREJA</div>
        <div class="tit-luterana">LUTERANA</div>
        <div class="ano-edit">
            <span>${rev.ano}</span><br>
            <span>Edição ${rev.edicao == 2 ? "II" : "I"}</span>
        </div>
        </div>`
    }

    revist_list.innerHTML = lists_html
}
drawn_revist(array_revistas)

//!SECTION capitulos
const array_capitulos = [
    {
        "resvista_id": 1,
        "titulo": "Palavra ao Leitor",
        "descricao": "Apresentação da edição de 75 anos da revista Igreja Luterana.",
        "autor": "Gerson L. Linden",
        "palavras_chave": [
            "aniversário",
            "revista",
            "igreja luterana"
        ],
        "tipo": "palavras ao leitor"
    },
    {
        "resvista_id": 1,
        "titulo": "“Papai, os animais vão estar no céu?” A futura nova terra",
        "descricao": "Reflexão sobre a escatologia bíblica e a nova criação.",
        "autor": "Paul R. Raabe",
        "palavras_chave": [
            "escatologia",
            "nova criação",
            "céu"
        ],
        "tipo": "artigo"
    },
    {
        "resvista_id": 1,
        "titulo": "Os 500 anos do Novum Instrumentum de Erasmo",
        "descricao": "Comemoração dos 500 anos da edição do Novum Instrumentum de Erasmo.",
        "autor": "Vilson Scholz",
        "palavras_chave": [
            "erasmo",
            "novum instrumentum",
            "bíblia"
        ],
        "tipo": "artigo"
    },
    {
        "resvista_id": 1,
        "titulo": "A natureza passiva da Igreja - Uma análise do conceito de Igreja e suas implicações para a vida dos crentes",
        "descricao": "Análise do conceito de Igreja e suas implicações para a vida dos crentes.",
        "autor": "Timóteo Felipe Patrício",
        "palavras_chave": [
            "igreja",
            "natureza passiva",
            "crentes"
        ],
        "tipo": "artigo"
    },
    {
        "resvista_id": 1,
        "titulo": "Do que a Igreja Luterana jamais poderá abrir mão",
        "descricao": "Reflexão sobre os elementos fundamentais da teologia luterana.",
        "autor": "Jobst Schöne",
        "palavras_chave": [
            "igreja luterana",
            "teologia luterana",
            "confissão de fé"
        ],
        "tipo": "artigo"
    },
    {
        "resvista_id": 1,
        "titulo": "Homilética Luterana, Pregação Televisiva e o Artigo VII da Confissão de Augsburgo",
        "descricao": "Análise da homilética luterana e sua relação com a pregação televisiva.",
        "autor": "Lucas André Albrecht",
        "palavras_chave": [
            "homilética luterana",
            "pregação televisiva",
            "confissão de augsburgo"
        ],
        "tipo": "artigo"
    },
    {
        "resvista_id": 1,
        "titulo": "Auxílios Homiléticos: Publicações de 1990 a 2014",
        "descricao": "Mapa dos auxílios homiléticos publicados pela revista Igreja Luterana de 1990 a 2014.",
        "autor": null,
        "palavras_chave": [
            "auxílios homiléticos",
            "igreja luterana",
            "pregação"
        ],
        "tipo": "auxílios homiléticos"
    },
    {
        "resvista_id": 1,
        "titulo": "Resenhas",
        "descricao": "Resenhas de livros publicados sobre temas relacionados à teologia luterana.",
        "autor": null,
        "palavras_chave": [
            "resenhas",
            "livros",
            "teologia luterana"
        ],
        "tipo": "resenhas"
    },
    {
        "resvista_id": 1,
        "titulo": "Sem mim vocês não podem fazer nada!",
        "descricao": "Reflexão sobre a necessidade de permanecer em Cristo.",
        "autor": "Vilson Scholz",
        "palavras_chave": [
            "permanecer em Cristo",
            "videira",
            "ramos"
        ],
        "tipo": "devocional"
    },
    {
        "resvista_id": 1,
        "titulo": "Os verdadeiros adoradores",
        "descricao": "Reflexão sobre a adoração a Deus.",
        "autor": "Leonerio Faller",
        "palavras_chave": [
            "adoração",
            "Deus",
            "espírito e verdade"
        ],
        "tipo": "devocional"
    },
    {
        "resvista_id": 1,
        "titulo": "Ele vigia! Vocês estagiam!",
        "descricao": "Reflexão sobre a vigilância de Deus e a nossa responsabilidade.",
        "autor": "Rony Marquardt",
        "palavras_chave": [
            "vigilância",
            "responsabilidade",
            "Deus"
        ],
        "tipo": "devocional"
    },
    {
        "resvista_id": 2,
        "titulo": "Um breve panorama do Luteranismo ao redor do mundo no 500º aniversário da Reforma",
        "descricao": "Este artigo apresenta um breve panorama do luteranismo ao redor do mundo no 500º aniversário da Reforma.",
        "autor": "Albert Collver",
        "palavras_chave": [
            "luteranismo",
            "reforma",
            "igreja"
        ],
        "tipo": "artigo"
    },
    {
        "resvista_id": 2,
        "titulo": "Moldando o luteranismo confessional para o século XXI: o impacto da Reforma Luterana na missão, culto e cosmovisão",
        "descricao": "Este artigo discute o impacto da Reforma Luterana na missão, culto e cosmovisão.",
        "autor": "Gerson L. Linden",
        "palavras_chave": [
            "reforma luterana",
            "missão",
            "culto",
            "cosmovisão"
        ],
        "tipo": "palestra"
    },
    {
        "resvista_id": 2,
        "titulo": "O impacto da Reforma Luterana no culto",
        "descricao": "Este artigo discute o impacto da Reforma Luterana no culto.",
        "autor": "Acir Raymann",
        "palavras_chave": [
            "reforma luterana",
            "culto"
        ],
        "tipo": "palestra"
    },
    {
        "resvista_id": 2,
        "titulo": "O impacto da Reforma Luterana no culto",
        "descricao": "Este artigo discute o impacto da Reforma Luterana no culto.",
        "autor": "Lucas Albrecht",
        "palavras_chave": [
            "reforma luterana",
            "culto"
        ],
        "tipo": "palestra"
    },
    {
        "resvista_id": 2,
        "titulo": "O impacto luterano na missão",
        "descricao": "Este artigo discute o impacto luterano na missão.",
        "autor": "Paulo W. Buss",
        "palavras_chave": [
            "luteranismo",
            "missão"
        ],
        "tipo": "palestra"
    },
    {
        "resvista_id": 2,
        "titulo": "Caracterizando o luteranismo confessional",
        "descricao": "Este artigo caracteriza o luteranismo confessional.",
        "autor": "Raul Blum",
        "palavras_chave": [
            "luteranismo",
            "confessional"
        ],
        "tipo": "palestra"
    },
    {
        "resvista_id": 2,
        "titulo": "Sermão",
        "descricao": "Este é um sermão sobre João 8.31-32.",
        "autor": "Clóvis J. Prunzel",
        "palavras_chave": [
            "sermão",
            "João 8.31-32"
        ],
        "tipo": "sermão"
    },
    {
        "resvista_id": 2,
        "titulo": "Palavras ao leitor",
        "descricao": "Esta é uma mensagem de boas-vindas aos leitores da revista.",
        "autor": "Gerson L. Linden",
        "palavras_chave": [
            "boas-vindas",
            "leitores"
        ],
        "tipo": "palavras ao leitor"
    },
    {
        "resvista_id": 3,
        "titulo": "Conhecer Cristo e seus benefícios",
        "descricao": "Este artigo discute a importância de conhecer a Cristo e os benefícios que isso traz para a vida do cristão. O artigo também aborda a importância de contar histórias como uma ferramenta para ensinar os alunos sobre a fé cristã.",
        "autor": "Clécio Leocir Schadech",
        "palavras_chave": "Cristo, benefícios, fé cristã, contar histórias",
        "tipo": "artigo"
    },
    {
        "resvista_id": 3,
        "titulo": "O impacto da Reforma Luterana sobre a exegese bíblica",
        "descricao": "Este artigo discute o impacto da Reforma Luterana sobre a exegese bíblica. O artigo aborda como os reformadores mudaram a maneira como a Bíblia era interpretada e como isso afetou a maneira como os cristãos entendem a Bíblia hoje.",
        "autor": "Vilson Scholz",
        "palavras_chave": "Reforma Luterana, exegese bíblica, interpretação bíblica, cristãos",
        "tipo": "artigo"
    },
    {
        "resvista_id": 3,
        "titulo": "Sola Veritas, Sola Caritas, Sola Humilitas",
        "descricao": "Este artigo discute os três pilares da Reforma Luterana: Sola Veritas (somente a verdade), Sola Caritas (somente o amor) e Sola Humilitas (somente a humildade). O artigo aborda como esses pilares moldaram a teologia luterana e como eles continuam a ser relevantes para os cristãos hoje.",
        "autor": "Paulo M. Nerbas",
        "palavras_chave": "Sola Veritas, Sola Caritas, Sola Humilitas, Reforma Luterana",
        "tipo": "artigo"
    },
    {
        "resvista_id": 3,
        "titulo": "Lutero, história e historiografia",
        "descricao": "Este artigo discute a vida e a obra de Martinho Lutero, o reformador protestante. O artigo também aborda a historiografia luterana, ou seja, a maneira como a história de Lutero e da Reforma Luterana tem sido escrita e interpretada ao longo dos séculos.",
        "autor": "Paulo Wille Buss",
        "palavras_chave": "Lutero, Reforma Luterana, historiografia, história",
        "tipo": "artigo"
    },
    {
        "resvista_id": 3,
        "titulo": "A Educação Cristã e os desafios do ensino para a vida do cristão",
        "descricao": "Este artigo discute a importância da educação cristã e os desafios que os professores enfrentam ao ensinar os alunos sobre a vida cristã. O artigo também aborda a importância de contar histórias como uma ferramenta para ensinar os alunos sobre a fé cristã.",
        "autor": "Anselmo Ernesto Graff",
        "palavras_chave": "educação cristã, desafios do ensino, vida cristã, contar histórias",
        "tipo": "artigo"
    },
    {
        "resvista_id": 3,
        "titulo": "Ofício do ministério e a ordenação",
        "descricao": "Este artigo discute o ofício do ministério e a ordenação na Igreja Luterana. O artigo aborda as diferentes funções do ministério e os requisitos para a ordenação.",
        "autor": "Gerson L. Linden",
        "palavras_chave": "ofício do ministério, ordenação, Igreja Luterana",
        "tipo": "artigo"
    },
    {
        "resvista_id": 3,
        "titulo": "Lutero e Calvino no Jardim do Éden",
        "descricao": "Este artigo discute as diferentes visões de Martinho Lutero e João Calvino sobre o Jardim do Éden. O artigo aborda como os dois reformadores interpretaram a história do Jardim do Éden e como isso afetou suas teologias.",
        "autor": "Enio Sieves",
        "palavras_chave": "Lutero, Calvino, Jardim do Éden, teologia",
        "tipo": "artigo"
    },
    {
        "resvista_id": 3,
        "titulo": "Educando para a missão segundo Lutero",
        "descricao": "Este artigo discute a visão de Martinho Lutero sobre a missão da Igreja. O artigo aborda como Lutero entendia a missão da Igreja e como ele acreditava que a Igreja deveria se envolver na missão.",
        "autor": "Leonerio Faller",
        "palavras_chave": "Lutero, missão da Igreja, teologia da missão",
        "tipo": "artigo"
    },
    {
        "resvista_id": 3,
        "titulo": "João 8.32 – “A verdade vos libertará!”",
        "descricao": "Este sermão explora o significado da frase de Jesus em João 8.32: “A verdade vos libertará!”. O sermão aborda como a verdade de Jesus liberta as pessoas da escravidão do pecado e da morte.",
        "autor": "Rony R. Marquardt",
        "palavras_chave": "verdade, liberdade, Jesus, pecado",
        "tipo": "sermão"
    },
    {
        "resvista_id": 3,
        "titulo": "Salmo 118.17",
        "descricao": "Este sermão explora o significado do Salmo 118.17: “Não morrerei, mas viverei, e contarei as obras do Senhor”. O sermão aborda como o salmista expressa sua confiança em Deus e sua esperança na vida eterna.",
        "autor": "Leonerio Faller",
        "palavras_chave": "vida eterna, confiança em Deus, esperança",
        "tipo": "sermão"
    },
    {
        "resvista_id": 4,
        "titulo": "A importância da confissão e Absolvição individual no Aconselhamento pastoral",
        "descricao": "Este artigo discute a importância da confissão e absolvição individual no aconselhamento pastoral. O autor argumenta que a confissão e absolvição são ferramentas essenciais para ajudar os indivíduos a lidar com o pecado e a culpa, e que podem ser usadas para promover o crescimento espiritual e a cura.",
        "autor": "Edgar Lemke",
        "palavras_chave": "confissão, absolvição, aconselhamento pastoral, pecado, culpa, crescimento espiritual, cura",
        "tipo": "artigo"
    },
    {
        "resvista_id": 4,
        "titulo": "O pastor e a prática da disciplina eclesiástica",
        "descricao": "Este artigo discute o papel do pastor na prática da disciplina eclesiástica. O autor argumenta que a disciplina eclesiástica é uma ferramenta importante para manter a ordem e a pureza da igreja, e que deve ser usada com amor e compaixão.",
        "autor": "Gerson L. Linden",
        "palavras_chave": "disciplina eclesiástica, pastor, igreja, ordem, pureza, amor, compaixão",
        "tipo": "artigo"
    },
    {
        "resvista_id": 4,
        "titulo": "A participação da criança no culto público",
        "descricao": "Este artigo discute a importância da participação da criança no culto público. O autor argumenta que o culto público é um lugar importante para as crianças aprenderem sobre Deus e a fé cristã, e que pode ser uma experiência significativa para elas.",
        "autor": "João Mohana",
        "palavras_chave": "criança, culto público, Deus, fé cristã, experiência significativa",
        "tipo": "artigo"
    },
    {
        "resvista_id": 4,
        "titulo": "Vou viver e anunciar o que o Senhor tem feito – no lugar onde fui colocado por Deus",
        "descricao": "Este sermão discute a importância de viver e anunciar o que o Senhor tem feito, no lugar onde fomos colocados por Deus. O autor argumenta que Deus nos chama para viver e anunciar o evangelho em todos os lugares, e que devemos fazer isso com alegria e gratidão.",
        "autor": "Leonerio Faller",
        "palavras_chave": "evangelho, alegria, gratidão, lugar, Deus",
        "tipo": "sermão"
    },
    {
        "resvista_id": 5,
        "titulo": "Igreja e “pós-modernidade”: na criação e preservação do mundo",
        "descricao": "Este capítulo explora a relação entre a Igreja e a pós-modernidade, focando na criação e preservação do mundo. Ele discute a narrativa bíblica da criação como uma resposta a mitos antigos e como uma forma de proteger o povo de Deus de influências sincretistas.",
        "autor": "Acir Raymann",
        "palavras_chave": [
            "criação",
            "pós-modernidade",
            "Igreja",
            "mito",
            "sincretismo"
        ],
        "tipo": "artigo"
    },
    {
        "resvista_id": 5,
        "titulo": "A vida cristã: uma abordagem a partir da graça do Pai",
        "descricao": "Este capítulo analisa a vida cristã a partir da perspectiva da graça de Deus. Ele argumenta que a justificação pela fé é a base para a vida santificada e que a Lei serve como um guia para o comportamento cristão.",
        "autor": "Anselmo Graff",
        "palavras_chave": [
            "vida cristã",
            "graça",
            "justificação",
            "santificação",
            "Lei"
        ],
        "tipo": "artigo"
    },
    {
        "resvista_id": 5,
        "titulo": "Cem anos de rito batismal em português na IELB",
        "descricao": "Este capítulo examina a história do rito batismal em português na Igreja Evangélica Luterana do Brasil (IELB). Ele traça o desenvolvimento do rito desde o século XIX até os dias atuais.",
        "autor": "Raul Blum",
        "palavras_chave": [
            "batismo",
            "IELB",
            "rito",
            "história"
        ],
        "tipo": "artigo"
    },
    {
        "resvista_id": 5,
        "titulo": "Uma refeição nos traz satisfação – (João 6.27)",
        "descricao": "Este capítulo analisa a passagem bíblica de João 6.27, que fala sobre a importância da fé em Jesus Cristo para a vida eterna.",
        "autor": "Raul Blum",
        "palavras_chave": [
            "fé",
            "Jesus Cristo",
            "vida eterna"
        ],
        "tipo": "sermão"
    },
    {
        "resvista_id": 5,
        "titulo": "Salmo 43 [e 42]",
        "descricao": "Este capítulo analisa o Salmo 43, que fala sobre a confiança em Deus em meio às dificuldades.",
        "autor": "Laerte Tardelli Voss",
        "palavras_chave": [
            "confiança",
            "Deus",
            "dificuldades"
        ],
        "tipo": "sermão"
    },
    {
        "resvista_id": 5,
        "titulo": "Palavra ao leitor",
        "descricao": "Este texto apresenta uma breve introdução à revista, destacando os temas dos artigos e sermões.",
        "autor": "Gerson Luis Linden",
        "palavras_chave": [
            "introdução",
            "revista",
            "artigos",
            "sermões"
        ],
        "tipo": "palavras ao leitor"
    },
    {
        "resvista_id": 6,
        "titulo": "Palavra ao Leitor",
        "descricao": "Este texto reflete sobre a importância da leitura e da reflexão teológica, destacando a necessidade de se aprofundar no estudo das Escrituras Sagradas.",
        "autor": "Anselmo Ernesto Graff",
        "palavras_chave": [
            "Leitura",
            "Reflexão",
            "Teologia",
            "Escrituras Sagradas"
        ],
        "tipo": "Palavra ao Leitor"
    },
    {
        "resvista_id": 6,
        "titulo": "A morte expiatória de Cristo no evangelho de João",
        "descricao": "Este artigo discute a morte expiatória de Cristo no evangelho de João, argumentando que ela é essencial para a compreensão da mensagem do evangelho e que é um ato de expiação pelos pecados da humanidade.",
        "autor": "Francis Hoffmann",
        "palavras_chave": [
            "Expiação",
            "Morte",
            "Ressurreição",
            "Paixão de Cristo"
        ],
        "tipo": "Artigo"
    },
    {
        "resvista_id": 6,
        "titulo": "A antropologia à luz da vocação e da ética",
        "descricao": "Este artigo explora a antropologia à luz da vocação e da ética cristã, argumentando que a vocação e a ética cristã estão intimamente ligadas à criação do ser humano e ao seu relacionamento com Deus.",
        "autor": "Gabriel Schmidt Sonntag",
        "palavras_chave": [
            "Antropologia",
            "Vocação",
            "Ética"
        ],
        "tipo": "Artigo"
    },
    {
        "resvista_id": 6,
        "titulo": "Martinho Lutero e a composição de hinos: processos e características",
        "descricao": "Este artigo examina os processos e características da composição de hinos de Martinho Lutero, argumentando que os hinos de Lutero são uma expressão importante de sua teologia e de sua visão da Igreja.",
        "autor": "Ábner Elpino-Campos",
        "palavras_chave": [
            "Martinho Lutero",
            "Hinos",
            "Teologia"
        ],
        "tipo": "Artigo"
    },
    {
        "resvista_id": 6,
        "titulo": "Missão e cultura na Igreja primitiva e hoje",
        "descricao": "Este artigo discute a relação entre missão e cultura na Igreja primitiva e hoje, argumentando que a Igreja deve estar atenta à cultura em que está inserida e que a missão deve ser contextualizada.",
        "autor": "Joel C. Elowsky",
        "palavras_chave": [
            "Missão",
            "Cultura",
            "Igreja Primitiva"
        ],
        "tipo": "Artigo"
    },
    {
        "resvista_id": 7,
        "titulo": "Palavra ao leitor – Aptos para ensinar pregando e pregar ensinando",
        "descricao": "Reflexão sobre a importância do ensino e da pregação na Igreja Luterana.",
        "autor": "Anselmo Ernesto Graff",
        "palavras_chave": "Ensino, Pregação, Igreja Luterana",
        "tipo": "Palavras ao leitor"
    },
    {
        "resvista_id": 7,
        "titulo": "Didática metodológica comportamentalista e cognitivista: um estudo comparativo com vistas à aplicação no ensino catequético da Igreja Evangélica Luterana do Brasil",
        "descricao": "Análise comparativa entre as metodologias comportamentalista e cognitivista no ensino catequético, com foco na IELB.",
        "autor": "Daison Mülling Neutzling e Anselmo Ernesto Graff",
        "palavras_chave": "Metodologia, Ensino Catequético, Comparativo",
        "tipo": "Artigo"
    },
    {
        "resvista_id": 7,
        "titulo": "O ensino confirmatório na IELB e a “melhor idade” para seu desenvolvimento: um estudo em Jean Piaget",
        "descricao": "Estudo sobre a idade ideal para o ensino confirmatório na IELB baseado nas teorias de Jean Piaget.",
        "autor": "George Carlos Felten e Anselmo Ernesto Graff",
        "palavras_chave": "Ensino Confirmatório, Desenvolvimento Cognitivo, Jean Piaget",
        "tipo": "Artigo"
    },
    {
        "resvista_id": 7,
        "titulo": "Pregar de ouvido: é possível?",
        "descricao": "Reflexão sobre a pregação sem manuscrito pré-definido e a necessidade de preparo e confiança.",
        "autor": "Vilson Scholz",
        "palavras_chave": "Pregação, Oralidade, Confiança",
        "tipo": "Artigo"
    },
    {
        "resvista_id": 7,
        "titulo": "A tecelagem da pregação",
        "descricao": "Tradução de um artigo sobre a arte da pregação.",
        "autor": "David Schmitt (tradução – Vilson Scholz)",
        "palavras_chave": "Pregação, Arte, Tradução",
        "tipo": "Tradução"
    }
]

/*  */
const description_content = document.getElementById("cap_description")


function filtrar(resvista_id) {
    let filtrado = array_capitulos.filter(function (obj) { return obj.resvista_id == resvista_id; });
    return filtrado
}

function get_description(element) {
    desc_html = ""
    //FIXME - Corrigir nomes estranho das variaveis
    let capitulos = filtrar(element.id)
    let tipos = capitulos.map(item => item.tipo).filter((value, index, self) => self.indexOf(value) === index)

    for (const t of tipos) {
        let tipo = capitulos.filter(function (obj) { return obj.tipo == t; });
        desc_html += `<h2>${t}</h2>`
        for (const tp of tipo) {
            desc_html += `<div>
                <p>${tp.titulo}</p>
                <i>${tp.autor}</i>
            </div>`
        }
    }
    description_content.innerHTML = desc_html
    document.querySelector(".titulo-edit-ano").style.backgroundColor = `${element.dataset.color}`
    document.getElementById("ano-edicao").innerText = `${element.dataset.ano} EDIÇÃO ${element.dataset.edicao}`
    document.getElementById("op-new").href = element.dataset.url
}

//!SECTION sistema de filtragem de revistas
function filter_revist() {
    const tema = document.getElementById("key-word").value
    const autor = document.getElementById("autor").value

    let filtrado = array_capitulos.filter(function (obj) {
        if(autor && tema){ 
            return (JSON.stringify(obj.palavras_chave).includes(tema) && obj.autor.includes(autor))
        }else{
            
            if (tema){
                return JSON.stringify(obj.palavras_chave).includes(tema)}
            if (autor){
                return obj.autor && obj.autor.includes(autor)}
        }
    });

    let ids_revist = filtrado.map(item => String(item.resvista_id)).filter((value, index, self) => self.indexOf(value) === index)

    let final_revist = array_revistas.filter(function (obj) { return ids_revist.includes(obj.objectId); });



    drawn_revist(final_revist)
}