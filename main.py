from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pymysql
import pymysql.cursors
import uuid
 
app = FastAPI()
 
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
    puntaje_actual: int = 0
 
@app.get("/")
def read_root():
    return {"mensaje": "¡Motor CENEVAL Activo y Blindado!", "estado": "Conectado"}
 
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
        raise HTTPException(status_code=500, detail=str(err))
 
@app.get("/pregunta/{id_sesion}")
def obtener_pregunta_automatica(id_sesion: str):
    conn = None
    try:
        conn = pymysql.connect(**config)
        cursor = conn.cursor(pymysql.cursors.DictCursor)
 
        cursor.execute("SELECT * FROM Sesiones WHERE id_sesion = %s", (id_sesion,))
        sesion = cursor.fetchone()
 
        if not sesion or sesion['finalizado'] or sesion['total_preguntas'] >= 30:
            return {"finalizado": True, "mensaje": "Evaluación finalizada con éxito."}
 
        query_maestra = """
            SELECT id_pregunta, contexto, pregunta_texto, id_tema, nivel_dificultad
            FROM Preguntas
            WHERE id_pregunta NOT IN (
                SELECT id_pregunta FROM Historial_Preguntas WHERE id_sesion = %s
            )
            ORDER BY
                CASE
                    WHEN id_tema = %s AND nivel_dificultad = %s THEN 1
                    WHEN id_tema = %s THEN 2
                    ELSE 3
                END ASC,
                RAND()
            LIMIT 1
        """
        cursor.execute(query_maestra, (
            id_sesion,
            sesion['id_tema_actual'], sesion['dificultad_actual'],
            sesion['id_tema_actual']
        ))
        pregunta = cursor.fetchone()
 
        if not pregunta:
             return {"finalizado": True, "mensaje": "Se vació la bóveda de conocimiento."}
 
        # ¡LA SOLUCIÓN AL BUG DE LA DEGRADACIÓN!
        # Solo actualizamos el nivel si la pregunta es de un nivel SUPERIOR.
        # Si el fallback agarró una de repaso de nivel bajo, NO le bajamos el rango al alumno.
        if pregunta['id_tema'] > sesion['id_tema_actual']:
             cursor.execute("UPDATE Sesiones SET id_tema_actual = %s, dificultad_actual = 1 WHERE id_sesion = %s",
                            (pregunta['id_tema'], id_sesion))
             conn.commit()
 
        cursor.execute("SELECT id_opcion, texto_opcion FROM Opciones WHERE id_pregunta = %s", (pregunta['id_pregunta'],))
        pregunta['opciones'] = cursor.fetchall()
        pregunta['progreso'] = sesion['total_preguntas']
 
        cursor.close()
        conn.close()
        return pregunta
 
    except pymysql.Error as err:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(err))
 
@app.post("/validar")
def validar_y_avanzar(datos: RespuestaAlumno):
    conn = None
    try:
        conn = pymysql.connect(**config)
        cursor = conn.cursor(pymysql.cursors.DictCursor)
 
        cursor.execute("INSERT IGNORE INTO Historial_Preguntas (id_sesion, id_pregunta) VALUES (%s, %s)",
                       (datos.id_sesion, datos.id_pregunta))
 
        es_correcta = False
        retro = "¡Se agotó el tiempo de respuesta!"
        instruccion = "Siguiente pregunta"
 
        if datos.id_opcion != 0:
            cursor.execute("SELECT es_correcta, retroalimentacion FROM Opciones WHERE id_pregunta = %s AND id_opcion = %s",
                           (datos.id_pregunta, datos.id_opcion))
            resultado = cursor.fetchone()
            if resultado:
                es_correcta = bool(resultado['es_correcta'])
                retro = resultado['retroalimentacion']
 
        cursor.execute("SELECT * FROM Sesiones WHERE id_sesion = %s", (datos.id_sesion,))
        sesion = cursor.fetchone()
 
        nuevo_total = sesion['total_preguntas'] + 1
        nuevos_aciertos = sesion['aciertos_consecutivos'] + 1 if es_correcta else 0
        nueva_dificultad = sesion['dificultad_actual']
        nuevo_tema = sesion['id_tema_actual']
 
        if nuevos_aciertos >= 3:
            if nuevo_tema < 5:
                nuevo_tema += 1
                nueva_dificultad = 1
                nuevos_aciertos = 0
                instruccion = "¡Dominas el tema! Avanzando al siguiente nivel."
            else:
                if nueva_dificultad < 3: nueva_dificultad += 1
                nuevos_aciertos = 0
                instruccion = "¡Estás en el tope de conocimiento! Manteniendo nivel."
        elif not es_correcta and nueva_dificultad < 3:
            nueva_dificultad += 1
            instruccion = "Reforzando conocimiento: subiendo dificultad."
 
        cursor.execute("UPDATE Sesiones SET id_tema_actual = %s, dificultad_actual = %s, aciertos_consecutivos = %s, total_preguntas = %s, puntaje = %s WHERE id_sesion = %s",
                       (nuevo_tema, nueva_dificultad, nuevos_aciertos, nuevo_total, datos.puntaje_actual, datos.id_sesion))
        conn.commit()
        cursor.close()
        conn.close()
 
        return {"es_correcta": es_correcta, "retroalimentacion": retro, "instruccion_agente": instruccion, "progreso": f"{nuevo_total}/30"}
    except pymysql.Error as err:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(err))
 
