
from tablesDb.create_table_cil import create_table_cil
from tablesDb.ingresar_datos_tabla_cil import insertar_datos_manual, eliminar_datos
from tablesDb.mostrar_tablas import mostrar_tablas

if __name__ == "__main__":
    create_table_cil()
    #insertar_datos_manual('2026-04-01', 'Dia', 10.8, 240, 45, 76, 7.5, 0.18)
    #insertar_datos_manual('2026-04-01', 'Dia', 12.8, 240, 45, 76, 7.5, 0.18)
    mostrar_tablas()
    #eliminar_datos()
    #mostrar_tablas()