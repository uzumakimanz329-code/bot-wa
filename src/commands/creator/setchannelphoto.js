const fs = require('fs')
const path = require('path')

const {
    downloadContentFromMessage
} = require('@whiskeysockets/baileys')

const CHANNEL_FILE =
    path.join(
        process.cwd(),
        'database',
        'channel.json'
    )

function unwrapMessage(message) {

    if (!message)
        return null

    if (message.ephemeralMessage)
        return unwrapMessage(
            message.ephemeralMessage.message
        )

    if (message.viewOnceMessage)
        return unwrapMessage(
            message.viewOnceMessage.message
        )

    if (message.viewOnceMessageV2)
        return unwrapMessage(
            message.viewOnceMessageV2.message
        )

    if (message.viewOnceMessageV2Extension)
        return unwrapMessage(
            message.viewOnceMessageV2Extension.message
        )

    return message
}

function getQuotedMessage(msg) {

    const message =
        msg.message || {}

    const context =
        message.extendedTextMessage
            ?.contextInfo ||
        message.imageMessage
            ?.contextInfo ||
        message.viewOnceMessage
            ?.message
            ?.imageMessage
            ?.contextInfo ||
        {}

    return unwrapMessage(
        context.quotedMessage
    )
}

async function downloadImage(
    imageMessage
) {

    const stream =
        await downloadContentFromMessage(
            imageMessage,
            'image'
        )

    const chunks = []

    for await (
        const chunk of stream
    ) {
        chunks.push(chunk)
    }

    return Buffer.concat(chunks)
}

module.exports = {

    name: 'setchannelphoto',

    owner: true,

    async execute(sock, msg) {

        const jid =
            msg.key.remoteJid

        try {

            /* ================= CHANNEL DATA ================= */

            if (
                !fs.existsSync(
                    CHANNEL_FILE
                )
            ) {

                return sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ Channel belum terhubung.'
                    }
                )
            }

            const data =
                JSON.parse(
                    fs.readFileSync(
                        CHANNEL_FILE,
                        'utf8'
                    )
                )

            if (!data.id) {

                return sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ ID Channel tidak ditemukan.'
                    }
                )
            }

            /* ================= QUOTED IMAGE ================= */

            const quoted =
                getQuotedMessage(msg)

            if (!quoted) {

                return sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ Reply foto terlebih dahulu.\n\n' +
                            'Contoh:\n' +
                            'Reply foto → .setchannelphoto'
                    }
                )
            }

            const image =
                quoted.imageMessage

            if (!image) {

                return sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ Pesan yang direply bukan foto.\n\n' +
                            'Reply gambar lalu gunakan:\n' +
                            '.setchannelphoto'
                    }
                )
            }

            /* ================= DOWNLOAD ================= */

            console.log(
                '📥 Mengunduh foto Channel...'
            )

            const buffer =
                await downloadImage(
                    image
                )

            if (
                !Buffer.isBuffer(buffer) ||
                buffer.length === 0
            ) {

                throw new Error(
                    'Buffer gambar kosong atau tidak valid.'
                )
            }

            console.log(
                '🖼️ Ukuran foto:',
                buffer.length,
                'bytes'
            )

            /* ================= UPDATE ================= */

            console.log(
                '📤 Mengubah foto Channel...'
            )

            /*
             * PENTING:
             *
             * newsletterUpdatePicture()
             * menerima Buffer langsung.
             *
             * JANGAN gunakan:
             *
             * { img: buffer }
             *
             * atau:
             *
             * { image: buffer }
             */

            await sock.newsletterUpdatePicture(
                data.id,
                buffer
            )

            /* ================= SAVE ================= */

            data.updatedAt =
                new Date().toISOString()

            fs.writeFileSync(
                CHANNEL_FILE,
                JSON.stringify(
                    data,
                    null,
                    2
                )
            )

            console.log(
                '✅ Foto Channel berhasil diperbarui.'
            )

            /* ================= SUCCESS ================= */

            await sock.sendMessage(
                jid,
                {
                    text:
                        '╭━━「 📢 CHANNEL 」━━╮\n' +
                        '┃\n' +
                        '┃ ✅ Foto Channel berhasil diubah!\n' +
                        '┃\n' +
                        `┃ 📛 ${data.name || 'MANZ BOT'}\n` +
                        '┃ 🖼️ Foto profil telah diperbarui.\n' +
                        '┃\n' +
                        '╰━━━━━━━━━━━━━━━━━━━━╯'
                }
            )

        } catch (err) {

            console.error(
                '❌ SetChannelPhoto Error:',
                err
            )

            try {

                await sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ Gagal mengubah foto Channel.\n\n' +
                            `Error: ${err.message}`
                    }
                )

            } catch (sendError) {

                console.error(
                    '❌ Gagal mengirim pesan error:',
                    sendError.message
                )
            }
        }
    }
}