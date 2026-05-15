import requests

import time
 
BASE_URL = "http://127.0.0.1:8000"
 
print("🤖 Iniciando prueba de estrés del Motor CENEVAL...")

try:

    # 1. Iniciar Sesión

    res = requests.get(f"{BASE_URL}/iniciar").json()

    id_sesion = res['id_sesion']

    print(f"✅ Sesión creada: {id_sesion}")
 
    # 2. Ciclo de 32 preguntas (para forzar el límite de 30)

    for i in range(1, 33):

        print(f"--- Iteración {i} ---")

        # Pedir pregunta

        preg = requests.get(f"{BASE_URL}/pregunta/{id_sesion}").json()

        if 'finalizado' in preg:

            print(f"🏁 El backend detuvo el examen correctamente en la iteración {i}: {preg['mensaje']}")

            break

        if 'opciones' not in preg:

            print(f"❌ ERROR DEL BACKEND: La respuesta no tiene opciones. Datos recibidos: {preg}")

            break

        id_preg = preg['id_pregunta']

        id_opc = preg['opciones'][0]['id_opcion'] # Agarra la primera opción

        print(f"📥 Pregunta {id_preg} recibida. Enviando respuesta {id_opc}...")

        # Validar respuesta

        val = requests.post(f"{BASE_URL}/validar", json={

            "id_sesion": id_sesion,

            "id_pregunta": id_preg,

            "id_opcion": id_opc

        }).json()

        print(f"📤 Progreso según backend: {val.get('progreso')}")

        time.sleep(0.1) # Pausa pequeñita para no saturar TiDB
 
    # 3. Pedir resultados

    res_final = requests.get(f"{BASE_URL}/resultados/{id_sesion}").json()

    print(f"📊 Diagnóstico Final: {res_final['diagnostico_agente']}")
 
except Exception as e:

    print(f"🔥 ERROR FATAL EN EL SCRIPT: {e}")
 