from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langgraph.graph import StateGraph, END, START
from typing import TypedDict, Literal

model = ChatOpenAI(model="gpt-5-nano")

parser = StrOutputParser()

classifier_prompt = PromptTemplate(
    template="""
    You are an AI email classifier. 
    Categorize the email as one of: [Work, Personal, Promotion, Newsletter, Spam].
    Subject: {subject}
    Body: {body}
    """,
    input_variables=["subject", "body"]
)

classifier_chain = classifier_prompt | model | parser

summarizer_prompt = PromptTemplate(
    template="""
        Summarize this email in description.
        
        Subject: {subject}
        Body: {body}
    """,
    input_variables=["subject", "body"]
)

summarizer_chain = summarizer_prompt | model | parser

reply_prompt = PromptTemplate(
    template="""
        Generate a polite and context-aware reply to this email.
        
        Subject: {subject}
        Body: {body}
    """,
    input_variables=["subject", "body"]
)

reply_chain = reply_prompt | model | parser


class EmailState(TypedDict):
    body: str
    subject: str
    classification: str
    action: Literal["reply", "summarize"]
    result: str

def classify_node(state: EmailState) -> EmailState:

    category = classifier_chain.invoke({
        "subject": state["subject"],
        "body": state["body"]
    })
    
    return {"classification": category.strip(),"result": category.strip()}

def summarize_node(state: EmailState) -> EmailState:
    summarize = summarizer_chain.invoke({
        "subject": state["subject"],
        "body": state["body"]
    })
    
    return {"classification": state["classification"], "result": summarize.strip()}

def reply_node(state: EmailState) -> EmailState:
    reply = reply_chain.invoke({
        "subject": state["subject"],
        "body": state["body"]
    })
    
    return {"classification": state["classification"], "result": reply.strip()}

def tools_action(state: EmailState):
    if state["action"] == "summarize":
        return "summarize"
    elif state["action"] == "reply":
        return "reply"
    else:
        return END

graph_builder = StateGraph(EmailState)
graph_builder.add_node("classify", classify_node)    
graph_builder.add_node("summarize", summarize_node)    
graph_builder.add_node("reply", reply_node)    

graph_builder.add_edge(START, "classify")
graph_builder.add_conditional_edges(
    "classify",
    tools_action,
    {
        "reply": "reply",
        "summarize": "summarize",
        END: END
    }
)
graph_builder.add_edge("summarize", END)
graph_builder.add_edge("reply", END)

agent = graph_builder.compile()