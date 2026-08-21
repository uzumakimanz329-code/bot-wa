const QRCode = require('qrcode')

module.exports = {

    name: 'qrcode',
    owner: false,

    async execute(sock, msg) {

        const jid =
            msg.key.remoteJid

        try {

            // Ambil nomor WhatsApp bot
            const botId =
                sock.user?.id || ''

            const number =
                botId
                    .split(':')[0]
                    .split('@')[0]
                    .replace(/\D/g, '')

            if (!number) {

                return sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ Nomor bot tidak dapat ditemukan.'
                    }
                )
            }

            // Link langsung menuju chat bot
            const waLink =
                `https://wa.me/${number}`

            // Generate QR
            const qrBuffer =
                await QRCode.toBuffer(
                    waLink,
                    {
                        type: 'png',
                        width: 800,
                        margin: 3,
                        errorCorrectionLevel: 'H'
                    }
                )

            // Kirim QR
            await sock.sendMessage(
                jid,
                {
                    image: qrBuffer,
                    caption:
                        '🤖 *MANZ BOT*\n\n' +
                        '📱 Scan QR ini untuk langsung membuka chat dengan bot.\n\n' +
                        `☎️ Nomor Bot: +${number}\n\n` +
                        '⚡ QR ini adalah QR chat WhatsApp, bukan QR login.\n' +
                        'QR tidak memiliki masa berlaku seperti QR login.'
                }
            )

            console.log(
                `✓ QR Code bot dikirim: ${number}`
            )

        } catch (err) {

            console.error(
                '❌ QRCode Error:',
                err
            )

            await sock.sendMessage(
                jid,
                {
                    text:
                        '❌ Gagal membuat QR Code.\n\n' +
                        `Error: ${err.message}`
                }
            )
        }
    }
}