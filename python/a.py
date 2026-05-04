import re
import os
from collections import defaultdict
import pprint
import mysql.connector
import json
import tkinter as tk
from tkinter import filedialog

# =====================================================================
# FORMATOS Y ESTILOS (Vías, Elementos y Stats)
# =====================================================================
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
    
    resultado = txt
    for patron, correcta in regex_vias.items():
        resultado = re.sub(patron, f'<span class="path">{correcta}</span>', resultado, flags=re.IGNORECASE)
    for patron, correcta in regex_elementos.items():
        resultado = re.sub(patron, f'<span class="element">{correcta}</span>', resultado, flags=re.IGNORECASE)
        
    return resultado

# Formateador usado exclusivamente cuando escribes la descripción a mano
def aplicar_formatos_manual(txt):
    if not txt: return ""
    txt = buscarElementoVia(txt)
    contador = [1]
    def reemplazador(match):
        signo = match.group(1)
        porcentaje = match.group(2)
        reemplazo = f'<span class="stat">{signo}{{stat_{contador[0]}}}{porcentaje}</span>'
        contador[0] += 1
        return reemplazo
    patron_numeros = r'([+-]?)\d+(?:\.\d+)?(%?)'
    txt = re.sub(patron_numeros, reemplazador, txt)
    return txt

