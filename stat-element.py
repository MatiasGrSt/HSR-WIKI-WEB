import re
import pyperclip

# 1. LISTA DE ELEMENTOS
ELEMENTOS = [
    "Physical", 
    "Fire", 
    "Ice", 
    "Lightning", 
    "Wind", 
    "Quantum", 
    "Imaginary"
]

regex_elementos = r'\b(' + '|'.join(ELEMENTOS) + r')\b'

# 2. REGEX PARA ESTADÍSTICAS (Stats)
regex_stats = r'([+-]\d+(?:\.\d+)?%?|\d+(?:\.\d+)?%?[+-]|\d+(?:\.\d+)?%?)'

# 3. REGEX PARA SALTOS DE LÍNEA (Punto pegado a letra/número, excluyendo decimales)
# - Alternativa 1: Punto seguido de cualquier letra (con acentos y ñ)
# - Alternativa 2: Punto seguido de número, SIEMPRE QUE NO tenga otro número antes (evita decimales como 1.5)
regex_punto_pegado = r'\.(?=[a-zA-ZáéíóúÁÉÍÓÚñÑ])|(?<!\d)\.(?=[0-9])'

print("=" * 50)
print("   CONVERTIDOR AUTOMÁTICO HTML PARA ASTRALWIKI   ")
print("=" * 50)
print("Escribe o pega el texto. Para cerrar el programa, escribe 'salir'.\n")

while True:
    try:
        texto_original = input("Texto a procesar ➡️  ")
        
        if texto_original.strip().lower() in ['salir', 'exit', 'quit']:
            print("\n¡Programa finalizado con éxito!")
            break
            
        if not texto_original.strip():
            continue

        # --- PROCESAMIENTO (El orden aquí es sagrado) ---
        
        # Paso 1: Detectar puntos pegados y añadir el <br> justo después del punto
        texto_procesado = re.sub(regex_punto_pegado, '.<br>', texto_original)

        # Paso 2: Buscamos y envolvemos los Elementos
        texto_procesado = re.sub(
            regex_elementos, 
            lambda match: f'<span class="element">{match.group(1)}</span>', 
            texto_procesado, 
            flags=re.IGNORECASE
        )

        # Paso 3: Buscamos y envolvemos los Números y Signos (Stats)
        texto_procesado = re.sub(
            regex_stats, 
            r'<span class="stat">\1</span>', 
            texto_procesado
        )

        # --- RESULTADO Y PORTAPAPELES ---
        print("\n✨ Resultado generado:")
        print(texto_procesado)
        
        pyperclip.copy(texto_procesado)
        print("📋 ¡Copiado al portapapeles automáticamente!\n")
        print("-" * 50 + "\n")

    except KeyboardInterrupt:
        print("\n\nPrograma interrumpido. ¡Hasta luego!")
        break