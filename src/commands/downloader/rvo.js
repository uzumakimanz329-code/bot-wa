const {
    downloadMediaMessage
} = require('@whiskeysockets/baileys')

module.exports = {
    name: 'rvo',
    owner: false,

    async execute(sock, msg) {

        const jid = msg.key.remoteJid

        try {

            const quoted =
                msg.message
                    ?.extendedTextMessage
                    ?.contextInfo
                    ?.quotedMessage

            if (!quoted) {
                return sock.sendMessage(jid, {
                    text:
                        '❌ Balas foto/video View Once dengan:\n\n' +
                        '.rvo'
                })
            }

            let type = null

            if (quoted.imageMessage) {
                type = 'image'
            }

            else if (quoted.videoMessage) {
                type = 'video'
            }

            if (!type) {
                return sock.sendMessage(jid, {
                    text:
                        '❌ Pesan yang dibalas bukan foto/video View Once.'
                })
            }

            // Bentuk pesan sementara untuk Baileys
            const fakeMsg = {
                key: msg.message
                    ?.extendedTextMessage
                    ?.contextInfo
                    ?.stanzaId
                    ? {
                        remoteJid:
                            msg.key.remoteJid,
                        id:
                            msg.message
                                .extendedTextMessage
                                .contextInfo
                                .stanzaId
                    }
                    : msg.key,

                message: quoted
            }

            const buffer =
                await downloadMediaMessage(
                    fakeMsg,
                    'buffer',
                    {},
                    {
                        logger: sock.logger,
                        reuploadRequest:
                            sock.updateMediaMessage
                    }
                )

            if (type === 'image') {

                await sock.sendMessage(jid, {
                    image: buffer,
                    caption:
                        quoted.imageMessage?.caption ||
                        '✅ View Once berhasil dibuka.'
                })

            } else {

                await sock.sendMessage(jid, {
                    video: buffer,
                    caption:
                        quoted.videoMessage?.caption ||
                        '✅ View Once berhasil dibuka.'
                })
            }

        } catch (err) {

            console.error(
                '❌ RVO Error:',
                err
            )

            await sock.sendMessage(jid, {
                text:
                    '❌ Gagal membuka View Once.\n\n' +
                    `Alasan: ${err.message}`
            })
        }
    }
}