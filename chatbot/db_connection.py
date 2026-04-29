from sqlalchemy import create_engine
from langchain_community.utilities import SQLDatabase

# MySQL
#engine = create_engine("mysql+pymysql://usuario:contraseña@localhost/mi_base")

# Reconstrucción con tus datos reales
engine = create_engine("mysql+pymysql://root:MephestoRL2006!@localhost:3306/vacunacion_adultos")
db = SQLDatabase(engine)

# Verifica que conectó bien
print(db.get_table_names())       # Lista de tablas
print(db.get_table_info())        # Schema completo (tablas + columnas)

