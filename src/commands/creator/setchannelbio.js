const fs = require('fs')
const path = require('path')

const CHANNEL_FILE =
    path.join(
        process.cwd(),
        'database',
        'channel.json'
    )

module.exports = {
    name: 'setchannelbio',
    owner: true,

    async execute(sock, msg, { args }) {

        const jid =
            msg.key.remoteJid

        if (
            !args ||
            args.length === 0
        ) {
            return sock.sendMessage(
                jid,
                {
                    text:
                        '❌ Masukkan bio Channel.\n\n' +
                        'Contoh:\n' +
                        '.setchannelbio Official Channel MANZ BOT 🤖'
                }
            )
        }

        try {

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

            const description =
                args.join(' ').trim()

            await sock.newsletterUpdateDescription(
                data.id,
                description
            )

            data.description =
                description

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

            await sock.sendMessage(
                jid,
                {
                    text:
                        '✅ *Bio Channel berhasil diubah!*\n\n' +
                        `📢 ${data.name}\n` +
                        `📝 ${description}`
                }
            )

        } catch (err) {

            console.error(
                '❌ SetChannelBio Error:',
                err
            )

            await sock.sendMessage(
                jid,
                {
                    text:
                        '❌ Gagal mengubah bio Channel.\n\n' +
                        `Error: ${err.message}`
                }
            )
        }
    }
}