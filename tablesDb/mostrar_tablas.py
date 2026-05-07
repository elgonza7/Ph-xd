from dataBase.db import conectar_bd

def mostrar_tablas():
    conn = conectar_bd()

    with conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM cil;")
            rows = cur.fetchall()
            for row in rows:
                print("Fecha:", row[1])
                print("Turno:", row[2])
                print("pH:", row[3])
                print("CN libre:", row[4])
                print("Sólidos:", row[5])
                print("Caudal:", row[6])
                print("Oxígeno disuelto:", row[7])
                print("Ley de cola:", row[8])
                print("-" * 50)

    conn.close()