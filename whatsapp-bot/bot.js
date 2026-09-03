import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';

const CASAFINANCE_API_URL = process.env.CASAFINANCE_API_URL || 'http://casafinance:3000/api/bot';
const BOT_API_TOKEN = process.env.BOT_API_TOKEN || '';
const AUTH_DIR = process.env.AUTH_DIR || './auth_info_baileys';

function normalizeText(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

let dynamicGroupName = '';

async function fetchDynamicSettings() {
  try {
    const settingsUrl = CASAFINANCE_API_URL.replace('/api/bot', '/api/settings');
    const headers = {};
    if (BOT_API_TOKEN) headers['Authorization'] = `Bearer ${BOT_API_TOKEN}`;
    const res = await fetch(settingsUrl, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.whatsappGroupName) {
        dynamicGroupName = data.whatsappGroupName;
      }
    }
  } catch (e) {
    // Fallback to environment or default
  }
}

const groupMetadataCache = new Map();

async function refreshAllGroups(sock) {
  try {
    const groups = await sock.groupFetchAllParticipating();
    for (const [id, group] of Object.entries(groups)) {
      if (group?.subject) {
        groupMetadataCache.set(id, group.subject);
      }
    }
  } catch (e) {
    // Ignore initial fetch error
  }
}

async function isAllowedGroup(sock, jid) {
  // STRICT SECURITY: Only listen inside WhatsApp groups (@g.us).
  if (!jid || !jid.endsWith('@g.us')) {
    return false;
  }

  // Refresh dynamic group setting from web app
  if (!dynamicGroupName) {
    await fetchDynamicSettings();
  }

  const configuredGroup = normalizeText(dynamicGroupName || process.env.ALLOWED_GROUP_NAMES || 'gastos casa');

  let subject = groupMetadataCache.get(jid);
  if (!subject) {
    try {
      const metadata = await sock.groupMetadata(jid);
      subject = metadata?.subject || '';
      if (subject) {
        groupMetadataCache.set(jid, subject);
      }
    } catch (e) {
      await refreshAllGroups(sock);
      subject = groupMetadataCache.get(jid) || '';
    }
  }

  const subjectNorm = normalizeText(subject);
  const isMatch =
    subjectNorm.includes(configuredGroup) ||
    (configuredGroup === 'gastos casa' && (subjectNorm.includes('gastos') || subjectNorm.includes('casafinance') || subjectNorm.includes('home expenses')));

  if (!isMatch && subject) {
    console.log(`[Filtro] Mensaje ignorado del grupo "${subject}" (esperando grupo con nombre: "${configuredGroup}")`);
  }

  return isMatch;
}

function extractMessageText(m) {
  if (!m) return '';
  if (m.conversation) return m.conversation;
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  if (m.imageMessage?.caption) return m.imageMessage.caption;
  if (m.videoMessage?.caption) return m.videoMessage.caption;
  if (m.ephemeralMessage?.message) return extractMessageText(m.ephemeralMessage.message);
  if (m.viewOnceMessage?.message) return extractMessageText(m.viewOnceMessage.message);
  if (m.viewOnceMessageV2?.message) return extractMessageText(m.viewOnceMessageV2.message);
  if (m.documentWithCaptionMessage?.message) return extractMessageText(m.documentWithCaptionMessage.message);
  return '';
}

const STATUS_API_URL = CASAFINANCE_API_URL.replace('/api/bot', '/api/bot/status');

async function postStatus(payload) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (BOT_API_TOKEN) headers['Authorization'] = `Bearer ${BOT_API_TOKEN}`;
    await fetch(STATUS_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // Ignore network error during boot
  }
}

