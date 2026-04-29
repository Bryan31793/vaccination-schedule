from langchain_community.utilities import SQLDatabase
from langchain_community.tools import QuerySQLDatabaseTool
from sqlalchemy import create_engine

# 1. Conecta la BD
engine = create_engine("mysql+pymysql://root:MephestoRL2006!@localhost:3306/vacunacion_adultos")  # cambia a tu BD real
db = SQLDatabase(engine)

# 2. Verifica que ve las tablas
print("Tablas:", db.get_table_names())

# 3. Ejecuta un SQL manualmente, sin LLM
executor = QuerySQLDatabaseTool(db=db)
resultado = executor.invoke("SELECT categoria FROM vacunas LIMIT 1;")
print("Resultado directo:", resultado)