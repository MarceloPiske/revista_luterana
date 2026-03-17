import json
import os
from datetime import datetime

# ==========================================
# CONFIGURAÇÕES DO SEU SITE
# ==========================================
# Substitua pelo domínio real do seu acervo
DOMINIO_BASE = "https://acervo-luterano.web.app" 

CAMINHO_JSON = "./file.json"
CAMINHO_SITEMAP = "./sitemap.xml"

def gerar_sitemap():
    print(f"Lendo o arquivo {CAMINHO_JSON}...")
    
    try:
        with open(CAMINHO_JSON, 'r', encoding='utf-8') as f:
            dados = json.load(f)
    except FileNotFoundError:
        print(f"Erro: O arquivo {CAMINHO_JSON} não foi encontrado.")
        return
    except json.JSONDecodeError:
        print("Erro: O arquivo JSON está mal formatado.")
        return

    # Cabeçalho padrão do Sitemap XML exigido pelo Google
    xml_content = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    # 1. Adicionar a Página Inicial (Home)
    # A home tem prioridade máxima (1.0)
    data_hoje = datetime.now().strftime("%Y-%m-%d")
    xml_content.append('  <url>')
    xml_content.append(f'    <loc>{DOMINIO_BASE}/</loc>')
    xml_content.append(f'    <lastmod>{data_hoje}</lastmod>')
    xml_content.append('    <changefreq>weekly</changefreq>')
    xml_content.append('    <priority>1.0</priority>')
    xml_content.append('  </url>')

    total_artigos = 0

    # 2. Percorrer as edições e extrair os IDs dos artigos
    for edicao in dados:
        artigos = edicao.get("artigos", [])
        for artigo in artigos:
            artigo_id = artigo.get("id")
            
            # Só adiciona ao sitemap se tiver um ID válido
            if artigo_id:
                # Construir a URL com o parâmetro
                url_artigo = f"{DOMINIO_BASE}/?artigo={artigo_id}"
                
                xml_content.append('  <url>')
                xml_content.append(f'    <loc>{url_artigo}</loc>')
                # Artigos antigos não mudam muito, prioridade 0.8 é excelente
                xml_content.append('    <changefreq>monthly</changefreq>')
                xml_content.append('    <priority>0.8</priority>')
                xml_content.append('  </url>')
                
                total_artigos += 1

    # Fechar a tag principal
    xml_content.append('</urlset>')

    # Salvar o arquivo sitemap.xml
    with open(CAMINHO_SITEMAP, 'w', encoding='utf-8') as f:
        f.write('\n'.join(xml_content))

    print(f"Sucesso! Sitemap gerado com {total_artigos} artigos.")
    print(f"Arquivo salvo em: {os.path.abspath(CAMINHO_SITEMAP)}")

if __name__ == "__main__":
    gerar_sitemap()