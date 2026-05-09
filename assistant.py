import datetime
import math
import random

def assistant(user_input):
    user_input = user_input.lower().strip()

    if any(word in user_input for word in ["hello", "hi", "hey"]):
        return "Hey! How can I help you? ??"
    elif any(word in user_input for word in ["how are you", "how r u"]):
        return "I am doing great! What about you? ??"
    elif "date" in user_input:
        return f"Today is {datetime.date.today().strftime('%B %d, %Y')} ??"
    elif "time" in user_input:
        return f"Current time is {datetime.datetime.now().strftime('%I:%M %p')} ?"
    elif "calculate" in user_input or "math" in user_input:
        try:
            expression = user_input.replace("calculate", "").replace("math", "").strip()
            result = eval(expression)
            return f"Result: {result} ??"
        except:
            return "Please give me a valid math expression!"
    elif "joke" in user_input:
        jokes = [
            "Why do programmers prefer dark mode? Because light attracts bugs! ??",
            "Why did the computer go to the doctor? It had a virus! ??",
            "What do you call a fish without eyes? A fsh! ??"
        ]
        return random.choice(jokes)
    elif any(word in user_input for word in ["bye", "exit", "quit"]):
        return "Goodbye! See you soon! ??"
    else:
        return "I am still learning! Try asking me the time, date, a joke, or a math calculation ??"

print("Happy Assistant is ready! Type bye to exit.\n")
while True:
    user = input("You: ")
    response = assistant(user)
    print(f"Assistant: {response}\n")
    if any(word in user.lower() for word in ["bye", "exit", "quit"]):
        break
