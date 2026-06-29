import os
from dotenv import load_dotenv

load_dotenv()

from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_google_genai import ChatGoogleGenerativeAI

# 🚨 ONLY IMPORT THE SEARCH TOOL. NO EMAIL TOOL.
from tools import search_inventory_history

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]

# 🚨 ONLY GIVE THE AI THE SEARCH TOOL.
tools = [search_inventory_history]

llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite", temperature=0)
llm_with_tools = llm.bind_tools(tools)

def analyst_node(state: AgentState):
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}

builder = StateGraph(AgentState)
builder.add_node("analyst", analyst_node)
builder.add_node("tools", ToolNode(tools))
builder.add_edge(START, "analyst")
builder.add_conditional_edges("analyst", tools_condition)
builder.add_edge("tools", "analyst")

cortex_graph = builder.compile()