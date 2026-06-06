const TelegramBot = require("node-telegram-bot-api");

const fs = require("fs");

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Web server started");
});

let orders = [];

if (fs.existsSync("orders.json")) {
  orders = JSON.parse(fs.readFileSync("orders.json"));
}

let users = [];

if (fs.existsSync("users.json")) {
  users = JSON.parse(fs.readFileSync("users.json"));
}

const token = "8671336338:AAHU75g4bMkfp-GMC8QbO_WYGK1_8L8fTx0";

// admin IDs
const adminIds = [
  "6438632305",
  "6742441262"
];

const bot = new TelegramBot(token, { polling: true });

const userStates = {};

console.log("Bot is running...");

// start command
bot.onText(/\/start/, (msg) => {

  const userExists = users.find(
  user => user.id === msg.from.id
);

console.log(users);

if (!userExists) {

  users.push({
    id: msg.from.id,
    name: msg.from.first_name
  });

  fs.writeFileSync(
    "users.json",
    JSON.stringify(users, null, 2)
  );

}

  bot.sendMessage(
    msg.chat.id,
    `🎮 Welcome to PLUS SHOP 🎮

💎 Fast & Trusted Top Up Service`,
    {
      reply_markup: {
        keyboard: [
          ["🔫 PUBG UC", "💎 MLBB Diamonds"],
          ["🔫 Free Fire", "😎 Contact Admin"]
        ],
        resize_keyboard: true
      }
    }
  );

});

