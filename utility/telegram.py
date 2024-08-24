import requests
import logging

from direction.models import Parametre

TELEGRAM_FORMAT = "*{title}*: {description} le _{date}_"


def send_message(bot_token, chat_id, message):
    """
    Envoie un message à un utilisateur via l'API Telegram.

    :param bot_token: Le token d'authentification du bot Telegram
    :param chat_id: L'ID du chat de l'utilisateur
    :param message: Le message à envoyer
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

        # Vérifier la réponse
        if response.status_code == 200:
            logging.debug("Message envoyé avec succès!")
        else:
            logging.debug(f"Erreur lors de l'envoi du message: {response.status_code}")
            logging.debug(response.json())
    except Exception as e:
        logging.error(f"Erreur lors de l'envoi du message: {e}")


def send_message_to_admin(message):
    """
    Envoie un message à l'administrateur via l'API Telegram.

    :param message: Le message à envoyer
    """
    # Récupérer les paramètres de l'application
    bot_token = Parametre.get_value(Parametre.BOT_TOKEN)
    chat_id = Parametre.get_value(Parametre.CHAT_ID)

    if bot_token is None or chat_id is None:
        return

    # Envoyer le message
    send_message(bot_token.valeur, chat_id.valeur, message)
