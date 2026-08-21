module.exports = {
    name: 'kick',
    owner: true,

    async execute(sock, msg, { args }) {

        const jid = msg.key.remoteJid

        if (!jid.endsWith('@g.us')) {
            return sock.sendMessage(jid, {
                text:
                    '❌ Command ini hanya bisa digunakan di dalam group.'
            })
        }

        if (!args.length) {
            return sock.sendMessage(jid, {
                text:
                    '❌ Masukkan nomor member.\n\n' +
                    'Contoh:\n' +
                    '.kick 6281234567890'
            })
        }

        const number =
            args[0].replace(/\D/g, '')

        if (!number || number.length < 8) {
            return sock.sendMessage(jid, {
                text:
                    '❌ Nomor WhatsApp tidak valid.'
            })
        }

        const userJid =
            `${number}@s.whatsapp.net`

        try {

            const result =
                await sock.groupParticipantsUpdate(
                    jid,
                    [userJid],
                    'remove'
                )

            const status =
                result?.[0]?.status

            if (
                status === '200' ||
                status === 200
            ) {
                return sock.sendMessage(jid, {
                    text:
                        '✅ MEMBER BERHASIL DIKELUARKAN\n\n' +
                        `👤 Nomor: +${number}`
                })
            }

            return sock.sendMessage(jid, {
                text:
                    '⚠️ Gagal mengeluarkan member.\n' +
                    `Status: ${status || 'unknown'}`
            })

        } catch (err) {

            console.error(
                '❌ Kick Member Error:',
                err
            )

            await sock.sendMessage(jid, {
                text:
                    '❌ Gagal mengeluarkan member.\n\n' +
                    `Alasan: ${err.message}`
            })
        }
    }
}