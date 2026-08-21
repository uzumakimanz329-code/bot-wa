const fs = require('fs')
const path = require('path')

const IMAGE =
    path.join(
        process.cwd(),
        'media',
        'menu.jpg'
    )

module.exports = {

    name: 'testimage',
    owner: true,

    async execute(sock, msg) {

        const jid =
            msg.key.remoteJid

        try {

            if (!fs.existsSync(IMAGE)) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ media/menu.jpg tidak ditemukan.'
                    }
                )
            }

            console.log(
                '📤 Test upload gambar...'
            )

            await sock.sendMessage(
                jid,
                {
                    image:
                        fs.readFileSync(
                            IMAGE
                        )
                }
            )

            console.log(
                '✅ Test gambar berhasil.'
            )

        } catch (err) {

            console.error(
                '❌ TestImage Error:',
                err
            )

            await sock.sendMessage(
                jid,
                {
                    text:
                        '❌ Upload gambar gagal.\n\n' +
                        err.message
                }
            )
        }
    }
}