async function startBot() {
  const logger = pino({ level: 'silent', enabled: false });
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ['CasaFinance Server', 'Desktop', '1.0.0'],
    syncFullHistory: false,
  });

  sock.ev.on('creds.update', saveCreds);

  // Periodic poll to check if user clicked "Disconnect" from CasaFinance Web UI
  const logoutInterval = setInterval(async () => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (BOT_API_TOKEN) headers['Authorization'] = `Bearer ${BOT_API_TOKEN}`;
      const res = await fetch(STATUS_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'check_logout' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.logoutRequested) {
          console.log('🚪 Logout requested from Web UI. Disconnecting WhatsApp session...');
          clearInterval(logoutInterval);
          try {
            await sock.logout();
          } catch (e) {}
          await postStatus({ status: 'disconnected' });
          setTimeout(() => startBot(), 2000);
        }
      }
    } catch (e) {}
  }, 4000);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('\n=============================================');
      console.log('📱 ESCANEA ESTE CÓDIGO QR CON WHATSAPP:');
      console.log('Abre WhatsApp > Ajustes / Menú > Dispositivos Vinculados > Vincular');
      console.log('=============================================\n');
      try {
        const qrString = await QRCode.toString(qr, { type: 'terminal', small: true });
        console.log(qrString);
      } catch (err) {
        console.error('Error generando código QR en terminal:', err.message);
      }

      // Generate Data URL for CasaFinance Web UI
      try {
        const qrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
        await postStatus({ status: 'qr_ready', qr: qrDataUrl });
      } catch (e) {
        // Ignore
      }
    }

    if (connection === 'close') {
      const isLoggedOut =
        lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;
      if (isLoggedOut) {
        await postStatus({ status: 'disconnected' });
      }
      const shouldReconnect = !isLoggedOut;
      console.log('Connection closed. Reconnecting:', shouldReconnect);
      clearInterval(logoutInterval);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('✅ CasaFinance WhatsApp Bot connected and active.');
      await postStatus({ status: 'connected', phone: sock.user?.id });
      await refreshAllGroups(sock);
      await fetchDynamicSettings();
      console.log(`🔒 Group filter active: Listening only in "${dynamicGroupName || 'Gastos Casa'}"`);
    }
  });

  const sentMessageIds = new Set();

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;

      const remoteJid = msg.key.remoteJid || '';

      // STRICT SAFETY: Check if this is the authorized household group
      const allowed = await isAllowedGroup(sock, remoteJid);
      if (!allowed) {
        // Silently ignore all private messages and other non-household groups!
        continue;
      }

      // Ignore messages generated by the bot itself
      if (msg.key.id && sentMessageIds.has(msg.key.id)) {
        sentMessageIds.delete(msg.key.id);
        continue;
      }

      const text = extractMessageText(msg.message).trim();
      if (!text) continue;

      // Ignore standard bot automated responses
      if (
        text.startsWith('✅ *Gasto') ||
        text.startsWith('✅ *Expense') ||
        text.startsWith('🏠 *CasaFinance') ||
        text.startsWith('⚖️ *Balance') ||
        text.startsWith('📊 *Resumen') ||
        text.startsWith('📊 *CasaFinance Summary') ||
        text.startsWith('📝 *Últimos') ||
        text.startsWith('📝 *Latest') ||
        text.startsWith('❓ No he detectado') ||
        text.startsWith('❓ Unrecognized')
      ) {
        continue;
      }

      const senderJid = msg.key.participant || remoteJid;
      const pushName = msg.pushName || (msg.key.fromMe ? 'Tú' : '');

      console.log(`📩 [WhatsApp] Message from ${pushName || senderJid}: "${text}"`);

      try {
        const res = await fetch(CASAFINANCE_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            sender: pushName || senderJid,
            token: BOT_API_TOKEN,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.reply) {
            console.log(`📤 [WhatsApp] Reply sent to ${msg.key.remoteJid}:`, data.reply.split('\n')[0]);
            const sent = await sock.sendMessage(msg.key.remoteJid, { text: data.reply });
            if (sent?.key?.id) {
              sentMessageIds.add(sent.key.id);
            }
          }
        } else {
          console.error(`❌ Error from CasaFinance API (${res.status}):`, await res.text());
        }
      } catch (err) {
        console.error('❌ Error connecting to CasaFinance API:', err.message);
      }
    }
  });
}

startBot().catch((err) => console.error('Error starting WhatsApp bot:', err));
