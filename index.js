const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers
} = require('@whiskeysockets/baileys')

const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')
const readline = require('readline')
const pino = require('pino')

/* ================= COMMAND LOADER ================= */

const commands =
    require('./src/handler/commands')

/* ================= CHANNEL FOOTER ================= */

const {
    addChannelFooter
} = require('./src/utils/channelFooter')

/* ================= CONFIG ================= */

const AUTH =
    './sessions'

const OWNER_NUMBER =
    '6282219477069'

/*
 * Reaction untuk command aktif
 */
const ACTIVE_REACTION =
    '⚡'

/* ================= READLINE ================= */

const rl =
    readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

const ask = q =>
    new Promise(
        resolve =>
            rl.question(q, resolve)
    )

const clean = n =>
    String(n || '')
        .replace(/\D/g, '')

/* ================= OWNER ================= */

function isOwner(
    msg,
    sock
) {

    if (msg.key.fromMe)
        return true

    const sender =
        msg.key.participant ||
        msg.key.remoteJid ||
        ''

    const id =
        sender
            .split('@')[0]
            .split(':')[0]

    if (
        clean(id) ===
        clean(OWNER_NUMBER)
    )
        return true

    const botId =
        sock.user?.id
            ?.split(':')[0] || ''

    if (
        clean(id) ===
        clean(botId)
    )
        return true

    const botLid =
        sock.user?.lid
            ?.split(':')[0] || ''

    if (
        clean(id) ===
        clean(botLid)
    )
        return true

    return false
}

/* ================= ACTIVE COMMAND REACTION ================= */

async function reactActiveCommand(
    sock,
    msg
) {

    try {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                react: {
                    text:
                        ACTIVE_REACTION,
                    key:
                        msg.key
                }
            }
        )

    } catch (err) {

        console.error(
            '⚠️ Gagal memberi reaction:',
            err.message
        )
    }
}

/* ================= BOT ================= */

