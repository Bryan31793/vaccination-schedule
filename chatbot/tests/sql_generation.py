# PASO 3: ¿Genera SQL?
from langchain_ollama import OllamaLLM
from langchain_classic.chains import create_sql_query_chain
from langchain_community.utilities import SQLDatabase
from sqlalchemy import create_engine

engine = create_engine("mysql+pymysql://root:MephestoRL2006!@localhost:3306/vacunacion_adultos")
db = SQLDatabase(
    engine,
    include_tables=["vacunas"],
    sample_rows_in_table_info=1
    )
llm = OllamaLLM(model="llama3.2")

sql_chain = create_sql_query_chain(llm, db)
sql = sql_chain.invoke({"question": "cuántos registros hay en total"})
print("3:", sql)