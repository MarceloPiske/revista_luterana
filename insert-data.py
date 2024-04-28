import json
import requests


def create_revista(data):
    headers = {
        'accept': 'application/json',
        'X-Parse-Application-Id': 'VHySbL53fMja3ObvaU7YoeQIF19FJoTq3R4xow1K',
        'X-Parse-REST-API-Key': 'UyYuGi0hQrh5hIdflYK3igOkpPAW6zXwzSHjhDh5',
        'Content-Type': 'application/json',
    }

    json_data = data

    response = requests.post(
        'https://parseapi.back4app.com/classes/revista', headers=headers, json=json_data)
    return response.json()


def create_capitulo(data):
    headers = {
        'accept': 'application/json',
        'X-Parse-Application-Id': 'VHySbL53fMja3ObvaU7YoeQIF19FJoTq3R4xow1K',
        'X-Parse-REST-API-Key': 'UyYuGi0hQrh5hIdflYK3igOkpPAW6zXwzSHjhDh5',
        'Content-Type': 'application/json',
    }

    json_data = data

    response = requests.post(
        'https://parseapi.back4app.com/classes/capitulo', headers=headers, json=json_data)
    return response.json()


with open('file.json', 'r', encoding='utf-8') as arquivo:
    dados = json.load(arquivo)

for i in dados:
    print(i["ano"])
    data_revista = {"ano": int(i["ano"]), "edicao": int(i["edicao"])}
    ret = create_revista(data_revista)
    print(ret)
    resvista_id = ret["objectId"]
    palavras_chave = ""
    for cap in i["capitulos"]:

        if isinstance(cap["palavras_chave"], list):
            for p in cap["palavras_chave"]:
                palavras_chave += f"{p}, "
            palavras_chave = palavras_chave[0:-2]
        else:
            palavras_chave = cap["palavras_chave"]
        
        data_cap = {
            "resvista_id": resvista_id,
            "titulo": cap["capitulo"],
            "descricao": cap["descricao"],
            "autor": cap["autor"],
            "palavras_chave": palavras_chave,
            "tipo": cap["tipo"]
        }
        ret_cap = create_capitulo(data_cap)
        print(ret_cap)
