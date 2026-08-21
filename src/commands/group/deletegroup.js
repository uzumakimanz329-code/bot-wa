module.exports = {
    name: 'deletegroup',
    owner: true,

    async execute(sock, msg) {

        const jid = msg.key.remoteJid

        if (!jid.endsWith('@g.us')) {
            return sock.sendMessage(jid, {
                text:
                    '❌ Command ini hanya bisa digunakan di dalam group.'
            })
        }

        try {

            await sock.sendMessage(jid, {
                text:
                    '🗑️ Group akan ditutup untuk bot...\n\n' +
                    'Bot akan keluar dari group.'
            })

            await new Promise(
                resolve => setTimeout(resolve, 1500)
            )

            await sock.groupLeave(jid)

        } catch (err) {

            console.error(
                '❌ Delete Group Error:',
                err
            )

            await sock.sendMessage(jid, {
                text:
                    '❌ Gagal keluar dari group.\n\n' +
                    `Alasan: ${err.message}`
            })
        }
    }
}