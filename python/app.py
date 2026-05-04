import unicodedata
import re
import mysql.connector
import json

lista_tipos = ['Ataque Basico', 'Habilidad Basica', 'Definitiva', 'Talento', 'Tecnica', 'Habilidad Mnemoduende', 'Talento Mnemoduende', 'Habilidad Exultacion']
lista_targets = ['ATQ individual', 'Ráfaga', 'ATQ AdE', 'Alteracíon', 'Potenciación', 'Defensa', 'Rebote', 'Apoyo', 'Regeneración', 'Invocación']

def obtener_contexto(desc, stat_num):
    stat_str = f"{{stat_{stat_num}}}"
    pos = desc.find(stat_str)
    if pos != -1:
        # Sacamos 40 caracteres antes y 40 después para dar contexto
        inicio = max(0, pos - 40)
        fin = min(len(desc), pos + len(stat_str) + 40)
        fragmento = desc[inicio:fin]
        # Resaltamos el stat para que sea fácil de ver
        fragmento = fragmento.replace(stat_str, f">>> {stat_str} <<<")
        return f"...{fragmento}..."
    return "(Contexto no encontrado)"

def pedir_de_lista(lista_opciones, nombre_campo, permite_vacio=True):
    print(f"\n--- Selecciona {nombre_campo} ---")
    for i, opc in enumerate(lista_opciones, 1):
        print(f"{i}. {opc}")
    
    while True:
        sel = input(f"Elige una opción (1-{len(lista_opciones)}) [Enter para NULL]: ").strip()
        if not sel: return None
        if sel.isdigit() and 1 <= int(sel) <= len(lista_opciones):
            return lista_opciones[int(sel)-1]
        print("❌ Opción inválida.")

def pedir_binario(mensaje):
    while True:
        val = input(f"{mensaje} (0, 1 o Enter para NULL): ").strip()
        if not val: return None
        if val in ['0', '1']: return int(val)
        print("❌ Solo puedes ingresar 0 o 1.")

def a_nulo(valor):
    return valor if str(valor).strip() != "" else None

def seleccionar_personaje_db(cursor):
    # Buscamos todos los nombres ordenados alfabéticamente
    cursor.execute("SELECT name FROM characters ORDER BY name ASC")
    personajes = cursor.fetchall()
    
    if not personajes:
        print("\n❌ No hay personajes en la base de datos todavía.")
        return None
        
    print("\n=======================================")
    print("  PERSONAJES EN LA BASE DE DATOS")
    print("=======================================")
    
    # Imprimimos la lista numerada (en 2 o 3 columnas para que no sea larguísima)
    for i, pj in enumerate(personajes, start=1):
        print(f"{i:2d}. {pj[0]}")
        
    print("=======================================")
    
    while True:
        seleccion = input("Selecciona el número del personaje (o 'q' para cancelar): ").strip().lower()
        if seleccion == 'q':
            return None
            
        try:
            indice = int(seleccion) - 1
            # Comprobamos que el número exista en la lista
            if 0 <= indice < len(personajes):
                return personajes[indice][0] # Retornamos el nombre del personaje
            else:
                print("❌ Número fuera de rango.")
        except ValueError:
            print("❌ Por favor, ingresa un número válido.")

def buscarElementoVia(txt):
    regex_vias = {
            r'\bcacer[ií]a\b': 'Cacería', r'\babundancia\b': 'Abundancia',
            r'\bdestrucci[oó]n\b': 'Destrucción', r'\berudici[oó]n\b': 'Erudición',
            r'\bexultaci[oó]n\b': 'Exultación', r'\barmon[ií]a\b': 'Armonía',
            r'\bnihilidad\b': 'Nihilidad', r'\bconservaci[oó]n\b': 'Conservación',
            r'\breminiscencia\b': 'Reminiscencia'
        }
    regex_elementos = {
            r'\brayo\b': 'Rayo', r'\bf[ií]sico\b': 'Físico', r'\bhielo\b': 'Hielo',
            r'\bviento\b': 'Viento', r'\bfuego\b': 'Fuego', r'\bimaginario\b': 'Imaginario',
            r'\bc[uú]antico\b': 'Cuántico', r'\bq[uú]antico\b': 'Cuántico'
        }
    
    # CORRECCIÓN: Usamos una variable acumulativa para no perder los reemplazos anteriores
    resultado = txt
    for patron, correcta in regex_vias.items():
        resultado = re.sub(patron, f'<span class="path">{correcta}</span>', resultado, flags=re.IGNORECASE)
            
    for patron, correcta in regex_elementos.items():
        resultado = re.sub(patron, f'<span class="element">{correcta}</span>', resultado, flags=re.IGNORECASE)

    return resultado

def limpiar_texto(texto):
    texto = texto.lower().strip()
    texto_limpio = ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')
    return texto_limpio

def formatear_stat(txt):
    if not txt: return ""
    # 1. Aplicamos formatos de Vía y Elemento usando la función de arriba
    txt = buscarElementoVia(txt)
    # 2. Detección automática de Stats numéricos (Ej: +10%, 15, -2)
    patron_stats = r'([+-]?\d+(?:\.\d+)?%?)'
    txt = re.sub(patron_stats, r'<span class="stat">\1</span>', txt)
    return txt

def formatear_habilidad(txt):
    if not txt: return ""
    # 1. Aplicamos formatos de Vía y Elemento
    txt = buscarElementoVia(txt)
    
    # 2. Reemplazo secuencial de números por {stat_X}
    contador = [1]
    
    def reemplazador(match):
        # group(1) atrapa el signo (+ o -) si es que el usuario lo escribió
        signo = match.group(1) 
        # group(2) atrapa el símbolo % si es que el usuario lo escribió
        porcentaje = match.group(2) 
        
        # Metemos el signo justo antes del {stat_X}, dentro del span para que se vea del mismo color
        reemplazo = f'<span class="stat">{signo}{{stat_{contador[0]}}}{porcentaje}</span>'
        contador[0] += 1
        return reemplazo
        
    # PATRÓN ACTUALIZADO:
    # ([+-]?) -> Grupo 1: Busca un + o un - opcional y lo guarda.
    # \d+(?:\.\d+)? -> Busca el número (entero o decimal). No tiene () porque lo vamos a borrar y cambiar por {stat_X}
    # (%?) -> Grupo 2: Busca un % opcional y lo guarda.
    patron_numeros = r'([+-]?)\d+(?:\.\d+)?(%?)'
    
    txt = re.sub(patron_numeros, reemplazador, txt)
    
    return txt


