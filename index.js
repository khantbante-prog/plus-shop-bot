const TelegramBot = require("node-telegram-bot-api");

const token = "8671336338:AAFTwnL5moLNwXoWSlMScyiVh5PtSqYSr5Y";

// admin IDs
const adminIds = [
  "6438632305",
  "6742441262"
];

const bot = new TelegramBot(token, { polling: true });

console.log("Bot is running...");

// start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🤖 Welcome to Plus Shop!\n\n📸 Send payment screenshot."
  );
});

// photo receive
bot.on("photo", (msg) => {

  const user = msg.from;

  // random order id
  const orderId = Math.floor(
    1000 + Math.random() * 9000
  );

  // customer reply
  bot.sendMessage(
    msg.chat.id,
   ` ✅ Screenshot received!

🧾 Order ID: #${orderId}

⏳ Waiting for admin approval...`
  );

  // send to admins
  adminIds.forEach((adminId) => {

    // forward screenshot
    bot.forwardMessage(
      adminId,
      msg.chat.id,
      msg.message_id
    );

    // admin panel
    bot.sendMessage(
      adminId,
      `📥 New Order

🧾 Order ID: #${orderId}
👤 User: ${user.first_name}
🆔 User ID: ${user.id}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ Approve",
                callback_data: `approve_${msg.chat.id}`
              },
              {
                text: "❌ Reject",
                callback_data: `reject_${msg.chat.id}`
              }
            ]
          ]
        }
      }
    );

  });

});
bot.on("callback_query", (query) => {

  const data = query.data;

  if (data.startsWith("approve_")) {

    const chatId = data.split("_")[1];

    bot.sendMessage(
      chatId,
      "✅ Payment Approved!\n\n🎮 Your order is successful."
    );

  }

  if (data.startsWith("reject_")) {

    const chatId = data.split("_")[1];

    bot.sendMessage(
      chatId,
      "❌ Payment Rejected!\n\nPlease contact admin."
    );

  }

});