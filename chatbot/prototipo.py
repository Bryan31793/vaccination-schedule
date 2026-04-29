# chatbot_sql.py
from langchain_ollama import OllamaLLM  
from langchain_community.utilities import SQLDatabase
from langchain_community.tools import QuerySQLDatabaseTool
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from sqlalchemy import create_engine

# --- Configuración ---
engine = create_engine("mysql+pymysql://root:MephestoRL2006!@localhost:3306/vacunacion_adultos")
db = SQLDatabase(
    engine,
    include_tables=["vacunas"],
    sample_rows_in_table_info=1
    )
llm = OllamaLLM(model="llama3.2:1b")

# --- Tool para ejecutar SQL ---
execute_query = QuerySQLDatabaseTool(db=db)

# --- Prompt para generar SQL ---
sql_prompt = PromptTemplate.from_template("""
Eres un experto en SQL. Dada una pregunta en lenguaje natural, genera una consulta SQL válida.

Base de datos: MySQL
Tablas disponibles:
{table_info}

Pregunta: {question}

SQL:
""")

# --- Obtener info de tablas ---
def get_table_info(_):
    return db.get_table_info()

# --- Cadena para generar SQL ---
sql_chain = (
    RunnablePassthrough.assign(table_info=get_table_info)
    | sql_prompt
    | llm
    | StrOutputParser()
)

# --- Prompt para respuesta final ---
answer_prompt = PromptTemplate.from_template("""
Dado el siguiente resultado de base de datos, responde la pregunta en español.
Sé claro y conciso. Si no hay resultados, dilo amablemente.

Pregunta: {question}
Resultado: {result}

Respuesta:
""")

# --- Cadena completa ---
chain = (
    RunnablePassthrough.assign(query=sql_chain)
    .assign(result=lambda x: execute_query.invoke(x["query"]))
    | answer_prompt
    | llm
    | StrOutputParser()
)

# --- Loop del chatbot ---
print("🤖 Chatbot SQL listo. Escribe 'salir' para terminar.\n")

while True:
    pregunta = input("Tú: ")
    if pregunta.lower() in ["salir", "exit", "quit"]:
        print("¡Hasta luego!")
        break

    try:
        respuesta = chain.invoke({"question": pregunta})
        print(f"Bot: {respuesta}\n")
    except Exception as e:
        print(f"Bot: Hubo un error al procesar tu pregunta: {e}\n")