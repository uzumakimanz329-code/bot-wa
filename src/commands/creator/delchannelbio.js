const fs = require('fs')
const path = require('path')

const CHANNEL_FILE =
    path.join(
        process.cwd(),
        'database',
        'channel.json'
    )

module.exports = {
    name: 'delchannelbio',
    owner: true,

    async execute(sock, msg) {

        const jid =
            msg.key.remoteJid

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

            await sock.newsletterUpdateDescription(
                data.id,
                ''
            )

            data.description = ''

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
                        '✅ Bio Channel berhasil dihapus.'
                }
            )

        } catch (err) {

            console.error(
                '❌ DelChannelBio Error:',
                err
            )

            await sock.sendMessage(
                jid,
                {
                    text:
                        '❌ Gagal menghapus bio Channel.\n\n' +
                        `Error: ${err.message}`
                }
            )
        }
    }
}