from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pymysql
import pymysql.cursors
import uuid

app = FastAPI()

@app.get("/")
def read_root():
    return {"mensaje": "Motor de Inferencia CENEVAL Activo", "estado": "Conectado a TiDB"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

config = {
    'user': '3hiKVUYRSp2HiXs.root',
    'password': 'VdGV8HGtuUJbE9bY',
    'host': 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    'port': 4000,
    'database': 'test',
    'ssl': {'ca': 'isrgrootx1.pem'}
}

class RespuestaAlumno(BaseModel):
    id_sesion: str
    id_pregunta: int
    id_opcion: int

# --- ENDPOINT 1: INICIAR SESIÓN ---
@app.get("/iniciar")
def iniciar_examen():
    id_sesion = str(uuid.uuid4())[:8]
    try:
        conn = pymysql.connect(**config)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Sesiones (id_sesion) VALUES (%s)", (id_sesion,))
        conn.commit()
        cursor.close()
        conn.close()
        return {"id_sesion": id_sesion, "mensaje": "Examen iniciado"}
    except pymysql.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al crear sesión: {err}")

# --- ENDPOINT 2: OBTENER PREGUNTA ---
@app.get("/pregunta/{id_sesion}")
def obtener_pregunta_automatica(id_sesion: str):
    conn = None
    try:
        conn = pymysql.connect(**config)
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        cursor.execute("SELECT * FROM Sesiones WHERE id_sesion = %s", (id_sesion,))
        sesion = cursor.fetchone()

        if not sesion or sesion['finalizado'] or sesion['total_preguntas'] >= 30:
            return {"finalizado": True, "mensaje": "Examen terminado. Revisa tus resultados."}

        cursor.execute("""
            SELECT id_pregunta, contexto, pregunta_texto 
            FROM Preguntas 
            WHERE id_tema = %s AND nivel_dificultad = %s 
            ORDER BY RAND() LIMIT 1
        """, (sesion['id_tema_actual'], sesion['dificultad_actual']))
        pregunta = cursor.fetchone()

        if not pregunta:
            return {"mensaje": "No hay más preguntas disponibles para este nivel."}

        cursor.execute("SELECT id_opcion, texto_opcion FROM Opciones WHERE id_pregunta = %s", (pregunta['id_pregunta'],))
        pregunta['opciones'] = cursor.fetchall()
        pregunta['progreso'] = sesion['total_preguntas']

        cursor.close()
        conn.close()
        return pregunta

    except pymysql.Error as err:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(err))

# --- ENDPOINT 3: VALIDAR Y AVANZAR ---
@app.post("/validar")
def validar_y_avanzar(datos: RespuestaAlumno):
    conn = None
    try:
        conn = pymysql.connect(**config)
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        cursor.execute("""
            SELECT es_correcta, retroalimentacion FROM Opciones 
            WHERE id_pregunta = %s AND id_opcion = %s
        """, (datos.id_pregunta, datos.id_opcion))
        resultado = cursor.fetchone()

        cursor.execute("SELECT * FROM Sesiones WHERE id_sesion = %s", (datos.id_sesion,))
        sesion = cursor.fetchone()

        nuevo_total = sesion['total_preguntas'] + 1
        nuevos_aciertos = sesion['aciertos_consecutivos'] + 1 if resultado['es_correcta'] else 0
        nueva_dificultad = sesion['dificultad_actual']
        nuevo_tema = sesion['id_tema_actual']
        instruccion = "Siguiente pregunta"

        if nuevos_aciertos >= 3:
            nuevo_tema += 1
            nueva_dificultad = 1
            nuevos_aciertos = 0
            instruccion = "¡Dominas el tema! Avanzando al siguiente nivel."
        elif not resultado['es_correcta'] and nueva_dificultad < 3:
            nueva_dificultad += 1
            instruccion = "Reforzando conocimiento: subiendo dificultad."

        cursor.execute("""
            UPDATE Sesiones SET 
            id_tema_actual = %s, dificultad_actual = %s, 
            aciertos_consecutivos = %s, total_preguntas = %s 
            WHERE id_sesion = %s
        """, (nuevo_tema, nueva_dificultad, nuevos_aciertos, nuevo_total, datos.id_sesion))
        conn.commit()

        cursor.close()
        conn.close()

        return {
            "es_correcta": bool(resultado['es_correcta']),
            "retroalimentacion": resultado['retroalimentacion'],
            "instruccion_agente": instruccion,
            "progreso": f"{nuevo_total}/30"
        }

    except pymysql.Error as err:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(err))