@app.get("/resultados/{id_sesion}")
def obtener_resultados(id_sesion: str):
    conn = None
    try:
        conn = pymysql.connect(**config)
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT * FROM Sesiones WHERE id_sesion = %s", (id_sesion,))
        sesion = cursor.fetchone()
 
        if not sesion['finalizado']:
            cursor.execute("UPDATE Sesiones SET finalizado = TRUE WHERE id_sesion = %s", (id_sesion,))
            conn.commit()
 
        tema_alcanzado = sesion['id_tema_actual']
        preguntas_respondidas = sesion['total_preguntas']
 
        es_victoria = preguntas_respondidas >= 30
        titulo_pantalla = "¡Felicidades! Has completado la prueba CENEVAL" if es_victoria else "Evaluación Finalizada. Agotaste tus vidas."
 
        # NUEVO SISTEMA DE DIAGNÓSTICO PROFESIONAL CENEVAL
        nivel_texto = ""
        diagnostico = ""
 
        if tema_alcanzado >= 5:
            nivel_texto = "Sobresaliente (Experto)"
            diagnostico = "¡Impresionante! Demostraste un dominio absoluto en todas las áreas de Ingeniería (Infraestructura, Proyectos, BD y Programación). Estás más que listo para acreditar tu examen CENEVAL con honores."
        elif tema_alcanzado == 4:
            nivel_texto = "Satisfactorio (Avanzado)"
            diagnostico = "¡Muy buen desempeño! Tienes conocimientos sólidos y dominas la mayoría de los módulos. Te sugerimos dar un último repaso a Programación y Arquitectura para asegurar la excelencia."
        elif tema_alcanzado == 3:
            nivel_texto = "Suficiente (Intermedio)"
            diagnostico = "Aprobatorio, pero con áreas de oportunidad. Dominas las bases de redes y proyectos, pero necesitas reforzar fuertemente el modelado de Bases de Datos y Metodologías de Software."
        else:
            nivel_texto = "Aún No Satisfactorio (Básico)"
            diagnostico = "No lograste avanzar de los módulos iniciales. Es crítico que repases los fundamentos de tu carrera antes de presentar tu evaluación real."
 
        if not es_victoria:
            diagnostico += " (Nota: La evaluación se interrumpió porque agotaste tus vidas)."
 
        cursor.close()
        conn.close()
 
        puntaje = sesion.get('puntaje', 0)
        calificacion = min(10, puntaje // 300)

        return {
            "id_sesion": id_sesion,
            "preguntas_respondidas": preguntas_respondidas,
            "nivel_numero": min(tema_alcanzado, 5),
            "nivel_texto": nivel_texto,
            "diagnostico_agente": diagnostico,
            "titulo_pantalla": titulo_pantalla,
            "es_victoria": es_victoria,
            "puntaje": puntaje,
            "calificacion": calificacion
        }
    except pymysql.Error as err:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(err))