from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate

# 1. Define el modelo
llm = OllamaLLM(model="llama3.1")

# 2. Crea el prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "Eres un asistente útil que responde en español."),
    ("human", "{input}")
])

# 3. Encadena prompt + modelo
chain = prompt | llm

# 4. Loop del chatbot
print("🤖 Chatbot listo. Escribe 'salir' para terminar.\n")

while True:
    user_input = input("Tú: ")
    if user_input.lower() in ["salir", "exit", "quit"]:
        print("¡Hasta luego!")
        break

    response = chain.invoke({"input": user_input})
    print(f"Bot: {response}\n")