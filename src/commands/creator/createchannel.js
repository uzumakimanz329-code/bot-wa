const fs = require('fs')
const path = require('path')

const CHANNEL_LINK =
    'https://whatsapp.com/channel/0029VbDUcLpFi8xmBQ1Od131'

const CHANNEL_FILE =
    path.join(
        process.cwd(),
        'database',
        'channel.json'
    )

module.exports = {

    name: 'createchannel',
    owner: true,

    async execute(
        sock,
        msg
    ) {

        const jid =
            msg.key.remoteJid

        try {

            if (
                typeof sock.newsletterMetadata !==
                'function'
            ) {

                return sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ Fitur Channel tidak tersedia pada Baileys ini.'
                    }
                )
            }

            console.log('')
            console.log(
                '╭──────── CHANNEL BIND ────────╮'
            )

            console.log(
                '📢 Channel:',
                CHANNEL_LINK
            )

            const invite =
                CHANNEL_LINK
                    .split('/channel/')
                    [1]

            console.log(
                '🔑 Invite:',
                invite
            )

            console.log(
                '⏳ Mengambil metadata Channel...'
            )

            const channel =
                await sock.newsletterMetadata(
                    'invite',
                    invite
                )

            console.log(
                '📦 Metadata:',
                channel
            )

            console.log(
                '╰──────────────────────────────╯'
            )

            if (
                !channel ||
                !channel.id
            ) {

                return sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ Channel ditemukan tetapi ID Channel tidak dapat diperoleh.'
                    }
                )
            }

            const databaseDir =
                path.dirname(
                    CHANNEL_FILE
                )

            if (
                !fs.existsSync(
                    databaseDir
                )
            ) {

                fs.mkdirSync(
                    databaseDir,
                    {
                        recursive: true
                    }
                )
            }

            const data = {

                id:
                    channel.id,

                name:
                    channel.name ||
                    'MANZ BOT',

                description:
                    channel.description ||
                    'Official Channel MANZ BOT 🤖',

                invite:
                    channel.invite ||
                    invite,

                link:
                    CHANNEL_LINK,

                connected:
                    true,

                updatedAt:
                    new Date().toISOString()
            }

            fs.writeFileSync(
                CHANNEL_FILE,
                JSON.stringify(
                    data,
                    null,
                    2
                )
            )

            let result =
                '╭━━「 📢 MANZ BOT CHANNEL 」━━╮\n' +
                '┃\n' +
                '┃ ✅ Channel berhasil dihubungkan!\n' +
                '┃\n' +
                `┃ 📛 Nama: ${data.name}\n` +
                `┃ 🆔 ID: ${data.id}\n` +
                '┃\n' +
                `┃ 🔗 ${data.link}\n` +
                '┃\n' +
                '┃ 💾 Status: TERHUBUNG\n' +
                '┃\n' +
                '╰━━━━━━━━━━━━━━━━━━━━━━━━╯'

            await sock.sendMessage(
                jid,
                {
                    text: result
                }
            )

        } catch (err) {

            console.error('')
            console.error(
                '╭──────── CHANNEL ERROR ────────╮'
            )

            console.error(
                err
            )

            console.error(
                '╰───────────────────────────────╯'
            )

            await sock.sendMessage(
                jid,
                {
                    text:
                        '❌ Gagal menghubungkan Channel.\n\n' +
                        `Error: ${err.message}\n\n` +
                        'Pastikan bot memiliki akses ke Channel tersebut dan link Channel masih aktif.'
                }
            )
        }
    }
}