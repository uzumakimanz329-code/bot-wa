module.exports = {
    name: 'add',
    owner: true,

    async execute(sock, msg, { args }) {

        const jid = msg.key.remoteJid

        /* ================= CEK GROUP ================= */

        if (!jid.endsWith('@g.us')) {
            return sock.sendMessage(jid, {
                text:
                    '❌ Command ini hanya bisa digunakan di dalam group.'
            })
        }

        /* ================= CEK NOMOR ================= */

        if (!args.length) {
            return sock.sendMessage(jid, {
                text:
                    '❌ Masukkan nomor WhatsApp.\n\n' +
                    'Contoh:\n' +
                    '.add 6281234567890'
            })
        }

        const number =
            args[0]
                .replace(/\D/g, '')

        if (!number || number.length < 8) {
            return sock.sendMessage(jid, {
                text:
                    '❌ Nomor WhatsApp tidak valid.'
            })
        }

        const userJid =
            `${number}@s.whatsapp.net`

        /* ================= ADD MEMBER ================= */

        try {

            const result =
                await sock.groupParticipantsUpdate(
                    jid,
                    [userJid],
                    'add'
                )

            const status =
                result?.[0]?.status

            if (
                status === '200' ||
                status === 200
            ) {

                return sock.sendMessage(jid, {
                    text:
                        '✅ MEMBER BERHASIL DITAMBAHKAN\n\n' +
                        `👤 Nomor: +${number}`
                })

            }

            if (
                status === '403' ||
                status === 403
            ) {

                return sock.sendMessage(jid, {
                    text:
                        '❌ Gagal menambahkan member.\n' +
                        'Nomor tersebut mungkin membatasi penambahan ke group.'
                })
            }

            if (
                status === '409' ||
                status === 409
            ) {

                return sock.sendMessage(jid, {
                    text:
                        'ℹ️ Nomor tersebut sudah menjadi member group.'
                })
            }

            return sock.sendMessage(jid, {
                text:
                    '⚠️ Tidak dapat menambahkan nomor tersebut.\n' +
                    `Status: ${status || 'unknown'}`
            })

        } catch (err) {

            console.error(
                '❌ Add Member Error:',
                err
            )

            await sock.sendMessage(jid, {
                text:
                    '❌ Gagal menambahkan member.\n\n' +
                    `Alasan: ${err.message}`
            })
        }
    }
}