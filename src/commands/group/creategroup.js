module.exports = {
    name: 'creategroup',
    owner: true,

    async execute(sock, msg, { args }) {

        const jid = msg.key.remoteJid

        if (!args.length) {
            return sock.sendMessage(jid, {
                text:
                    '❌ Masukkan nama group.\n\n' +
                    'Contoh:\n' +
                    '.creategroup MANZ COMMUNITY'
            })
        }

        const subject = args.join(' ').trim()

        if (!subject) {
            return sock.sendMessage(jid, {
                text: '❌ Nama group tidak boleh kosong.'
            })
        }

        try {

            const group = await sock.groupCreate(subject, [])

            await sock.sendMessage(jid, {
                text:
                    '✅ GROUP BERHASIL DIBUAT\n\n' +
                    `📌 Nama: ${subject}\n` +
                    `🆔 ID: ${group.id}`
            })

        } catch (err) {

            console.error(
                'Create Group Error:',
                err
            )

            await sock.sendMessage(jid, {
                text:
                    '❌ Gagal membuat group.\n' +
                    `Alasan: ${err.message}`
            })
        }
    }
}