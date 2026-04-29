from langchain_community.utilities import SQLDatabase
from sqlalchemy import create_engine
engine = create_engine("mysql+pymysql://root:MephestoRL2006!@localhost:3306/vacunacion_adultos")
db = SQLDatabase(engine)
print("2:", db.get_table_names())