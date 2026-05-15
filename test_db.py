import mysql.connector

config = {
    'user': '3hiKVUYRSp2HiXs.root',       # Ej: 2a4b8...root
    'password': 'VdGV8HGtuUJbE9bY',  # La contraseña que generaste
    'host': 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    'port': 4000,
    'database': 'test',
    'ssl_ca': 'isrgrootx1.pem'
}

try:
    print("Intentando conectar a TiDB...")
    conn = mysql.connector.connect(**config)
    if conn.is_connected():
        print("¡CONEXIÓN EXITOSA! El equipo ya está en la nube.")
        cursor = conn.cursor()
        cursor.execute("SELECT DATABASE();")
        record = cursor.fetchone()
        print(f"Estás conectado a la base de datos: {record}")
        conn.close()
except Exception as e:
    print(f"Error fatal: {e}")