// photo receive
bot.on("photo", (msg) => {

  const user = msg.from;

  const state = userStates[msg.chat.id];

  let orderInfo = "";

  if (state?.game === "PUBG") {
  orderInfo =
`🎮 Game: PUBG
🎯 UID: ${state.uid}
💎 Package: ${state.package}`;
}

if (state?.game === "MLBB") {
  orderInfo =
`🎮 Game: MLBB
🆔 ID/Server: ${state.mlbbId}
💎 Package: ${state.package}`;
}

if (state?.game === "FREE FIRE") {
  orderInfo =
`🎮 Game: Free Fire
🆔 UID: ${state.uid}
💎 Package: ${state.package}`;
}

  orders.push({
  user: user.first_name,
  id: user.id,
  file: msg.photo[0].file_id,
  time: new Date()
});

fs.writeFileSync(
  "orders.json",
  JSON.stringify(orders, null, 2)
);

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
🆔 User ID: ${user.id}

${orderInfo}`,
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

  delete userStates[msg.chat.id];

  bot.sendMessage(
  msg.chat.id,
  "🏠 Back to Main Menu",
  {
    reply_markup: {
      keyboard: [
        ["🔫 PUBG UC", "💎 MLBB Diamonds"],
        ["🔫 Free Fire", "😎 Contact Admin"]
      ],
      resize_keyboard: true
    }
  }
);

});
bot.on("callback_query", (query) => {

  const data = query.data;

  if (data.startsWith("approve_")) {

    const chatId = data.split("_")[1];

    bot.sendMessage(
  chatId,
 `✅ Payment Approved!

🎮 Your order is being processed.
⏳ Please wait for delivery.

💎 Thanks for choosing PLUS SHOP`
);

  }

  if (data.startsWith("reject_")) {

    const chatId = data.split("_")[1];

    bot.sendMessage(
      chatId,
      `❌ Payment Rejected!\n\nPlease contact admin.`
    );

  }
});
bot.on("message", (msg) => {

  const text = msg.text;

  // UID Save
  if (
  userStates[msg.chat.id] &&
  userStates[msg.chat.id].game === "PUBG" &&
  !userStates[msg.chat.id].uid
) {

  userStates[msg.chat.id].uid = text;

  bot.sendMessage(
  msg.chat.id,
  `💎 PUBG UC PRICE LIST

60 UC  - 1,000 Ks
325 UC - 5,000 Ks
660 UC - 10,000 Ks

👇 Choose Package`,
  {
    reply_markup: {
      keyboard: [
        ["60 UC"],
        ["325 UC"],
        ["660 UC"]
      ],
      resize_keyboard: true
    }
  }
);

  return;
}

if (
  userStates[msg.chat.id] &&
  userStates[msg.chat.id].game === "PUBG" &&
  userStates[msg.chat.id].uid &&
  !userStates[msg.chat.id].package &&
  (
    text === "60 UC" ||
    text === "325 UC" ||
    text === "660 UC"
  )
) {

  userStates[msg.chat.id].package = text;

  bot.sendMessage(
    msg.chat.id,
    `✅ Package Selected: ${text}

  💳 Payment Methods

🔈 KBZPay
09459066038
Bhone Myint Kyaw

🔈 WavePay
09671029588
Bhone Myint Kyaw

📸 After payment, send your screenshot.`
);  

  return;
}

  // PUBG
  if (text === "🔫 PUBG UC") {

    userStates[msg.chat.id] = {
      game: "PUBG"
    };

    bot.sendMessage(
      msg.chat.id,
      "🆔 Please send your PUBG UID"
    );

  }

  if (
  userStates[msg.chat.id] &&
  userStates[msg.chat.id].game === "MLBB" &&
  !userStates[msg.chat.id].mlbbId
) {

  userStates[msg.chat.id].mlbbId = text;

  bot.sendMessage(
    msg.chat.id,
    `💎 MLBB PRICE LIST

86 Diamonds  - 2,000 Ks
172 Diamonds - 4,000 Ks
257 Diamonds - 6,000 Ks

👇 Choose Package`,
    {
      reply_markup: {
        keyboard: [
          ["86 Diamonds"],
          ["172 Diamonds"],
          ["257 Diamonds"]
        ],
        resize_keyboard: true
      }
    }
  );

  return;
}

if (
  userStates[msg.chat.id] &&
  userStates[msg.chat.id].game === "MLBB" &&
  userStates[msg.chat.id].mlbbId &&
  !userStates[msg.chat.id].package &&
  (
    text === "86 Diamonds" ||
    text === "172 Diamonds" ||
    text === "257 Diamonds"
  )
) {

  userStates[msg.chat.id].package = text;

  bot.sendMessage(
    msg.chat.id,
    `✅ Package Selected: ${text}

  💳 Payment Methods

🔈 KBZPay
09459066038
Bhone Myint Kyaw

🔈 WavePay
09671029588
Bhone Myint Kyaw

📸 After payment, send your screenshot.`
);

  return;
}
  // MLBB
  if (text === "💎 MLBB Diamonds") {
   
    userStates[msg.chat.id] = {
      game: "MLBB"
    };

    bot.sendMessage(
      msg.chat.id,
      "🎮 please send your MLBB ID and Server ID\n\nExample:\n123456789(1234)"
    );

  }

  if (
  userStates[msg.chat.id] &&
  userStates[msg.chat.id].game === "FREE FIRE" &&
  !userStates[msg.chat.id].uid
) {

  userStates[msg.chat.id].uid = text;

  bot.sendMessage(
    msg.chat.id,
    `💥 FREE FIRE PRICE LIST

100 Diamonds - 1,500 Ks
310 Diamonds - 4,000 Ks
520 Diamonds - 7,000 Ks

👇 Choose Package`,
    {
      reply_markup: {
        keyboard: [
          ["100 Diamonds"],
          ["310 Diamonds"],
          ["520 Diamonds"]
        ],
        resize_keyboard: true
      }
    }
  );

  return;
}

if (
  userStates[msg.chat.id] &&
  userStates[msg.chat.id].game === "FREE FIRE" &&
  userStates[msg.chat.id].uid &&
  !userStates[msg.chat.id].package &&
  (
    text === "100 Diamonds" ||
    text === "310 Diamonds" ||
    text === "520 Diamonds"
  )
) {

  userStates[msg.chat.id].package = text;

  bot.sendMessage(
    msg.chat.id,
    `✅ Package Selected: ${text}

  💳 Payment Methods

🔈 KBZPay
09459066038
Bhone Myint Kyaw

🔈 WavePay
09671029588
Bhone Myint Kyaw

📸 After payment, send your screenshot.`
);

  return;
}

  // Free Fire
  if (text === "🔫 Free Fire") {

  userStates[msg.chat.id] = {
    game: "FREE FIRE"
  };

  bot.sendMessage(
    msg.chat.id,
    "🆔 Please send your Free Fire UID"
  );

}

  // Admin
  if (text === "😎 Contact Admin") {

    bot.sendMessage(
      msg.chat.id,
      "👤 Admin Telegram: @bropoll"
    );

  }

});

bot.onText(/\/stats/, (msg) => {

  if (!adminIds.includes(String(msg.from.id))) {
    return;
  }

  const totalOrders = orders.length;

  const today = new Date().toDateString();

  const todayOrders = orders.filter(order =>
    new Date(order.time).toDateString() === today
  ).length;

  bot.sendMessage(
    msg.chat.id,
    `📊 PLUS SHOP Statistics

📦 Total Orders: ${totalOrders}
📅 Today Orders: ${todayOrders}`
  );

});

bot.onText(/\/broadcast (.+)/, async (msg, match) => {

  if (!adminIds.includes(String(msg.from.id))) {
    return;
  }

  const message = match[1];

  const sentUsers = new Set();

  for (const user of users) {

    if (sentUsers.has(user.id)) continue;

    try {
      await bot.sendMessage(user.id, message);
      sentUsers.add(user.id);
    } catch (err) {
      console.log(`Failed to send to ${user.id}`);
    }

  }

  bot.sendMessage(
    msg.chat.id,
    `📢 Broadcast sent to ${sentUsers.size} users`
  );

});

bot.onText(/\/users/, (msg) => {

  if (!adminIds.includes(String(msg.from.id))) {
    return;
  }

  bot.sendMessage(
    msg.chat.id,
    `👥 Total Users: ${users.length}`
  );

});