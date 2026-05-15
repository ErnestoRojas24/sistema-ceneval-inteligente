import pymysql

config = {
    'user': '3hiKVUYRSp2HiXs.root',
    'password': 'VdGV8HGtuUJbE9bY',
    'host': 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    'port': 4000,
    'database': 'test',
    'ssl': {'ca': 'isrgrootx1.pem'}
}

try:
    print("Intentando conectar a TiDB...")
    conn = pymysql.connect(**config)
    print("¡CONEXIÓN EXITOSA!")
    cursor = conn.cursor()
    cursor.execute("SELECT DATABASE();")
    record = cursor.fetchone()
    print(f"Conectado a: {record}")
    conn.close()
except Exception as e:
    print(f"Error fatal: {e}")