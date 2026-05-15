from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector

app = FastAPI()

# Configuración de CORS para que React (puerto 3000) pueda hablar con Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas las conexiones en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de tu base de datos TiDB con tus credenciales reales
config = {
    'user': '3hiKVUYRSp2HiXs.root',
    'password': 'VdGV8HGtuUJbE9bY',
    'host': 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    'port': 4000,
    'database': 'test',
    'ssl_ca': 'isrgrootx1.pem',
    'use_pure': True,
    'auth_plugin': 'mysql_native_password'
}

@app.get("/")
def read_root():
    return {"mensaje": "¡Motor de Inferencia CENEVAL Activo!", "estado": "Conectado a TiDB"}

@app.get("/preguntas")
def obtener_pregunta(tema: int = 1, dificultad: int = 1):
    conn = None
    try:
        # 1. Intentar la conexión
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor(dictionary=True)

        # 2. Buscar la pregunta según tema y dificultad
        query = """
            SELECT id_pregunta, contexto, pregunta_texto 
            FROM Preguntas 
            WHERE id_tema = %s AND nivel_dificultad = %s 
            ORDER BY RAND() 
            LIMIT 1
        """
        cursor.execute(query, (tema, dificultad))
        pregunta = cursor.fetchone()

        if not pregunta:
            return {"mensaje": "No se encontraron preguntas. Verifica que insertaste datos en las tablas."}

        # 3. Buscar las opciones de esa pregunta
        query_opciones = """
            SELECT id_opcion, texto_opcion 
            FROM Opciones 
            WHERE id_pregunta = %s
        """
        cursor.execute(query_opciones, (pregunta['id_pregunta'],))
        opciones = cursor.fetchall()

        pregunta['opciones'] = opciones

        cursor.close()
        return pregunta

    except mysql.connector.Error as err:
        print(f"Error detectado: {err}")
        raise HTTPException(status_code=500, detail=f"Error de conexión: {err}")
    
    finally:
        if conn and conn.is_connected():
            conn.close()