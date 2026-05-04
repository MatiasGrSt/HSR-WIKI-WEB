import os
import tkinter as tk
from tkinter import filedialog

def renombrar_archivos():
    """
    Renombra archivos en todas las carpetas y subcarpetas si coinciden con los casos del match.
    """
    try:
        root = tk.Tk()
        root.withdraw()

        directorio_base = "../../imagenes/personajes"

        print("Abriendo explorador... Selecciona la carpeta del personaje.")
        carpeta_personaje = filedialog.askdirectory(title="Selecciona la carpeta de un personaje", initialdir=directorio_base)

        if not carpeta_personaje:
            print("Operación cancelada.")
            return

        # 1. os.walk devuelve la ruta actual, carpetas y archivos. 
        for ruta_actual, _, archivos in os.walk(carpeta_personaje):
            
            # 2. Iteramos sobre los archivos que hay dentro de la ruta actual
            for archivo in archivos:
                
                # Evaluamos el nombre del archivo exacto
                match archivo:
                    case 'b.webp':
                        nuevo_nombre_base = 'Ataque_Básico'
                    case 'h.webp':
                        nuevo_nombre_base = 'Habilidad_Básica'
                    case 'u.webp':
                        nuevo_nombre_base = 'Definitiva'
                    case 'te.webp':
                        nuevo_nombre_base = 'Tácnica'
                    case 'ta.webp':
                        nuevo_nombre_base = 'Talento'

                    case 'p1.webp':
                        nuevo_nombre_base = 'Pasiva_1'
                    case 'p2.webp':
                        nuevo_nombre_base = 'Pasiva_2'
                    case 'p3.webp':
                        nuevo_nombre_base = 'Pasiva_3'

                    case 'e.webp':
                        nuevo_nombre_base = 'Habilidad_de_Exultación'

                    case 'mta.webp':
                        nuevo_nombre_base = 'Talento_del_Mnemoduende'
                    case 'mha.webp':
                        nuevo_nombre_base = 'Habilidad_del_Mnemoduende'

                    case '1.webp':
                        nuevo_nombre_base = 'Eidolon_1'
                    case '2.webp':
                        nuevo_nombre_base = 'Eidolon_2'
                    case '3.webp':
                        nuevo_nombre_base = 'Eidolon_3'
                    case '4.webp':
                        nuevo_nombre_base = 'Eidolon_4'
                    case '5.webp':
                        nuevo_nombre_base = 'Eidolon_5'
                    case '6.webp':
                        nuevo_nombre_base = 'Eidolon_6'

                    case 'c.webp':
                        nuevo_nombre_base = 'Cyrene_Card'

                    case 'i.webp':
                        nuevo_nombre_base = 'Introduction'
                    case 'p.webp':
                        nuevo_nombre_base = 'Portrait'
                    case 's.webp':
                        nuevo_nombre_base = 'Splash_Art'
                    case 'l.webp':
                        nuevo_nombre_base = 'Light_Cone'
                    case 't.webp':
                        nuevo_nombre_base = 'Phone'

                    case 'b2.webp':
                        nuevo_nombre_base = 'Ataque_Básico_2'
                    case 'b3.webp':
                        nuevo_nombre_base = 'Ataque_Básico_3'
                    case 'h2.webp':
                        nuevo_nombre_base = 'Habilidad_Básica_2'
                    case 'h3.webp':
                        nuevo_nombre_base = 'Habilidad_Básica_3'
                    case 'u2.webp':
                        nuevo_nombre_base = 'Definitiva_2'

                    
                    case _:
                        continue # Si no es ninguno de esos, pasa al siguiente archivo

                # Extraer la extensión (.webp)
                _, extension = os.path.splitext(archivo)
                
                # Armar el nuevo nombre completo
                nuevo_nombre = f"{nuevo_nombre_base}{extension}"
                
                # Crear las rutas absolutas para que os.rename sepa dónde están
                ruta_archivo = os.path.join(ruta_actual, archivo)
                ruta_nuevo_nombre = os.path.join(ruta_actual, nuevo_nombre)

                # Si por alguna razón el archivo ya se llama así, lo ignoramos
                if archivo == nuevo_nombre:
                    continue
                
                # Renombrar el archivo
                os.rename(ruta_archivo, ruta_nuevo_nombre)
                print(f"Archivo renombrado: {archivo} -> {nuevo_nombre}")

    except Exception as e:
        print(f"Error: {e}")

# Llamar a la función
if __name__ == "__main__":
    renombrar_archivos()