// Native official Telegram Bot companion for CasaFinance
// Uses pure HTTPS fetch (0 third-party dependencies, 100% auditable and secure)

const CASAFINANCE_API_URL = process.env.CASAFINANCE_API_URL || 'http://casafinance:3000/api/bot';
const BOT_API_TOKEN = process.env.BOT_API_TOKEN || '';
let TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
let TELEGRAM_GROUP_NAME = process.env.TELEGRAM_GROUP_NAME || 'Gastos Casa';

function normalizeText(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

async function fetchDynamicSettings() {
  try {
    const settingsUrl = CASAFINANCE_API_URL.replace('/api/bot', '/api/settings');
    const res = await fetch(settingsUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.telegramBotToken) {
        TELEGRAM_BOT_TOKEN = data.telegramBotToken;
      }
      if (data.telegramGroupName) {
        TELEGRAM_GROUP_NAME = data.telegramGroupName;
      }
    }
  } catch (e) {
    // Ignore fallback to env
  }
}

async function sendMessage(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
  } catch (err) {
    console.error('Error enviando mensaje a Telegram:', err.message);
  }
}

async function startPolling() {
  console.log('🤖 Starting official native Telegram Bot for CasaFinance...');
  await fetchDynamicSettings();

  let offset = 0;

  while (true) {
    if (!TELEGRAM_BOT_TOKEN) {
      console.log('⏳ Waiting for Telegram Bot Token... (configure in CasaFinance Settings or TELEGRAM_BOT_TOKEN)');
      await new Promise((r) => setTimeout(r, 10000));
      await fetchDynamicSettings();
      continue;
    }

    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=30`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`❌ Telegram API Error (${res.status}). Retrying in 10s...`);
        await new Promise((r) => setTimeout(r, 10000));
        await fetchDynamicSettings();
        continue;
      }

      const data = await res.json();
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          const msg = update.message;
          if (!msg || !msg.text) continue;

          const chat = msg.chat;
          const isGroup = chat.type === 'group' || chat.type === 'supergroup';

          // Group verification if configured
          if (isGroup && TELEGRAM_GROUP_NAME) {
            const chatTitle = normalizeText(chat.title);
            const expected = normalizeText(TELEGRAM_GROUP_NAME);
            if (!chatTitle.includes(expected)) {
              console.log(`[Telegram Filter] Message ignored from group "${chat.title}" (expecting "${TELEGRAM_GROUP_NAME}")`);
              continue;
            }
          }

          const senderName = msg.from?.first_name || msg.from?.username || 'User';
          const text = msg.text.trim();

          console.log(`📩 [Telegram] Message from ${senderName} in "${chat.title || 'Private'}": "${text}"`);

          try {
            const botRes = await fetch(CASAFINANCE_API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: text,
                sender: senderName,
                token: BOT_API_TOKEN,
              }),
            });

            if (botRes.ok) {
              const botData = await botRes.json();
              if (botData.reply) {
                console.log(`📤 [Telegram] Sending reply to chat ${chat.id}`);
                await sendMessage(chat.id, botData.reply);
              }
            }
          } catch (err) {
            console.error('Error connecting to CasaFinance API:', err.message);
          }
        }
      }
    } catch (err) {
      console.error('Error in Telegram polling loop:', err.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

startPolling();
