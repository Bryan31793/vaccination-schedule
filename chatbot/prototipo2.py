from langchain_ollama import ChatOllama  # Usamos Chat, no LLM
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_community.utilities import SQLDatabase
from langchain_community.tools import QuerySQLDatabaseTool
from sqlalchemy import create_engine
import re

# --- Configuración ---
engine = create_engine("mysql+pymysql://root:MephestoRL2006!@localhost:3306/vacunacion_adultos")
db = SQLDatabase(
    engine,
    include_tables=["vacunas"],
    sample_rows_in_table_info=3
    )

# ChatOllama respeta mejor los roles system/user que OllamaLLM
llm = ChatOllama(model="llama3.2", temperature=0)
executor = QuerySQLDatabaseTool(db=db)

def generar_sql(pregunta: str) -> str:
    schema = db.get_table_info()
    messages = [
        SystemMessage(content="""Eres un experto en SQL. 
            Reglas ESTRICTAS que debes seguir:
            1. Responde ÚNICAMENTE con la consulta SQL, nada más.
            2. NO escribas explicaciones, NO escribas texto antes ni después del SQL.
            3. NO uses bloques de código markdown (sin ```).
            4. La consulta debe terminar con punto y coma.
            5. Usa SOLO las tablas y columnas del schema proporcionado."""
        ),
        HumanMessage(content=f"""Schema de la base de datos:
            {schema}
            Pregunta: {pregunta} SQL:"""
        )
    ]
    respuesta = llm.invoke(messages)
    return respuesta.content

def limpiar_sql(texto: str) -> str:
    texto = re.sub(r"```sql|```", "", texto).strip()
    # Toma solo la primera línea que parezca SQL
    for linea in texto.split("\n"):
        linea = linea.strip()
        if linea.upper().startswith(("SELECT", "INSERT", "UPDATE", "DELETE")):
            sql = linea.split(";")[0] + ";"
            return sql
    return texto.split(";")[0].strip() + ";"

def detectar_necesidad_sql(pregunta: str) -> bool:
    """Detecta si la pregunta requiere acceso a la base de datos"""
    messages = [
        SystemMessage(content="""Eres un clasificador de preguntas. 
            Responde SOLO con "SI" o "NO" (en mayúsculas).
            Responde "SI" si la pregunta requiere datos de una base de datos.
            Responde "NO" si es una pregunta general que no necesita BD."""),
        HumanMessage(content=f"¿Esta pregunta requiere consultar una base de datos? {pregunta}\n\nRespuesta:")
    ]
    respuesta = llm.invoke(messages)
    return "SI" in respuesta.content.upper()

def responder_general(pregunta: str) -> str:
    """Responde preguntas generales sin acceso a BD"""
    messages = [
        SystemMessage(content=
            "Eres un asistente amable y útil que responde preguntas en español. Sé breve y directo."),
        HumanMessage(content=pregunta)
    ]
    respuesta = llm.invoke(messages)
    return respuesta.content

def responder_sql(pregunta: str, resultado: str) -> str:
    """Responde preguntas usando resultados de la base de datos"""
    messages = [
        SystemMessage(content=
            """Eres un asistente que responde preguntas en español usando resultados de base de datos.
            Sé breve y directo."""
        ),
        HumanMessage(content=f"""Pregunta del usuario: {pregunta}
            Resultado de la consulta SQL: {resultado}
            Responde la pregunta usando ese resultado:"""
        )
    ]
    respuesta = llm.invoke(messages)
    return respuesta.content

# --- Loop del chatbot ---
print("Chatbot. Escribe 'exit' para terminar.\n")

while True:
    pregunta = input("Tú: ").strip()
    if pregunta.lower() in ["salir", "exit", "quit"]:
        print("¡Hasta luego!")
        break

    if not pregunta:
        continue

    try:
        # Paso 0: Detectar si necesita acceso a BD
        necesita_sql = detectar_necesidad_sql(pregunta)

        if not necesita_sql:
            # Es una pregunta general - responder sin SQL
            print("  → Tipo: Pregunta general")
            respuesta = responder_general(pregunta)
            print(f"Bot: {respuesta}\n")
        else:
            # Es una pregunta sobre datos - usar SQL
            print("  → Tipo: Pregunta sobre BD")
            
            # Paso 1: Generar SQL
            sql_sucio = generar_sql(pregunta)
            sql = limpiar_sql(sql_sucio)
            print(f"  → SQL: {sql}")

            # Paso 2: Ejecutar contra la BD real
            resultado = executor.invoke(sql)
            print(f"  → Resultado: {resultado}")

            # Paso 3: Respuesta en lenguaje natural
            respuesta = responder_sql(pregunta, resultado)
            print(f"Bot: {respuesta}\n")

    except Exception as e:
        print(f"Bot: Error — {e}\n")