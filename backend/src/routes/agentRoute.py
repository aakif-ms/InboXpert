from flask import Blueprint, request, jsonify
from ..agents.email_agent import agent

ai_bp = Blueprint("email", __name__)


@ai_bp.route("/ai", methods=["GET"])
def agent_handler():
    # data = request.json
    # subject = data.get("subject", "")
    # body = data.get("body", "")
    # action = data.get("action", "summarize")

    state = {
        "subject": "Introducing about one piece anime.",
        "body": """To Myseld,I hope this email finds you well.
        
                    I wanted to share a brief overview of One Piece, an incredibly popular and long-running Japanese manga and anime series. It follows the adventures of Monkey D. Luffy, a young man whose body gained rubber-like properties after he accidentally ate a Devil Fruit. His lifelong dream is to become the King of the Pirates and find the legendary treasure known as the One Piece.

                    Luffy assembles a diverse and loyal crew, the Straw Hat Pirates, as they navigate the treacherous Grand Line, encountering powerful enemies, making new allies, and uncovering the mysteries of their world. The series is renowned for its thrilling action, deep emotional connections between characters, and a rich, imaginative world-building. It explores themes of friendship, freedom, destiny, and the pursuit of dreams, making it a truly captivating journey.

                    Best regards,
                    Aakif""",   
        "action": "summarize"
    }
    
    result = agent.invoke(state)

    return result
