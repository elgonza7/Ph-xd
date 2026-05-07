from dataBase.db import conectar_bd

def insertar_datos_manual(fecha, turno, ph, cnlibre, solidos, caudal, oxigenodisuelto, leycola):
    conn = conectar_bd()

    with conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO cil (fecha, turno, ph, cnlibre, solidos, caudal, oxigenodisuelto, leycola)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                """,
                (fecha, turno, ph, cnlibre, solidos, caudal, oxigenodisuelto, leycola)
            )

    conn.close()


def eliminar_datos():
    conn = conectar_bd()

    with conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM cil;")

    conn.close()
