import requests
import logging

from direction.models import Parametre

TELEGRAM_FORMAT = "*{title}*: {description} le _{date}_"


def send_message(bot_token, chat_id, message):
    """
    Send a message to a chat using the Telegram API.
    """
    try:
        # URL de l'API Telegram pour envoyer un message
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

        # Paramètres de la requête
        payload = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'Markdown'
        }

        # Envoyer la requête POST
        response = requests.post(url, data=payload)

        return response
    except Exception:
        pass


def send_message_to_admin(message):
    """
    Send a message to the admin using the Telegram API.
    """
    # Récupérer les paramètres de l'application
    bot_token = Parametre.get_value(Parametre.BOT_TOKEN)
    chat_id = Parametre.get_value(Parametre.CHAT_ID)

    if bot_token is None or chat_id is None:
        return

    # Envoyer le message
    send_message(bot_token.valeur, chat_id.valeur, message)
