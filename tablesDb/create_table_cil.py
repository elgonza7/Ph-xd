from dataBase.db import conectar_bd

def create_table_cil():
    conn = conectar_bd()

    with conn:
        with conn.cursor() as cur:
            #cur.execute("DROP TABLE IF EXISTS cil;")  # Elimina la tabla si ya existe
            cur.execute("""
                CREATE TABLE IF NOT EXISTS cil (
                    id SERIAL PRIMARY KEY,
                    fecha DATE,
                    turno VARCHAR(20),
                    ph REAL,
                    cnlibre INTEGER,
                    solidos INTEGER,
                    caudal INTEGER,
                    oxigenodisuelto REAL,
                    leycola REAL
                );
            """)

    conn.close()
    print("Tabla creada correctamente")