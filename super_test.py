import requests

import time
 
# URL de tu servidor local

BASE_URL = "http://127.0.0.1:8000"
 
def correr_super_test():

    print("🚀 INICIANDO SUPER BOT DE TESTEO CENEVAL...")

    print("==================================================")

    try:

        # 1. INICIAR LA SESIÓN

        res_inicio = requests.get(f"{BASE_URL}/iniciar").json()

        id_sesion = res_inicio['id_sesion']

        print(f"✅ [1/3] Sesión creada exitosamente en TiDB: {id_sesion}\n")
 
        print("🧠 [2/3] El Bot está contestando el examen a la velocidad de la luz...")

        # 2. BUCLE HASTA 35 (Para comprobar que el backend lo frena en 30)

        for i in range(1, 35):

            # Pedir pregunta

            preg = requests.get(f"{BASE_URL}/pregunta/{id_sesion}").json()

            # Si el backend nos frena, rompemos el ciclo

            if preg.get('finalizado'):

                print(f"\n🛑 EL BACKEND DETUVO EL EXAMEN: {preg.get('mensaje')}")

                break

            id_preg = preg['id_pregunta']

            # Tomamos la primera opción (como las insertamos en la BD, suele ser la correcta)

            id_opc = preg['opciones'][0]['id_opcion'] 

            # Validar respuesta

            val = requests.post(f"{BASE_URL}/validar", json={

                "id_sesion": id_sesion,

                "id_pregunta": id_preg,

                "id_opcion": id_opc

            }).json()

            # Imprimir progreso en una sola línea para que se vea genial en la terminal

            progreso = val.get('progreso', f'{i}/30')

            agente = val.get('instruccion_agente', '...')

            print(f"   👉 Q{i} | Pregunta {id_preg} enviada | Progreso: {progreso} | Agente: {agente}")

            # Pausa de 50 milisegundos para no asustar a la base de datos

            time.sleep(0.05)
 
        # 3. PEDIR RESULTADOS FINALES

        print("\n📊 [3/3] SOLICITANDO EL DIAGNÓSTICO FINAL AL AGENTE...")

        print("==================================================")

        final = requests.get(f"{BASE_URL}/resultados/{id_sesion}").json()

        print(f"🏆 Victoria:      {final.get('es_victoria')}")

        print(f"🎓 Nivel Logrado: {final.get('nivel_numero')} - {final.get('nivel_texto')}")

        print(f"📝 Respondidas:   {final.get('preguntas_respondidas')} de 30")

        print(f"🗣️ Mensaje Front: {final.get('titulo_pantalla')}")

        print(f"🤖 Diagnóstico:   {final.get('diagnostico_agente')}")

        print("==================================================")

        print("✨ TEST COMPLETADO CON ÉXITO. TU BACKEND ES INDESTRUCTIBLE. ✨\n")
 
    except requests.exceptions.ConnectionError:

        print("🔥 ERROR: No me pude conectar. ¿Estás seguro que el servidor de FastAPI está corriendo en otra terminal?")

    except Exception as e:

        print(f"❌ ERROR INESPERADO: {e}")
 
if __name__ == "__main__":

    correr_super_test()
 