async function startBot() {

    const {
        state,
        saveCreds
    } =
        await useMultiFileAuthState(
            AUTH
        )

    console.clear()

    let method =
        'session'

    /* ================= LOGIN ================= */

    if (
        !state.creds.registered
    ) {

        console.log(`
╭──────────────────────────────╮
│       WHATSAPP BOT           │
│        MANZ BOT              │
├──────────────────────────────┤
│  1. QR Code                  │
│  2. Pairing Code             │
╰──────────────────────────────╯
`)

        method =
            (
                await ask(
                    'Pilih [1/2]: '
                )
            ).trim()

        while (
            !['1', '2']
                .includes(method)
        ) {

            method =
                (
                    await ask(
                        'Pilih [1/2]: '
                    )
                ).trim()
        }

    } else {

        console.log(
            '✓ Session ditemukan.'
        )

        console.log(
            '✓ Menghubungkan kembali...\n'
        )
    }

    const pairing =
        method === '2'

    let requested =
        false

    /* ================= SOCKET ================= */

    const sock =
        makeWASocket({

            auth:
                state,

            printQRInTerminal:
                false,

            browser:
                Browsers.ubuntu(
                    'Chrome'
                ),

            /*
             * DEBUG SEMENTARA
             *
             * Dipakai untuk melihat
             * error upload media.
             */
            logger:
                pino({
                    level:
                        'debug'
                })
        })

    /* ================= CHANNEL FOOTER ================= */

    const originalSendMessage =
        sock.sendMessage.bind(sock)

    sock.sendMessage = async (
        targetJid,
        content,
        options
    ) => {

        try {

            const isNewsletter =
                String(targetJid || '')
                    .endsWith('@newsletter')

            if (
                !isNewsletter &&
                content &&
                typeof content.text === 'string'
            ) {

                content = {
                    ...content,

                    text:
                        addChannelFooter(
                            content.text
                        )
                }
            }

        } catch (err) {

            console.error(
                '⚠️ Gagal menambahkan Channel Footer:',
                err.message
            )
        }

        return originalSendMessage(
            targetJid,
            content,
            options
        )
    }

    /* ================= CREDENTIAL ================= */

    sock.ev.on(
        'creds.update',
        saveCreds
    )

    /* ================= CONNECTION ================= */

    sock.ev.on(
        'connection.update',
        async ({
            connection,
            lastDisconnect,
            qr
        }) => {

            /* ===== QR CODE ===== */

            if (
                qr &&
                !pairing &&
                !state.creds.registered
            ) {

                console.log(
                    '\n📱 Scan QR:\n'
                )

                qrcode.generate(
                    qr,
                    {
                        small:
                            true
                    }
                )
            }

            /* ===== PAIRING CODE ===== */

            if (
                qr &&
                pairing &&
                !state.creds.registered &&
                !requested
            ) {

                requested =
                    true

                try {

                    const n =
                        clean(
                            await ask(
                                '\nNomor WhatsApp: '
                            )
                        )

                    if (!n) {

                        console.log(
                            '❌ Nomor tidak valid.'
                        )

                        requested =
                            false

                        return
                    }

                    const code =
                        await sock
                            .requestPairingCode(
                                n
                            )

                    console.log(
                        '\n🔑 Pairing Code:',
                        code
                    )

                } catch (e) {

                    console.log(
                        '❌ Pairing gagal:',
                        e.message
                    )

                    requested =
                        false
                }
            }

            /* ===== ONLINE ===== */

            if (
                connection ===
                'open'
            ) {

                console.log(
                    '\n✓ MANZ BOT ONLINE\n'
                )
            }

            /* ===== CONNECTION CLOSE ===== */

            if (
                connection ===
                'close'
            ) {

                const code =
                    new Boom(
                        lastDisconnect?.error
                    )?.output?.statusCode

                if (
                    code !==
                    DisconnectReason.loggedOut
                ) {

                    console.log(
                        '🔄 Reconnecting...'
                    )

                    startBot()

                } else {

                    console.log(
                        '❌ Session logout.'
                    )
                }
            }
        }
    )

    /* ================= MESSAGE ================= */

    sock.ev.on(
        'messages.upsert',
        async ({
            messages
        }) => {

            const msg =
                messages[0]

            if (
                !msg?.message
            )
                return

            const jid =
                msg.key.remoteJid

            if (
                !jid ||
                jid ===
                'status@broadcast'
            )
                return

            /* ===== TEXT ===== */

            const text =
                msg.message
                    .conversation ||
                msg.message
                    .extendedTextMessage
                    ?.text ||
                ''

            if (
                !text.trim()
            )
                return

            /* ===== COMMAND ===== */

            const parts =
                text
                    .trim()
                    .split(/\s+/)

            const rawCommand =
                parts[0]
                    .toLowerCase()

            if (
                !rawCommand
                    .startsWith('.')
            )
                return

            const commandName =
                rawCommand.slice(1)

            const args =
                parts.slice(1)

            /* ===== OWNER ===== */

            const owner =
                isOwner(
                    msg,
                    sock
                )

            console.log(
                `[${owner ? 'OWNER' : 'USER'}] ${jid}: ${text}`
            )

            /* ===== COMMAND LOOKUP ===== */

            const command =
                commands.get(
                    commandName
                )

            if (!command)
                return

            /* ===== OWNER ONLY ===== */

            if (
                command.owner &&
                !owner
            ) {

                return sock.sendMessage(
                    jid,
                    {
                        text:
                            '🔒 Command ini khusus owner.'
                    }
                )
            }

            /* ===== COMMAND AKTIF ===== */

            await reactActiveCommand(
                sock,
                msg
            )

            /* ===== EXECUTE ===== */

            try {

                await command.execute(
                    sock,
                    msg,
                    {
                        text,
                        args,
                        owner
                    }
                )

            } catch (err) {

                console.error(
                    `❌ Error command .${commandName}:`,
                    err
                )

                await sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ Terjadi kesalahan saat menjalankan command.'
                    }
                )
            }
        }
    )
}

/* ================= START ================= */

startBot().catch(err => {

    console.error(
        '\n❌ Fatal Error:\n',
        err
    )

})