try:
    conexion = mysql.connector.connect(
        host="127.0.0.1",        # Usamos la IP local para entrar al túnel de Docker
        user="hsr_admin",        # El usuario que definiste en el YAML
        password="admin_password_seguro", # Tu nueva contraseña
        database="hsr_wiki"      # El nombre de la base de datos en Docker
    )

    if conexion.is_connected():
        cursor = conexion.cursor()
        
        tipo_accion = int(input(f'1. Agregar // 2. Actualizar: '))
        
        cursor.execute("SHOW TABLES")
        tablas_raw = cursor.fetchall()
        tablas = [t[0] for t in tablas_raw]
        tablas.append("build_character") # Opción especial
        
        for i, t in enumerate(tablas, 1):
            print(f"{i}. {t}")
        
        tabla_input = int(input('Selecciona una opción: '))
        tabla = tablas[tabla_input-1]

        # Definir personaje
        if tipo_accion == 2 or (tipo_accion == 1 and tabla != 'characters'):
            nombre_personaje = seleccionar_personaje_db(cursor)
            if not nombre_personaje: exit()
        else:
            nombre_personaje = input("\nNombre del personaje: ").strip()

        match tabla:
            case 'characters':
                opciones = {'1':'rarity', '2':'path', '3':'element', '4':'description', '5':'version', '6':'novaflare', '7':'eng_va', '8':'jpn_va', '9':'cn_va', '0':'kr_va'}
                
                # --- MOSTRAR DATOS ACTUALES (CHARACTERS) ---
                cursor.execute("SELECT * FROM characters WHERE name = %s", (nombre_personaje,))
                datos_actuales = cursor.fetchone()
                if datos_actuales:
                    nombres_columnas = [desc[0] for desc in cursor.description]
                    print(f"\n--- DATOS ACTUALES DE {nombre_personaje.upper()} ---")
                    for col, val in zip(nombres_columnas, datos_actuales):
                        if col in opciones.values(): # Solo muestra las columnas que se pueden editar
                            print(f"- {col.upper()}: {val}")
                    print("-----------------------------------")
                else:
                    print(f"\n❌ El personaje {nombre_personaje} no existe en la BD.")
                    # Puedes decidir si poner un 'continue' o dejar que siga para intentar actualizar

                if tipo_accion == 2:  # ================= ACTUALIZAR =================
                    columnas_sql = []
                    valores_sql = []
                    
                    vias_validas = {
                        "caceria": "Cacería", "ca": "Cacería", "abundancia": "Abundancia", "ab": "Abundancia",
                        "destruccion": "Destrucción", "de": "Destrucción", "erudicion": "Erudición", "er": "Erudición",
                        "exultacion": "Exultación", "ex": "Exultación", "armonia": "Armonía", "ar": "Armonía",
                        "nihilidad": "Nihilidad", "ni": "Nihilidad", "conservacion": "Conservación", "co": "Conservación",
                        "reminiscencia": "Reminiscencia", "re": "Reminiscencia"
                    }
                    elementos_validos = {
                        "rayo": "Rayo", "ra": "Rayo", "fisico": "Físico", "fi": "Físico", "hielo": "Hielo", "hi": "Hielo",
                        "viento": "Viento", "vi": "Viento", "fuego": "Fuego", "fu": "Fuego", "imaginario": "Imaginario", "im": "Imaginario",
                        "cuantico": "Cuántico", "qu": "Cuántico", "cu": "Cuántico"
                    }

                    while True:
                        print('\n1.Rareza // 2. Via // 3. Elemento // 4.Descripcion // 5.Version // 6.Novaflare // 7.Eng VA // 8.Jpn VA // 9.Chn VA // 0.Kor VA // q. Cerrar y Ejecutar')
                        accion_input = input('Selecciona una opcion para ACTUALIZAR: ').lower()
                        
                        if accion_input == 'q':
                            break 
                            
                        if accion_input in opciones:
                            columna = opciones[accion_input]
                            
                            # Lógica especial para la Vía
                            if accion_input == '2': 
                                while True:
                                    valor_input = input(f'Indica el nuevo valor para {columna}: ').strip()
                                    val_limpio = limpiar_texto(valor_input)
                                    if val_limpio in vias_validas:
                                        valor = vias_validas[val_limpio]
                                        break
                                    print("❌ Error: Vía no válida.")
                                    
                            # Lógica especial para el Elemento
                            elif accion_input == '3': 
                                while True:
                                    valor_input = input(f'Indica el nuevo valor para {columna}: ').strip()
                                    val_limpio = limpiar_texto(valor_input)
                                    if val_limpio in elementos_validos:
                                        valor = elementos_validos[val_limpio]
                                        break
                                    print("❌ Error: Elemento no válido.")
                                    
                            # Lógica para el resto de campos
                            else:
                                valor_input = input(f'Indica el nuevo valor para {columna}: ')
                                if accion_input == '4': 
                                    valor = buscarElementoVia(valor_input) 
                                else: 
                                    valor = valor_input
                            
                            columnas_sql.append(f"{columna} = %s")
                            valores_sql.append(valor)
                            print(f"-> Preparado: {columna} = {valor}")
                        else:
                            print("Opción no válida.")

                    if len(columnas_sql) > 0:
                        fragmento_set = ", ".join(columnas_sql)
                        query = f"UPDATE {tabla} SET {fragmento_set} WHERE name = %s"
                        valores_sql.append(nombre_personaje)
                        
                        cursor.execute(query, tuple(valores_sql))
                        conexion.commit()
                        
                        print(f"\n✅ ¡Éxito! Se actualizaron los datos de {nombre_personaje}.")
                    else:
                        print("\nNo se seleccionó ningún dato para actualizar. Operación cancelada.")
                
                else: # ================= AGREGAR (tipo_accion == 1) =================
                    print(f"\n=======================================================")
                    print(f"  INGRESANDO DATOS PARA: {nombre_personaje.upper()}")
                    print(f"=======================================================")

                    print("\nResponde las siguientes preguntas. (Puedes usar atajos como 'fu' para Fuego)\n")

                    # --- 1. RAREZA ---
                    while True:
                        rarity = input("Rareza (4 o 5): ").strip()
                        if not rarity: break
                        if rarity in ['4', '5']: break
                        print("❌ Error: La rareza debe ser 4 o 5.\n")

                    # --- 2. VÍA ---
                    vias_validas = {
                        "caceria": "Cacería", "ca": "Cacería", "abundancia": "Abundancia", "ab": "Abundancia",
                        "destruccion": "Destrucción", "de": "Destrucción", "erudicion": "Erudición", "er": "Erudición",
                        "exultacion": "Exultación", "ex": "Exultación", "armonia": "Armonía", "ar": "Armonía",
                        "nihilidad": "Nihilidad", "ni": "Nihilidad", "conservacion": "Conservación", "co": "Conservación",
                        "reminiscencia": "Reminiscencia", "re": "Reminiscencia"
                    }
                    path = ""
                    while True:
                        path_input = input("Vía: ").strip()
                        if not path_input: break
                        path_limpio = limpiar_texto(path_input)
                        if path_limpio in vias_validas:
                            path = vias_validas[path_limpio]
                            break
                        print("❌ Error: Vía no válida.\n")

                    # --- 3. ELEMENTO ---
                    elementos_validos = {
                        "rayo": "Rayo", "ra": "Rayo", "fisico": "Físico", "fi": "Físico", "hielo": "Hielo", "hi": "Hielo",
                        "viento": "Viento", "vi": "Viento", "fuego": "Fuego", "fu": "Fuego", "imaginario": "Imaginario", "im": "Imaginario",
                        "cuantico": "Cuántico", "qu": "Cuántico", "cu": "Cuántico"
                    }
                    element = ""
                    while True:
                        elem_input = input("Elemento: ").strip()
                        if not elem_input: break
                        elem_limpio = limpiar_texto(elem_input)
                        if elem_limpio in elementos_validos:
                            element = elementos_validos[elem_limpio]
                            break
                        print("❌ Error: Elemento no válido.\n")

                    # --- 4. DESCRIPCIÓN CON REEMPLAZO HTML AUTOMÁTICO ---
                    description_raw = input("Descripción del personaje: ").strip()
                    # Usamos buscarElementoVia en lugar de limpiar_texto para mantener mayúsculas y tildes
                    description = buscarElementoVia(description_raw) if description_raw else ""

                    # --- 5. VERSIÓN ---
                    while True:
                        version = input("Versión de salida (ej. 2.1): ").strip()
                        if not version: break
                        try:
                            float(version)
                            break 
                        except ValueError:
                            print("❌ Error: La versión debe ser un número decimal.\n")

                    # --- 6. ACTORES DE VOZ ---
                    eng_va = input("Actor de voz (Inglés): ").strip()
                    jpn_va = input("Actor de voz (Japonés): ").strip()
                    cn_va = input("Actor de voz (Chino): ").strip()
                    kr_va = input("Actor de voz (Coreano): ").strip()

                    # Función para convertir textos vacíos a NULL en la base de datos
                    def a_nulo(valor):
                        return valor if valor != "" else None

                    # Consulta SQL segura con parámetros (%s)
                    query = """
                        INSERT INTO characters (
                            name, rarity, path, element, description, version, 
                            eng_va, jpn_va, cn_va, kr_va
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    
                    valores = (
                        nombre_personaje, a_nulo(rarity), a_nulo(path), a_nulo(element), 
                        a_nulo(description), a_nulo(version), a_nulo(eng_va), 
                        a_nulo(jpn_va), a_nulo(cn_va), a_nulo(kr_va)
                    )
                    
                    try:
                        cursor.execute(query, valores)
                        conexion.commit()
                        print(f"\n✅ ¡Éxito! El personaje {nombre_personaje} ha sido añadido a la base de datos.")
                    except mysql.connector.Error as err:
                        print(f"\n❌ Error SQL al insertar: {err}")


            # ========================================================================
            # NUEVO BLOQUE: EIDOLONS
            # ========================================================================
            case 'eidolons':
                # 1. Necesitamos saber la Vía del personaje para calcular los niveles 3 y 5
                cursor.execute("SELECT path FROM characters WHERE name = %s", (nombre_personaje,))
                personaje_db = cursor.fetchone()

                if not personaje_db:
                    print(f"\n❌ Error: El personaje '{nombre_personaje}' no existe en la tabla principal (characters). ¡Agrégalo primero!")
                else:
                    via_real = personaje_db[0]
                    print(f"\n✅ Personaje: {nombre_personaje} | Vía detectada: {via_real}")

                    # --- Textos predefinidos para E3 y E5 ---
                    basico = 'Niv. de ATQ básico <span class="stat">+1</span> (máximo: nivel 10). '
                    habilidad = 'Niv. de habilidad básica <span class="stat">+2</span> (máximo: nivel 15). '
                    definitiva = 'Niv. de habilidad definitiva <span class="stat">+2</span> (máximo: nivel 15). '
                    talento = 'Niv. de talento <span class="stat">+2</span> (máximo: nivel 15). '

                    extra_texto = ""
                    opt1_desc = habilidad + talento
                    opt2_desc = definitiva + basico
                    opt3_desc = habilidad + basico
                    opt4_desc = definitiva + talento

                    if via_real == "Reminiscencia":
                        extra_texto = 'Niv. de talento de mnemoduende <span class="stat">+1</span> (máximo: nivel 10).'
                    elif via_real == "Exultación": 
                        extra_texto = 'Niv. de habilidad de Exultación <span class="stat">+1</span> (máximo: nivel 15).'

                    if tipo_accion == 2: # ACTUALIZAR EIDOLON
                        while True:
                            nivel_update = input("\n¿Qué nivel de Eidolon quieres actualizar? (1-6) o 'q' para salir: ")
                            if nivel_update.lower() == 'q': break
                            if nivel_update not in ['1','2','3','4','5','6']:
                                print("❌ Nivel inválido.")
                                continue

                            # --- MOSTRAR DATOS ACTUALES (EIDOLONS) ---
                            cursor.execute("SELECT name, description FROM eidolons WHERE character_id = %s AND lvl = %s", (nombre_personaje, int(nivel_update)))
                            eidolon_actual = cursor.fetchone()
                            if eidolon_actual:
                                print(f"\n--- VALORES ACTUALES (E{nivel_update}) ---")
                                print(f"- Nombre: {eidolon_actual[0]}")
                                print(f"- Descripción: {eidolon_actual[1]}")
                                print("--------------------------------")
                            else:
                                print(f"\n❌ El Eidolon {nivel_update} aún no existe en la base de datos.")
                                continue # Vuelve a preguntar el nivel
                            
                            print("1. Nombre del Eidolon")
                            print("2. Descripción")
                            opcion_campo = input("¿Qué campo quieres actualizar?: ")
                            
                            if opcion_campo == '1':
                                nuevo_nombre = input("Nuevo nombre: ")
                                cursor.execute("UPDATE eidolons SET name = %s WHERE character_id = %s AND lvl = %s", (nuevo_nombre, nombre_personaje, int(nivel_update)))
                                conexion.commit()
                                print("✅ Nombre actualizado correctamente.")
                            elif opcion_campo == '2':
                                nueva_desc_raw = input("Nueva descripción: ")
                                nueva_desc_html = formatear_stat(nueva_desc_raw)
                                cursor.execute("UPDATE eidolons SET description = %s WHERE character_id = %s AND lvl = %s", (nueva_desc_html, nombre_personaje, int(nivel_update)))
                                conexion.commit()
                                print("✅ Descripción con Stats guardada correctamente.")
                            else:
                                print("❌ Opción inválida.")

                    else: # AGREGAR TODOS LOS EIDOLONES (tipo_accion == 1)
                        print(f"\n=======================================================")
                        print(f"  INGRESANDO EIDOLONES PARA: {nombre_personaje.upper()}")
                        print(f"=======================================================")
                        
                        opcion_lvl3 = None 
                        for lvl in range(1, 7):
                            print(f"\n--- DATOS EIDOLON NIVEL {lvl} ---")
                            nombre_eidolon = input(f"Nombre del Eidolon {lvl}: ").strip()
                            
                            if lvl == 3:
                                print("Selecciona mejora para E3:")
                                print("1. Habilidad + Talento")
                                print("2. Definitiva + Básico")
                                print("3. Habilidad + Básico")
                                print("4. Definitiva + Talento")
                                while True:
                                    opcion_lvl3 = input("Opción (1, 2, 3 o 4): ").strip()
                                    if opcion_lvl3 == '1': desc_html = opt1_desc + extra_texto; break
                                    elif opcion_lvl3 == '2': desc_html = opt2_desc + extra_texto; break
                                    elif opcion_lvl3 == '3': desc_html = opt3_desc + extra_texto; break
                                    elif opcion_lvl3 == '4': desc_html = opt4_desc + extra_texto; break
                                    print("❌ Error: Selecciona 1, 2, 3 o 4.")

                            elif lvl == 5:
                                if opcion_lvl3 in ['1', '2']:
                                    opcion_actual = '2' if opcion_lvl3 == '1' else '1'
                                    desc_html = (opt1_desc if opcion_actual == '1' else opt2_desc) + extra_texto
                                elif opcion_lvl3 in ['3', '4']:
                                    opcion_actual = '4' if opcion_lvl3 == '3' else '3'
                                    desc_html = (opt3_desc if opcion_actual == '3' else opt4_desc) + extra_texto
                                print(f"✨ E5 configurado automáticamente.")

                            else:
                                desc_raw = input(f"Descripción del Eidolon {lvl}: ").strip()
                                desc_html = formatear_stat(desc_raw)

                            query_insert = "INSERT INTO eidolons (character_id, lvl, name, description) VALUES (%s, %s, %s, %s)"
                            valores_insert = (nombre_personaje, lvl, nombre_eidolon, desc_html)
                            
                            try:
                                cursor.execute(query_insert, valores_insert)
                                conexion.commit()
                                print(f"✅ Eidolon {lvl} guardado directo en la BD.")
                            except mysql.connector.Error as err:
                                print(f"❌ Error al guardar Eidolon {lvl}: {err}")


            # ========================================================================
            # NUEVO BLOQUE: RASTROS MENORES (traces_mi)
            # ========================================================================
            case 'traces_mi':
                valores_map = {
                    '1':'ATK', '2':'DEF', '3':'HP', '4':'BREAK', '5':'CRIT D', 
                    '6':'CRIT R', '7':'DMG', '8':'EFFECT RATE', '9':'EFFECT RES', 
                    'a':'ELATION', 'b':'ENERGY', 'c':'SPD'
                }
                
                if tipo_accion == 2:  # ================= ACTUALIZAR =================
                    # --- MOSTRAR DATOS ACTUALES ---
                    cursor.execute("SELECT type, value FROM traces_mi WHERE character_id = %s", (nombre_personaje,))
                    rastros_actuales = cursor.fetchall()
                    
                    if not rastros_actuales:
                        print(f"\n❌ El personaje {nombre_personaje} no tiene rastros menores registrados.")
                    else:
                        print(f"\n--- RASTROS MENORES ACTUALES DE {nombre_personaje.upper()} ---")
                        for idx, rastro in enumerate(rastros_actuales, start=1):
                            print(f"{idx}. {rastro[0]}: {rastro[1]}")
                        print("-------------------------------------------------")
                        
                        while True:
                            seleccion = input("\n¿Qué rastro quieres actualizar? (1-3) o 'q' para salir: ").lower().strip()
                            if seleccion == 'q': break
                            
                            try:
                                indice = int(seleccion) - 1
                                rastro_a_editar = rastros_actuales[indice]
                                tipo_viejo = rastro_a_editar[0]
                                val_viejo = rastro_a_editar[1]
                                
                                print("\nSelecciona el NUEVO tipo:")
                                print("1. ATK | 2. DEF | 3. HP | 4. BREAK | 5. CRIT D | 6. CRIT R")
                                print("7. DMG | 8. EFFECT RATE | 9. EFFECT RES | a. ELATION | b. ENERGY | c. SPD")
                                
                                nuevo_tipo_key = input(f"Nuevo tipo (deja vacío para mantener '{tipo_viejo}'): ").strip().lower()
                                nuevo_tipo = valores_map.get(nuevo_tipo_key, tipo_viejo) if nuevo_tipo_key else tipo_viejo
                                
                                nuevo_val_str = input(f"Nuevo valor (deja vacío para mantener '{val_viejo}'): ").strip()
                                nuevo_val = nuevo_val_str if nuevo_val_str else val_viejo
                                
                                # Hacemos el UPDATE buscando específicamente la fila antigua
                                cursor.execute(
                                    "UPDATE traces_mi SET type = %s, value = %s WHERE character_id = %s AND type = %s AND value = %s LIMIT 1",
                                    (nuevo_tipo, nuevo_val, nombre_personaje, tipo_viejo, val_viejo)
                                )
                                conexion.commit()
                                print(f"✅ Rastro actualizado correctamente a: {nuevo_tipo} = {nuevo_val}")
                                
                                # Actualizamos la lista local por si el usuario quiere seguir editando
                                rastros_actuales[indice] = (nuevo_tipo, nuevo_val)
                                
                            except (ValueError, IndexError):
                                print("❌ Opción inválida. Selecciona un número de la lista.")

                else:  # ================= AGREGAR (tipo_accion == 1) =================
                    print(f"\n=======================================================")
                    print(f"  INGRESANDO RASTROS MENORES PARA: {nombre_personaje.upper()}")
                    print(f"=======================================================")

                    for lvl in range(1, 4):
                        print(f"\n--- DATOS RASGOS MENORES {lvl} ---")
                        print("1. ATK | 2. DEF | 3. HP | 4. BREAK | 5. CRIT D | 6. CRIT R")
                        print("7. DMG | 8. EFFECT RATE | 9. EFFECT RES | a. ELATION | b. ENERGY | c. SPD")
                        
                        while True:
                            tipo_input = input(f"Tipo de rasgo {lvl}: ").strip().lower()
                            if tipo_input in valores_map:
                                tipo_string = valores_map[tipo_input]
                                break
                            print("❌ Error: Opción no válida. Ingresa un número (1-9) o letra (a-c).")

                        valor_input = input(f"Valor del rasgo {lvl}: ").strip()

                        # Al usar %s, no necesitamos preocuparnos de si es float, int o string,
                        # mysql.connector lo inyecta de forma segura a tu base de datos.
                        query_insert = "INSERT INTO traces_mi (character_id, type, value) VALUES (%s, %s, %s)"
                        
                        try:
                            cursor.execute(query_insert, (nombre_personaje, tipo_string, valor_input))
                            conexion.commit()
                            print(f"✅ Rastro {lvl} guardado directo en la BD: {tipo_string} = {valor_input}")
                        except mysql.connector.Error as err:
                            print(f"❌ Error al guardar Rastro {lvl}: {err}")


            # ========================================================================
            # NUEVO BLOQUE: HABILIDADES (skills)
            # ========================================================================
            case 'skills':

                if tipo_accion == 2:  # ================= ACTUALIZAR =================
                    # Obtenemos la lista inicial para el menú principal
                    cursor.execute("SELECT id, type, name FROM skills WHERE character_id = %s", (nombre_personaje,))
                    habilidades_actuales = cursor.fetchall()

                    if not habilidades_actuales:
                        print(f"\n❌ El personaje {nombre_personaje} no tiene habilidades registradas.")
                    else:
                        while True:
                            # Refrescamos la lista de nombres por si editamos el nombre de alguna habilidad
                            cursor.execute("SELECT id, type, name FROM skills WHERE character_id = %s", (nombre_personaje,))
                            habilidades_actuales = cursor.fetchall()
                            
                            print(f"\n--- HABILIDADES ACTUALES DE {nombre_personaje.upper()} ---")
                            for idx, hab in enumerate(habilidades_actuales, 1):
                                print(f"{idx}. [{hab[1]}] {hab[2]}")
                            
                            seleccion = input("\n¿Qué habilidad quieres actualizar? (Número) o 'q' para salir: ").strip().lower()
                            if seleccion == 'q': break
                            
                            try:
                                indice = int(seleccion) - 1
                                hab_seleccionada = habilidades_actuales[indice]
                                id_hab = hab_seleccionada[0]

                                # NUEVO BUCLE: Nos quedamos dentro de la habilidad seleccionada hasta presionar 'q'
                                while True:
                                    # Obtenemos los datos frescos de la base de datos en cada iteración
                                    cursor.execute("SELECT type, enchanced, memosprite, energy, target, name, description, energy_gain, break FROM skills WHERE id = %s", (id_hab,))
                                    datos = cursor.fetchone()

                                    print(f"\n==========================================")
                                    print(f"   EDITANDO: {datos[5]} ")
                                    print(f"==========================================")
                                    print("1. Tipo        2. Enchanced    3. Memosprite")
                                    print("4. Energía     5. Target       6. Nombre")
                                    print("7. Descripción 8. Energy Gain  9. Break")
                                    print("q. <-- Volver a la lista de habilidades")
                                    
                                    campo_idx = input("\n¿Qué campo quieres editar? (1-9, q): ").strip().lower()
                                    
                                    if campo_idx == 'q':
                                        break # Sale del bucle interior y vuelve a la lista de habilidades
                                    
                                    campos_bd = ['type', 'enchanced', 'memosprite', 'energy', 'target', 'name', 'description', 'energy_gain', 'break']
                                    if not campo_idx.isdigit() or not (1 <= int(campo_idx) <= 9):
                                        print("❌ Opción inválida.")
                                        continue
                                    
                                    columna_real = campos_bd[int(campo_idx)-1]
                                    valor_antiguo = datos[int(campo_idx)-1]
                                    print(f"\nValor actual de '{columna_real}': {valor_antiguo}")
                                    
                                    # Lógica especial dependiendo de qué campo se edita
                                    if columna_real == 'type':
                                        nuevo_valor = pedir_de_lista(lista_tipos, "Tipo de Habilidad")
                                    elif columna_real == 'target':
                                        nuevo_valor = pedir_de_lista(lista_targets, "Target")
                                    elif columna_real in ['enchanced', 'memosprite']:
                                        nuevo_valor = pedir_binario(f"Nuevo valor para {columna_real}")
                                    elif columna_real == 'description':
                                        raw_desc = input("Nueva descripción: ")
                                        # LÓGICA NUEVA: Si el type actual (datos[0]) es Técnica, usamos formatear_stat
                                        if datos[0] == 'Técnica':
                                            nuevo_valor = formatear_stat(raw_desc)
                                        else:
                                            nuevo_valor = formatear_habilidad(raw_desc)
                                    else:
                                        nuevo_valor = input("Nuevo valor: ").strip()
                                        nuevo_valor = a_nulo(nuevo_valor)

                                    cursor.execute(f"UPDATE skills SET {columna_real} = %s WHERE id = %s", (nuevo_valor, id_hab))
                                    conexion.commit()
                                    print(f"✅ Campo '{columna_real}' actualizado a: {nuevo_valor}")

                            except (ValueError, IndexError):
                                print("❌ Número inválido.")

                else: # ================= AGREGAR (tipo_accion == 1) =================
                    print(f"\n=======================================================")
                    print(f"  INGRESANDO HABILIDADES PARA: {nombre_personaje.upper()}")
                    print(f"=======================================================")

                    # BUCLE INFINITO PARA SEGUIR AGREGANDO HABILIDADES
                    while True:
                        print("\n-------------------------------------------------------")
                        # NAME Y CONDICIÓN DE SALIDA
                        hab_name = input("Nombre de la nueva habilidad (o 'q' para terminar): ").strip()
                        
                        if hab_name.lower() == 'q':
                            print("\n⬅️ Saliendo del creador de habilidades...")
                            break

                        # TYPE
                        hab_type = pedir_de_lista(lista_tipos, "Tipo de Habilidad")
                        if 'Mnemoduende' in hab_type: memosprite = 1
                        else: memosprite = 0

                        # ENCHANCED & MEMOSPRITE
                        enchanced = pedir_binario("¿Es una habilidad mejorada? (enchanced)")

                        # ENERGY (Solo si es Definitiva)
                        energy = None
                        if hab_type == 'Definitiva':
                            while True:
                                en_input = input("Costo de Energía de la Definitiva: ").strip()
                                if en_input.isdigit():
                                    energy = int(en_input)
                                    break
                                print("❌ Debes ingresar un número entero para la energía.")

                        # TARGET
                        target = pedir_de_lista(lista_targets, "Target de la habilidad")

                        # ENERGY GAIN
                        energy_gain = input("\nGanancia de energía (energy_gain) [Ej: 30 o 30.5]: ").strip()
                        energy_gain = a_nulo(energy_gain)

                        # BREAK
                        break_dmg = input("Daño a la firmeza (break) [Ej: 30]: ").strip()
                        break_dmg = a_nulo(break_dmg)

                        # DESCRIPTION 
                        # LÓGICA NUEVA: Depende del tipo de habilidad seleccionado
                        if hab_type == 'Técnica':
                            print("\n[TÉCNICA] Escribe la descripción. Los números y porcentajes se pintarán automáticamente (sin borrarse).")
                            desc_raw = input("Descripción: ").strip()
                            description = formatear_stat(desc_raw)
                        else:
                            print("\nEscribe la descripción de la habilidad. Los números se convertirán a {stat_X} automáticamente.")
                            desc_raw = input("Descripción: ").strip()
                            description = formatear_habilidad(desc_raw)

                        # INSERT
                        query = """
                            INSERT INTO skills (
                                character_id, type, enchanced, memosprite, energy, target, 
                                name, description, energy_gain, break
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """
                        valores = (
                            nombre_personaje, hab_type, enchanced, memosprite, energy, target,
                            hab_name, description, energy_gain, break_dmg
                        )

                        try:
                            cursor.execute(query, valores)
                            conexion.commit()
                            print(f"\n✅ ¡Éxito! Habilidad '{hab_name}' añadida correctamente.")
                            print(f"Vista previa descripción: {description}")
                        except mysql.connector.Error as err:
                            print(f"\n❌ Error SQL al insertar: {err}")


            # ========================================================================
            # NUEVO BLOQUE: RASTROS MAYORES (traces)
            # ========================================================================
            case 'traces':
                if tipo_accion == 2:  # ================= ACTUALIZAR =================
                    while True:
                        # Obtenemos la lista actual de rastros del personaje
                        cursor.execute("SELECT id, name FROM traces WHERE character_id = %s", (nombre_personaje,))
                        rastros_actuales = cursor.fetchall()

                        if not rastros_actuales:
                            print(f"\n❌ El personaje {nombre_personaje} no tiene rastros mayores registrados.")
                            break
                        
                        print(f"\n--- RASTROS MAYORES ACTUALES DE {nombre_personaje.upper()} ---")
                        for idx, rastro in enumerate(rastros_actuales, 1):
                            print(f"{idx}. {rastro[1]}")
                        
                        seleccion = input("\n¿Qué rastro quieres actualizar? (Número) o 'q' para salir: ").strip().lower()
                        if seleccion == 'q': break
                        
                        try:
                            indice = int(seleccion) - 1
                            rastro_seleccionado = rastros_actuales[indice]
                            id_rastro = rastro_seleccionado[0]

                            # Bucle para quedarnos editando el mismo rastro hasta poner 'q'
                            while True:
                                cursor.execute("SELECT name, description FROM traces WHERE id = %s", (id_rastro,))
                                datos = cursor.fetchone()

                                print(f"\n==========================================")
                                print(f"   EDITANDO: {datos[0]} ")
                                print(f"==========================================")
                                print("1. Nombre")
                                print("2. Descripción")
                                print("q. <-- Volver a la lista de rastros")
                                
                                campo_idx = input("\n¿Qué campo quieres editar? (1, 2 o q): ").strip().lower()
                                
                                if campo_idx == 'q':
                                    break
                                
                                if campo_idx == '1':
                                    print(f"\nValor actual: {datos[0]}")
                                    nuevo_valor = input("Nuevo nombre: ").strip()
                                    cursor.execute("UPDATE traces SET name = %s WHERE id = %s", (nuevo_valor, id_rastro))
                                    conexion.commit()
                                    print(f"✅ Nombre actualizado a: {nuevo_valor}")
                                    
                                elif campo_idx == '2':
                                    print(f"\nValor actual: {datos[1]}")
                                    raw_desc = input("Nueva descripción: ")
                                    # Usamos formatear_stat para dejar los números intactos pero con clase "stat"
                                    nuevo_valor = formatear_stat(raw_desc) 
                                    cursor.execute("UPDATE traces SET description = %s WHERE id = %s", (nuevo_valor, id_rastro))
                                    conexion.commit()
                                    print(f"✅ Descripción actualizada correctamente.")
                                else:
                                    print("❌ Opción inválida.")

                        except (ValueError, IndexError):
                            print("❌ Número inválido.")

                else: # ================= AGREGAR (tipo_accion == 1) =================
                    print(f"\n=======================================================")
                    print(f"  INGRESANDO RASTROS MAYORES PARA: {nombre_personaje.upper()}")
                    print(f"=======================================================")

                    # Bucle infinito para cargar los rastros mayores uno tras otro
                    while True:
                        print("\n-------------------------------------------------------")
                        rastro_name = input("Nombre del Rastro Mayor (o 'q' para terminar): ").strip()
                        
                        if rastro_name.lower() == 'q':
                            print("\n⬅️ Saliendo del creador de rastros...")
                            break

                        print("\nEscribe la descripción. Los números y porcentajes se pintarán automáticamente.")
                        desc_raw = input("Descripción: ").strip()
                        # Usamos formatear_stat aquí también
                        description = formatear_stat(desc_raw)

                        query = "INSERT INTO traces (character_id, name, description) VALUES (%s, %s, %s)"
                        valores = (nombre_personaje, rastro_name, description)

                        try:
                            cursor.execute(query, valores)
                            conexion.commit()
                            print(f"\n✅ ¡Éxito! Rastro '{rastro_name}' añadido correctamente.")
                            print(f"Vista previa descripción: {description}")
                        except mysql.connector.Error as err:
                            print(f"\n❌ Error SQL al insertar: {err}")


            # ========================================================================
            # NUEVO BLOQUE: NIVELES DE HABILIDAD (skill_levels)
            # ========================================================================
            case 'skill_levels':
                # Obtenemos todas las habilidades del personaje
                cursor.execute("SELECT id, type, name, description, memosprite FROM skills WHERE character_id = %s", (nombre_personaje,))
                habilidades_personaje = cursor.fetchall()

                if not habilidades_personaje:
                    print(f"\n❌ El personaje {nombre_personaje} no tiene habilidades registradas. Agrégalas en la tabla 'skills' primero.")
                else:
                    if tipo_accion == 2:  # ================= ACTUALIZAR =================
                        while True:
                            print(f"\n--- HABILIDADES DE {nombre_personaje.upper()} ---")
                            for idx, hab in enumerate(habilidades_personaje, 1):
                                print(f"{idx}. [{hab[1]}] {hab[2]}")

                            seleccion = input("\n¿De qué habilidad quieres actualizar los niveles? (Número) o 'q' para salir: ").strip().lower()
                            if seleccion == 'q': break

                            try:
                                indice_hab = int(seleccion) - 1
                                hab_seleccionada = habilidades_personaje[indice_hab]
                                skill_id = hab_seleccionada[0]
                                hab_name = hab_seleccionada[2]
                                hab_desc = hab_seleccionada[3] # Necesitamos la descripción

                                while True:
                                    cursor.execute("SELECT id, indice, params FROM skill_levels WHERE skill_id = %s", (skill_id,))
                                    niveles_actuales = cursor.fetchall()

                                    if not niveles_actuales:
                                        print(f"\n❌ La habilidad '{hab_name}' no tiene niveles registrados. Usa la opción Agregar.")
                                        break

                                    print(f"\n--- NIVELES ACTUALES DE '{hab_name}' ---")
                                    for lvl_row in niveles_actuales:
                                        stat_idx_actual = lvl_row[1]
                                        print(f"stat_{stat_idx_actual}: {lvl_row[2]}")
                                    
                                    edit_idx = input("\n¿Qué stat_X quieres editar? (Ingresa solo el número) o 'q' para volver: ").strip().lower()
                                    if edit_idx == 'q': break

                                    if edit_idx.isdigit():
                                        stat_num = int(edit_idx)
                                        row_to_edit = next((row for row in niveles_actuales if row[1] == stat_num), None)
                                        
                                        if row_to_edit:
                                            # MOSTRAMOS EL CONTEXTO AQUÍ
                                            print(f"\n📝 Contexto: {obtener_contexto(hab_desc, stat_num)}")
                                            print(f"Valores actuales: {row_to_edit[2]}")
                                            
                                            nuevos_valores = input("Nuevos valores separados por coma: ").strip()
                                            
                                            if nuevos_valores:
                                                # Convertimos la string de entrada a una lista de números (enteros o decimales)
                                                lista_vals = [float(v.strip()) if '.' in v.strip() else int(v.strip()) for v in nuevos_valores.split(',')]
                                                json_vals = json.dumps(lista_vals) # Lo convertimos a formato JSON seguro
                                                
                                                cursor.execute("UPDATE skill_levels SET params = %s WHERE id = %s", (json_vals, row_to_edit[0]))
                                                conexion.commit()
                                                print(f"✅ stat_{stat_num} actualizado correctamente a formato JSON.")
                                        else:
                                            print("❌ Ese stat no está registrado en esta habilidad.")
                            except (ValueError, IndexError):
                                print("❌ Opción inválida.")

                    else:  # ================= AGREGAR (tipo_accion == 1) =================
                        while True:
                            print(f"\n--- HABILIDADES DE {nombre_personaje.upper()} ---")
                            for idx, hab in enumerate(habilidades_personaje, 1):
                                print(f"{idx}. [{hab[1]}] {hab[2]}")

                            seleccion = input("\n¿A qué habilidad le agregarás niveles? (Número) o 'q' para salir: ").strip().lower()
                            if seleccion == 'q': break

                            try:
                                indice_hab = int(seleccion) - 1
                                hab_seleccionada = habilidades_personaje[indice_hab]
                                skill_id = hab_seleccionada[0]
                                hab_type = hab_seleccionada[1]
                                hab_name = hab_seleccionada[2]
                                description = hab_seleccionada[3]
                                memosprite = hab_seleccionada[4]

                                # 1. Lógica de niveles máximos
                                if hab_type == 'Tecnica':
                                    max_niveles = 1
                                elif hab_type == 'Ataque Basico' or memosprite == 1:
                                    max_niveles = 10
                                else:
                                    max_niveles = 15

                                # 2. Buscar cuántos {stat_X} hay en la descripción usando Regex
                                import re
                                indices_encontrados = re.findall(r'\{stat_(\d+)\}', description)
                                indices_unicos = sorted(list(set(int(i) for i in indices_encontrados)))

                                if not indices_unicos:
                                    print(f"\n⚠️ La habilidad '{hab_name}' no tiene etiquetas {{stat_X}} en su descripción. No necesita niveles.")
                                    continue

                                print(f"\n==========================================")
                                print(f"  AGREGANDO NIVELES A: {hab_name}")
                                print(f"  Tipo: {hab_type} | Max Niveles esperados: {max_niveles}")
                                print(f"  Stats dinámicos detectados: {len(indices_unicos)} (Índices: {indices_unicos})")
                                print(f"==========================================")

                                # 3. Pedir valores iterativamente por cada stat encontrado
                                for stat_idx in indices_unicos:
                                    # Comprobamos si ya existe para no duplicarlo por error
                                    cursor.execute("SELECT id FROM skill_levels WHERE skill_id = %s AND indice = %s", (skill_id, stat_idx))
                                    if cursor.fetchone():
                                        print(f"⚠️ El {{stat_{stat_idx}}} ya está registrado. Para cambiarlo usa la opción 'Actualizar'.")
                                        continue

                                    while True:
                                        print(f"\n🔸 Ingresa los valores para {{stat_{stat_idx}}}")
                                        
                                        # MOSTRAMOS EL CONTEXTO AQUÍ
                                        print(f"📝 Contexto: {obtener_contexto(description, stat_idx)}")
                                        
                                        print(f"💡 Formato: separa los {max_niveles} números con comas (Ej: 10, 20, 30.5, 40...)")
                                        input_vals = input("Valores: ").strip()

                                        if input_vals.lower() == 'q': break
                                        if not input_vals: continue

                                        try:
                                            # Limpiamos y convertimos a lista
                                            lista_vals = [float(v.strip()) if '.' in v.strip() else int(v.strip()) for v in input_vals.split(',')]
                                            
                                            # Verificación de seguridad de niveles
                                            if len(lista_vals) != max_niveles:
                                                print(f"❌ ¡Cuidado! Ingresaste {len(lista_vals)} valores, pero el máximo para esta habilidad es {max_niveles}.")
                                                confirm = input("¿Quieres guardarlo de todos modos? (s/n): ").strip().lower()
                                                if confirm != 's': continue

                                            json_vals = json.dumps(lista_vals)
                                            cursor.execute("INSERT INTO skill_levels (skill_id, indice, params) VALUES (%s, %s, %s)", (skill_id, stat_idx, json_vals))
                                            conexion.commit()
                                            print(f"✅ {{stat_{stat_idx}}} guardado exitosamente.")
                                            break # Sale del while para pasar al siguiente stat
                                            
                                        except ValueError:
                                            print("❌ Error: Asegúrate de ingresar solo números separados por comas. No agregues el %.")
                            
                            except (ValueError, IndexError):
                                print("❌ Número inválido.")


            # ========================================================================
            # NUEVO BLOQUE: CONSTRUIR PERSONAJE (Flujo Completo)
            # ========================================================================
            case 'build_character':
                # --- PASO 1: CREAR PERSONAJE BASE ---
                # (Aquí podrías reutilizar la lógica de 'case characters' acción 1)
                # Por brevedad, asumimos que el personaje ya se seleccionó o creó al inicio del script.
                print(f"\n🚀 Iniciando construcción completa de: {nombre_personaje.upper()}")

                # --- PASO 2: BUCLE DE HABILIDADES + NIVELES ---
                while True:
                    print(f"\n--- [NUEVA HABILIDAD PARA {nombre_personaje}] ---")
                    hab_name = input("Nombre de la habilidad (o 'q' para terminar habilidades): ").strip()
                    if hab_name.lower() == 'q': break

                    # Recolectamos datos de la habilidad (reutilizando tu lógica de 'skills')
                    hab_type = pedir_de_lista(lista_tipos, "Tipo de Habilidad")
                    memosprite = 1 if 'Mnemoduende' in hab_type else 0
                    enchanced = pedir_binario("¿Es mejorada?")
                    target = pedir_de_lista(lista_targets, "Target")
                    
                    # Descripción con formateo automático de {stat_X}
                    print("Escribe la descripción (los números se convertirán en variables):")
                    desc_raw = input("> ")
                    description = formatear_habilidad(desc_raw)

                    # Insertar Habilidad
                    query_skill = "INSERT INTO skills (character_id, type, enchanced, memosprite, name, description, target) VALUES (%s, %s, %s, %s, %s, %s, %s)"
                    cursor.execute(query_skill, (nombre_personaje, hab_type, enchanced, memosprite, hab_name, description, target))
                    skill_id = cursor.lastrowid # ¡IMPORTANTE! Obtenemos el ID recién creado
                    conexion.commit()
                    print(f"✅ Habilidad '{hab_name}' creada (ID: {skill_id}).")

                    # --- PASO 2.1: PEDIR NIVELES INMEDIATAMENTE ---
                    indices_encontrados = re.findall(r'\{stat_(\d+)\}', description)
                    indices_unicos = sorted(list(set(int(i) for i in indices_encontrados)))

                    if indices_unicos:
                        max_niveles = 1 if hab_type == 'Técnica' else (7 if hab_type == 'Ataque Básico' or memosprite == 1 else 12)
                        print(f"\n📊 Configurando {len(indices_unicos)} stats para esta habilidad (Max Niv: {max_niveles})")
                        
                        for stat_idx in indices_unicos:
                            print(f"📝 Contexto: {obtener_contexto(description, stat_idx)}")
                            input_vals = input(f"Valores para {{stat_{stat_idx}}} (separados por coma): ").strip()
                            
                            try:
                                lista_vals = [float(v.strip()) if '.' in v.strip() else int(v.strip()) for v in input_vals.split(',')]
                                json_vals = json.dumps(lista_vals)
                                cursor.execute("INSERT INTO skill_levels (skill_id, indice, params) VALUES (%s, %s, %s)", (skill_id, stat_idx, json_vals))
                                conexion.commit()
                            except ValueError:
                                print("❌ Error en formato de números. Saltando stat...")
                    else:
                        print("ℹ️ Esta habilidad no tiene stats variables.")

                # --- PASO 3: RASTROS MAYORES AL FINAL ---
                print(f"\n--- [CONFIGURANDO RASTROS MAYORES PARA {nombre_personaje}] ---")
                for i in range(1, 4):
                    r_name = input(f"Nombre del Rastro Mayor {i}: ").strip()
                    if not r_name: continue
                    
                    r_desc_raw = input(f"Descripción del Rastro {i}: ").strip()
                    r_desc = formatear_stat(r_desc_raw)

                    query_trace = "INSERT INTO traces (character_id, name, description) VALUES (%s, %s, %s)"
                    cursor.execute(query_trace, (nombre_personaje, r_name, r_desc))
                    conexion.commit()
                    print(f"✅ Rastro {i} guardado.")

                print(f"\n✨ ¡Construcción de {nombre_personaje} finalizada con éxito! ✨")
except mysql.connector.Error as error:
    print(f"Ocurrió un error al modificar la base de datos: {error}")

finally:
    if 'conexion' in locals() and conexion.is_connected():
        cursor.close()
        conexion.close()
        print("\nLa conexión a MySQL ha sido cerrada.")