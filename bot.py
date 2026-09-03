import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton

BOT_TOKEN = "8875814371:AAHpcDeTFUreEjxHLPvH49BLpu2zfb1LXYA"
bot = telebot.TeleBot(BOT_TOKEN)

ADMIN_USERNAME = "KOZNAK_USD"

def membership_keyboard():
    markup = InlineKeyboardMarkup(row_width=1)
    btn_vip = InlineKeyboardButton("⭐ 1 ئايلىق VIP ئەزالىق (4＄)", callback_data="choice_vip")
    btn_svip = InlineKeyboardButton("💎 1 ئايلىق ئالىي ئەزالىق SVIP (7＄)", callback_data="choice_svip")
    markup.add(btn_vip, btn_svip)
    return markup

@bot.message_handler(commands=['start'])
def welcome_msg(message):
    text = (
        f"ئەسسالامۇئەلەيكۇم {message.from_user.first_name}!\n"
        "«كۆزنەك كىنوخانىسى» ئەزالىق ئېچىش مەركىزىگە كەلگىنىڭىزنى قارشى ئالىمىز. 🎬\n\n"
        "قايسى خىل ئەزالىقنى ئاچقۇزماقچى؟ تۆۋەندىكى كۇنۇپكىدىن تاللاڭ:"
    )
    bot.send_message(message.chat.id, text, reply_markup=membership_keyboard())

@bot.callback_query_handler(func=lambda call: True)
def handle_query(call):
    if call.data == "choice_vip":
        resp = (
            "⭐ **سىز «1 ئايلىق VIP ئەزالىق» نى تاللىدىڭىز.**\n\n"
            "💵 باھاسى: 4＄ (ئايلىق)\n"
            "✨ بارلىق كىنولارنى چەكلىمىسىز يۇقىرى سۈرئەتتە كۆرۈش ئېچىلىدۇ.\n\n"
            "📌 **كېيىنكى قەدەم:**\n"
            "تور بېكەتتىكى 6 خانىلىق شەخسىي **UID** نومۇرىڭىزنى مۇشۇ يەرگە ئەۋەتىپ بېرىڭ، ھەمدە ھەق تاپشۇرۇش ئۈچۈن @" + ADMIN_USERNAME + " غا ئۇچۇر قىلىڭ."
        )
        bot.send_message(call.message.chat.id, resp, parse_mode="Markdown")
        bot.answer_callback_query(call.id)

    elif call.data == "choice_svip":
        resp = (
            "💎 **سىز «1 ئايلىق ئالىي ئەزالىق (Super VIP)» نى تاللىدىڭىز.**\n\n"
            "💵 باھاسى: 7＄ (ئايلىق)\n"
            "✨ بارلىق كىنولارنى كۆرۈش + پۈتۈن فىلىملەرنى چۈشۈرۈپ ساقلىۋېلىش تولۇق ئېچىلىدۇ.\n\n"
            "📌 **كېيىنكى قەدەم:**\n"
            "تور بېكەتتىكى 6 خانىلىق شەخسىي **UID** نومۇرىڭىزنى مۇشۇ يەرگە ئەۋەتىپ بېرىڭ، ھەمدە ھەق تاپشۇرۇش ئۈچۈن @" + ADMIN_USERNAME + " غا ئۇچۇر قىلىڭ."
        )
        bot.send_message(call.message.chat.id, resp, parse_mode="Markdown")
        bot.answer_callback_query(call.id)

@bot.message_handler(func=lambda message: True)
def handle_incoming_text(message):
    reply_text = (
        "ئۇچۇرىڭىز قوبۇل قىلىندى! ✅\n"
        "ئەزالىق تۈرىنى تاللىمىغان بولسىڭىز، تۆۋەندىكى كۇنۇپكىنى بېسىڭ:"
    )
    bot.send_message(message.chat.id, reply_text, reply_markup=membership_keyboard())

print("بوت قوزغالدى...")
bot.infinity_polling()
