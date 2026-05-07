import psycopg

def conectar_bd():
    conn = psycopg.connect(
        dbname="postgres",      
        user="postgres",
        password="123",
        host="localhost",
        port="5433"
    )

    return conn