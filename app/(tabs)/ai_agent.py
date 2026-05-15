import os
from langchain.agents import AgentExecutor, create_react_agent
from langchain_openai import ChatOpenAI
from langchain.tools import Tool
from langchain import hub
from langchain.memory import ConversationBufferMemory

# --- CONFIGURATION ---
# Option A: Use OpenAI (requires API key)
# os.environ["OPENAI_API_KEY"] = "sk-your-key-here"
# llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Option B: Use a FREE local model via Ollama (recommended for privacy)
# First install Ollama: https://ollama.com
# Then run: ollama pull llama3
from langchain_community.llms import Ollama
llm = Ollama(model="llama3", temperature=0.3)

# --- TOOLS (What the agent can DO) ---
def search_web(query: str) -> str:
    """Search the web for information."""
    import requests
    url = f"https://ddg-api.herokuapp.com/search?query={query}&limit=5"
    try:
        resp = requests.get(url, timeout=10).json()
        return "\n".join([r["snippet"] for r in resp[:3]])
    except:
        return "Could not search the web."

def run_python(code: str) -> str:
    """Execute Python code safely."""
    try:
        exec_globals = {}
        exec(code, exec_globals)
        return str(exec_globals.get("result", "Executed successfully"))
    except Exception as e:
        return f"Error: {e}"

def read_file(path: str) -> str:
    """Read a file from disk."""
    try:
        with open(path, "r") as f:
            return f.read()[:2000]
    except Exception as e:
        return f"Error reading file: {e}"

# Register tools
tools = [
    Tool(name="Web Search", func=search_web, description="Search the internet for current information"),
    Tool(name="Python Calculator", func=run_python, description="Execute Python code for math or logic"),
    Tool(name="Read File", func=read_file, description="Read the contents of a file"),
]

# --- MEMORY ---
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

# --- BUILD AGENT ---
prompt = hub.pull("hwchase17/react-chat")
agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, memory=memory, verbose=True)

# --- RUN ---
if __name__ == "__main__":
    print("🤖 AI Agent Ready! Type 'quit' to exit.\n")
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["quit", "exit", "q"]:
            print("Goodbye!")
            break
        response = agent_executor.invoke({"input": user_input})
        print(f"Agent: {response['output']}\n")