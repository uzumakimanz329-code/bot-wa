const fs = require('fs')
const path = require('path')

const CHANNEL_FILE =
    path.join(
        process.cwd(),
        'database',
        'channel.json'
    )

module.exports = {
    name: 'channelinfo',
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
                            '❌ Channel belum terhubung.\n\n' +
                            'Gunakan .createchannel terlebih dahulu.'
                    }
                )
            }

            const saved =
                JSON.parse(
                    fs.readFileSync(
                        CHANNEL_FILE,
                        'utf8'
                    )
                )

            if (
                !saved.id ||
                !saved.invite
            ) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ Data Channel tidak lengkap.'
                    }
                )
            }

            let channel =
                await sock.newsletterMetadata(
                    'invite',
                    saved.invite
                )

            const name =
                channel?.thread_metadata?.name?.text ||
                channel?.name ||
                saved.name ||
                'MANZ BOT'

            const description =
                channel?.thread_metadata?.description?.text ||
                channel?.description ||
                saved.description ||
                '-'

            const state =
                channel?.state?.type ||
                'UNKNOWN'

            const subscribers =
                channel?.thread_metadata?.subscribers_count ||
                channel?.subscribers ||
                '0'

            const verification =
                channel?.thread_metadata?.verification ||
                channel?.verification ||
                'UNVERIFIED'

            const link =
                saved.link ||
                `https://whatsapp.com/channel/${saved.invite}`

            const text =
                '╭━━「 📢 CHANNEL INFO 」━━╮\n' +
                '┃\n' +
                `┃ 📛 Nama: ${name}\n` +
                `┃ 🆔 ID: ${saved.id}\n` +
                `┃ 📡 Status: ${state}\n` +
                `┃ 👥 Subscribers: ${subscribers}\n` +
                `┃ 🔐 Verification: ${verification}\n` +
                '┃\n' +
                `┃ 📝 ${description}\n` +
                '┃\n' +
                `┃ 🔗 ${link}\n` +
                '┃\n' +
                '╰━━━━━━━━━━━━━━━━━━━━╯'

            await sock.sendMessage(
                jid,
                {
                    text
                }
            )

        } catch (err) {

            console.error(
                '❌ ChannelInfo Error:',
                err
            )

            await sock.sendMessage(
                jid,
                {
                    text:
                        '❌ Gagal mengambil informasi Channel.\n\n' +
                        `Error: ${err.message}`
                }
            )
        }
    }
}