# =====================================================================
# PARSER DE HABILIDADES
# =====================================================================
def procesar_habilidades_personaje(texto):
    texto = re.sub(r'\\s*', '', texto)

    lista_tipos = ['Ataque Basico', 'Habilidad Basica', 'Definitiva', 'Talento', 'Tecnica', 'Habilidad Mnemoduende', 'Talento Mnemoduende', 'Habilidad Exultacion']
    lista_targets = ['ATQ individual', 'Ráfaga', 'ATQ AdE', 'Alteracíon', 'Potenciación', 'Defensa', 'Rebote', 'Apoyo', 'Regeneración', 'Invocación']

    def normalizar_tipo(texto_busqueda):
        text_lower = texto_busqueda.lower()
        if 'básico' in text_lower or 'basico' in text_lower: return 'Ataque Básico'
        elif 'definitiva' in text_lower: return 'Definitiva'
        elif 'habilidad de mnemoduende' in text_lower: return 'Habilidad del Mnemoduende'
        elif 'talento de mnemoduende' in text_lower: return 'Talento del Mnemoduende'
        elif 'habilidad de exultación' in text_lower: return 'Habilidad de Exultación'
        elif 'habilidad básica' in text_lower or 'habilidad basica' in text_lower: return 'Habilidad Básica'
        elif 'talento' in text_lower: return 'Talento'
        elif 'técnica' in text_lower or 'tecnica' in text_lower: return 'Técnica'
        return 'Desconocido'

    def normalizar_target(texto_busqueda):
        text_clean = texto_busqueda.lower().replace('í', 'i').replace('ó', 'o').replace('á', 'a').replace('é', 'e')
        for t in lista_targets:
            t_clean = t.lower().replace('í', 'i').replace('ó', 'o').replace('á', 'a').replace('é', 'e')
            if t_clean in text_clean: return t
        return 'No especificado'

    energia_activacion = "Desconocido"
    match_energia = re.search(r'1\t[\d\.]+\t[\d\.]+\t\d+\t\d+\t[\d\.]+%\t[\d\.]+%\t\d+\t(\d+)', texto)
    if match_energia: energia_activacion = match_energia.group(1)

    patron_cabecera = r'^([^\n\t]+)\t\1([^\n]*)\n\s*Recuperación de energía'
    matches = list(re.finditer(patron_cabecera, texto, re.MULTILINE))
    
    habilidades_extraidas = []

    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i+1].start() if i+1 < len(matches) else len(texto)
        bloque = texto[start:end]

        nombre = m.group(1).strip()
        resto_cabecera = m.group(2).strip()
        
        match_regen = re.search(r'Recuperación de energía\s*:\s*(\d+)', bloque)
        energia_ganada = match_regen.group(1) if match_regen else "0"

        match_break = re.search(r'Ruptura de Debilidad\s*:\s*([^\n]+)', bloque)
        break_val = match_break.group(1).strip() if match_break else "0"

        tipo_oficial = normalizar_tipo(resto_cabecera if resto_cabecera else nombre)
        
        texto_cabecera = bloque[:match_regen.start()]
        if '|' in texto_cabecera:
            target_bruto = texto_cabecera.split('|')[-1].strip()
        else:
            target_bruto = bloque[bloque.find('\n')+1 : match_regen.start()].strip()
            
        target_oficial = normalizar_target(target_bruto)

        desc_start = match_break.end() if match_break else match_regen.end()
        desc_raw = bloque[desc_start:]
        
        match_end = re.search(r'\n(?:\*?Nivel\s*\d*|Ver detalle[s]?|\tA\t|Regalo Rastros|Regalo Eidolon|Rastros|Eidolon|Conos de luz)', desc_raw)
        if match_end: desc_raw = desc_raw[:match_end.start()]

        lineas_desc = []
        for linea in desc_raw.strip().split('\n'):
            linea = linea.strip()
            if not linea: continue
            linea_formateada = re.sub(r'_(.*?)_', r'<u>\1</u>', linea)
            lineas_desc.append(linea_formateada)
            
        lineas_utiles = []
        for index, linea in enumerate(lineas_desc):
            linea_lower = linea.lower()
            es_resumen = False
            if "pequeña cantidad" in linea_lower or "gran cantidad" in linea_lower: es_resumen = True
            elif "#" in linea and "[" in linea: es_resumen = True
            elif index > 0 and len(lineas_utiles) > 0:
                palabras_primera = lineas_utiles[0].split()
                palabras_actual = linea.split()
                if len(palabras_primera) >= 3 and len(palabras_actual) >= 3:
                    # Nos aseguramos de que no empiece a borrar si es que la línea tiene un número/estadística
                    if palabras_primera[:3] == palabras_actual[:3] and not re.search(r'\d+(?:\.\d+)?%', linea):
                        es_resumen = True
            if es_resumen: break 
            lineas_utiles.append(linea)

        descripcion_final = '<br>'.join(lineas_utiles).strip()
        if not descripcion_final: continue

        estadisticas = {}
        tabla_match = re.search(r'Ver detalle[s]?\n+(.*)', bloque, re.DOTALL)
        if tabla_match:
            lineas_tabla = tabla_match.group(1).split('\n')
            letras_stats = []
            for i_linea, linea in enumerate(lineas_tabla):
                cols = [c.strip() for c in linea.split('\t')]
                if 'A' in cols:
                    letras_stats = [c for c in cols if c in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']]
                    lineas_tabla = lineas_tabla[i_linea+1:]
                    break
            
            if letras_stats:
                stats_temp = defaultdict(list)
                for linea in lineas_tabla:
                    if not linea.strip(): continue
                    columnas = [c.strip() for c in re.split(r'\t|\s{2,}', linea) if c.strip()]
                    if columnas and columnas[0].isdigit():
                        nivel = int(columnas[0])
                        if 1 <= nivel <= 15:
                            valores = columnas[1 : 1 + len(letras_stats)]
                            for letra, val in zip(letras_stats, valores):
                                val_str = val.replace('%', '').strip()
                                if not val_str: continue
                                try:
                                    if '.' in val_str: val_num = float(val_str)
                                    else: val_num = int(val_str)
                                except ValueError:
                                    val_num = val_str
                                stats_temp[f"stat_{letra}"].append(val_num)

                for stat_k, stat_v in stats_temp.items():
                    if stat_v: estadisticas[stat_k] = tuple(stat_v)

        # =======================================================
        # SUSTITUCIÓN DE {stat_X} Y ORDENAMIENTO EN LA DESCRIPCIÓN
        # =======================================================
        if estadisticas and descripcion_final:
            # Buscamos todos los números en el texto crudo
            matches_desc = list(re.finditer(r"([+-]?)(\d+(?:\.\d+)?)(%?)", descripcion_final))            
            estadisticas_ordenadas = []
            match_to_k = {}
            estadisticas_restantes = list(estadisticas.items())

            # 1. Emparejar números de la descripción con las columnas
            for m in matches_desc:
                num_desc = float(m.group(2))
                
                matched_k = None
                for idx, (k, tupla_valores) in enumerate(estadisticas_restantes):
                    try:
                        ultimo_valor = float(tupla_valores[-1])
                        if abs(num_desc - ultimo_valor) < 0.001:
                            matched_k = k
                            estadisticas_ordenadas.append((k, tupla_valores))
                            estadisticas_restantes.pop(idx)
                            break
                    except (ValueError, IndexError): pass
                
                if matched_k:
                    match_to_k[m.start()] = matched_k

            estadisticas_ordenadas.extend(estadisticas_restantes)

            # 2. Asignar los nombres stat_1, stat_2 y borrar constantes
            estadisticas_filtradas = {}
            k_to_label = {}
            contador_stat = 1
            
            for k, tupla_valores in estadisticas_ordenadas:
                if len(set(tupla_valores)) > 1: # Si es variable
                    new_key = f"stat_{contador_stat}"
                    estadisticas_filtradas[new_key] = tupla_valores
                    k_to_label[k] = f"{{{new_key}}}"
                    contador_stat += 1
                else: # Si es constante
                    k_to_label[k] = None
                    
            estadisticas = estadisticas_filtradas

            # 3. Inyectar los {stat_X} y los <span class="stat"> en el texto
            desc_modificada = descripcion_final
            # Recorremos de atrás hacia adelante para no romper los índices
            for m in reversed(matches_desc):
                start = m.start()
                end = m.end()
                signo = m.group(1)
                numero = m.group(2)
                porcentaje = m.group(3)
                
                k = match_to_k.get(start)
                label = k_to_label.get(k) if k else None
                
                if label:
                    # Inyecta ej: <span class="stat">+{stat_1}%</span>
                    reemplazo = f'<span class="stat">{signo}{label}{porcentaje}</span>'
                else:
                    # Si era constante, lo deja con su número pero le pone estilo
                    reemplazo = f'<span class="stat">{signo}{numero}{porcentaje}</span>'
                    
                desc_modificada = desc_modificada[:start] + reemplazo + desc_modificada[end:]
                
            descripcion_final = desc_modificada

        elif descripcion_final:
            # Si la habilidad no tiene tabla, igual coloreamos todos los números que tenga
            descripcion_final = re.sub(r'([+-]?\d+(?:\.\d+)?%?)', r'<span class="stat">\1</span>', descripcion_final)

        # Finalmente, se aplican los colores de los Elementos y las Vías
        descripcion_final = buscarElementoVia(descripcion_final)

        datos_hab = {
            "nombre": nombre,
            "tipo": tipo_oficial,
            "target": target_oficial,
            "energia_ganada": energia_ganada,
            "break": break_val,
            "descripcion": descripcion_final,
            "escalado_nivel": estadisticas
        }
        if tipo_oficial == 'Definitiva': datos_hab["energia_activacion"] = energia_activacion

        if not any(h['nombre'] == nombre for h in habilidades_extraidas):
            habilidades_extraidas.append(datos_hab)

    return habilidades_extraidas


# =====================================================================
# INTERFAZ CON LA BASE DE DATOS MYSQl Y GENERACIÓN JSON
# =====================================================================
def inyectar_en_bd():
    try:
        root = tk.Tk()
        root.withdraw() 
        
        print("\nAbriendo explorador de archivos...")
        carpeta_seleccionada = filedialog.askdirectory(title="Selecciona la carpeta del personaje (debe contener el a.txt)")
        
        if not carpeta_seleccionada:
            print("❌ No se seleccionó ninguna carpeta. Operación cancelada.")
            return
            
        ruta_archivo_texto = os.path.join(carpeta_seleccionada, 'a.txt')
        
        if not os.path.exists(ruta_archivo_texto):
            print(f"❌ Error: No se encontró el archivo 'a.txt' dentro de la carpeta:\n{carpeta_seleccionada}")
            return
            
        nombre_personaje = os.path.basename(carpeta_seleccionada)

        with open(ruta_archivo_texto, 'r', encoding='utf-8') as archivo:
            texto_documento = archivo.read()
        
        habilidades_extraidas = procesar_habilidades_personaje(texto_documento)
        
        if not habilidades_extraidas:
            print(f"\n❌ No se encontraron habilidades válidas en el documento de {nombre_personaje}.")
            return

        conexion = mysql.connector.connect(
            host="127.0.0.1",        # Usamos la IP local para entrar al túnel de Docker
            user="hsr_admin",        # El usuario que definiste en el YAML
            password="admin_password_seguro", # Tu nueva contraseña
            database="hsr_wiki"      # El nombre de la base de datos en Docker
        )
        cursor = conexion.cursor()

        print("\n=======================================================")
        print("  SISTEMA DE IMPORTACIÓN DE HABILIDADES")
        print("=======================================================")
        print(f"📁 Personaje detectado: {nombre_personaje}")

        habilidades_finales_json = []

        for hab in habilidades_extraidas:
            memosprite = 1 if hab['tipo'] in ['Habilidad Mnemoduende', 'Talento Mnemoduende'] else None
            
            print(f"\n⚡ Habilidad detectada: [{hab['tipo']}] {hab['nombre']}")
            ench_input = input("¿Es una habilidad mejorada (enchanced)? [Enter para NULL, otra tecla para 1]: ").strip()
            enchanced = 1 if ench_input else None

            while True:
                print(f"\n{'-'*60}")
                print(f"VISTA PREVIA PARA INSERTAR EN BASE DE DATOS")
                print(f"{'-'*60}")
                print(f"1. Nombre:       {hab['nombre']}")
                print(f"2. Tipo:         {hab['tipo']}")
                print(f"3. Target:       {hab['target']}")
                print(f"4. Energía Act.: {hab.get('energia_activacion', 'NULL')}")
                print(f"5. Energía Gan.: {hab['energia_ganada']}")
                print(f"6. Break:        {hab['break']}")
                print(f"7. Memosprite:   {memosprite}")
                print(f"8. Enhanced:     {enchanced}")
                print(f"9. Descripción:\n{hab['descripcion']}")
                
                print(f"\n10. [Stats por Nivel (skill_levels)]:")
                if not hab['escalado_nivel']:
                    print("  -> No hay stats variables extraídos.")
                else:
                    for stat, vals in hab['escalado_nivel'].items():
                        print(f"  -> {stat}: {vals}")
                print("-" * 60)

                opcion = input("\n¿Qué deseas hacer? [A]gregar | [M]odificar algún campo | [S]altar: ").strip().upper()

                if opcion == 'S':
                    print(f"⏭️ Habilidad '{hab['nombre']}' descartada.")
                    break
                
                elif opcion == 'M':
                    campo = input("\n¿Qué número de campo quieres modificar? (1-10): ").strip()
                    if campo == '1': hab['nombre'] = input("Nuevo nombre: ").strip()
                    elif campo == '2': hab['tipo'] = input("Nuevo tipo: ").strip()
                    elif campo == '3': hab['target'] = input("Nuevo target: ").strip()
                    elif campo == '4': hab['energia_activacion'] = input("Nueva Energía de Activación: ").strip()
                    elif campo == '5': hab['energia_ganada'] = input("Nueva Energía Ganada: ").strip()
                    elif campo == '6': hab['break'] = input("Nuevo Break: ").strip()
                    elif campo == '7':
                        m_in = input("Nuevo Memosprite (Enter para NULL, otra tecla para 1): ").strip()
                        memosprite = 1 if m_in else None
                    elif campo == '8':
                        e_in = input("Nuevo Enhanced (Enter para NULL, otra tecla para 1): ").strip()
                        enchanced = 1 if e_in else None
                    elif campo == '9': 
                        raw_desc = input("Nueva Descripción (escribe el texto limpio, los HTML y stats se añaden solos): ").strip()
                        # Formateador manual que inyecta automáticamente los {stat_X}
                        hab['descripcion'] = aplicar_formatos_manual(raw_desc)
                    elif campo == '10':
                        if not hab['escalado_nivel']:
                            print("❌ Esta habilidad no tiene variables detectadas.")
                        else:
                            stat_editar = input("¿Qué stat quieres modificar? (ej: stat_1, stat_2): ").strip()
                            if stat_editar in hab['escalado_nivel']:
                                input_vals = input(f"Nuevos valores para {stat_editar} (separados por coma): ").strip()
                                if input_vals:
                                    try:
                                        lista_vals = [float(v.strip()) if '.' in v.strip() else int(v.strip()) for v in input_vals.split(',')]
                                        hab['escalado_nivel'][stat_editar] = tuple(lista_vals)
                                        print(f"✅ {stat_editar} actualizado correctamente.")
                                    except ValueError:
                                        print("❌ Error: Deben ser números separados por coma.")
                            else:
                                print(f"❌ No se encontró '{stat_editar}'.")
                    else: print("❌ Opción inválida.")
                    continue 

                elif opcion == 'A':
                    energy_val = hab.get('energia_activacion')
                    if energy_val == "Desconocido" or energy_val == "":
                        energy_val = None

                    habilidades_finales_json.append({
                        "character_id": nombre_personaje,
                        "name": hab['nombre'],
                        "type": hab['tipo'],
                        "target": hab['target'],
                        "energy_activation": energy_val,
                        "energy_gain": hab['energia_ganada'],
                        "break": hab['break'],
                        "memosprite": memosprite,
                        "enchanced": enchanced,
                        "description": hab['descripcion'],
                        "skill_levels": hab['escalado_nivel']
                    })

                    query_skill = """
                        INSERT INTO skills (character_id, type, enchanced, memosprite, energy, target, name, description, energy_gain, break)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    valores_skill = (
                        nombre_personaje, hab['tipo'], enchanced, memosprite,
                        energy_val, hab['target'], hab['nombre'], hab['descripcion'],
                        hab['energia_ganada'], hab['break']
                    )

                    cursor.execute(query_skill, valores_skill)
                    skill_id = cursor.lastrowid
                    conexion.commit()
                    print(f"✅ Habilidad guardada en MySQL (ID Generado: {skill_id})")

                    if hab['escalado_nivel']:
                        for stat_name, valores_tupla in hab['escalado_nivel'].items():
                            indice_stat = stat_name.split('_')[1]
                            json_vals = json.dumps(list(valores_tupla))

                            query_level = "INSERT INTO skill_levels (skill_id, indice, params) VALUES (%s, %s, %s)"
                            cursor.execute(query_level, (skill_id, indice_stat, json_vals))
                        conexion.commit()
                        print(f"✅ Escalados insertados en MySQL ('skill_levels').")
                    
                    break 
                
                else:
                    print("❌ Opción no reconocida. Por favor ingresa A, M o S.")

        print("\n🎉 Proceso de importación finalizado.")
        
        if habilidades_finales_json:
            ruta_json = os.path.join(carpeta_seleccionada, f"{nombre_personaje}_skills_finales.json")
            with open(ruta_json, 'w', encoding='utf-8') as f:
                json.dump(habilidades_finales_json, f, indent=4, ensure_ascii=False)
            print(f"📄 Se ha creado un archivo de respaldo con los datos finales:\n'{ruta_json}'")

    except mysql.connector.Error as error:
        print(f"❌ Ocurrió un error con la base de datos MySQL: {error}")
    finally:
        if 'conexion' in locals() and conexion.is_connected():
            cursor.close()
            conexion.close()
            print("🔌 Conexión cerrada.")

if __name__ == "__main__":
    inyectar_en_bd()