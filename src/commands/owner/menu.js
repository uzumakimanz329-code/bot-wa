const fs = require('fs')
const path = require('path')

const CHANNEL_FILE =
    path.join(
        process.cwd(),
        'database',
        'channel.json'
    )

module.exports = {

    name: 'menu',
    owner: true,

    async execute(sock, msg) {

        const jid =
            msg.key.remoteJid

        const menu =
`╭━━「 👑 MANZ BOT 」━━╮
┃
┃ 👑 OWNER
┃ ├─ .menu
┃ └─ .owner
┃
┃ ⚡ UMUM
┃ └─ .ping
┃
┃ 👥 GROUP
┃ ├─ .creategroup
┃ ├─ .deletegroup
┃ ├─ .add
┃ ├─ .kick
┃ ├─ .promote
┃ └─ .demote
┃
┃ 📤 MESSAGING
┃ ├─ .send
┃ └─ .sendlist
┃
┃ 📥 DOWNLOADER
┃ ├─ .play
┃ ├─ .yt
┃ ├─ .tiktok
┃ └─ .rvo
┃
┃ 🖼️ STICKER
┃ ├─ .sticker
┃ └─ .toimg
┃
┃ 🎨 MAKER
┃ ├─ .textmeme
┃ ├─ .quote
┃ ├─ .caption
┃ └─ .whitebg
┃
┃ 🛠️ TOOLS
┃ ├─ .qrcode
┃ └─ .ss
┃
┃ 🤖 AI
┃ ├─ .ai
┃ ├─ .chat
┃ └─ .ask
┃
┃ 🎮 GAMES
┃ ├─ .game
┃ ├─ .slot
┃ └─ .tebak
┃
╰━━━━━━━━━━━━━━━━━━━━╯`

        try {

            let channelLink = ''

            if (
                fs.existsSync(
                    CHANNEL_FILE
                )
            ) {

                try {

                    const channel =
                        JSON.parse(
                            fs.readFileSync(
                                CHANNEL_FILE,
                                'utf8'
                            )
                        )

                    if (
                        channel?.connected &&
                        channel?.link
                    ) {
                        channelLink =
                            channel.link
                    }

                } catch (err) {

                    console.error(
                        '⚠️ Gagal membaca channel.json:',
                        err.message
                    )
                }
            }

            let text =
                menu

            if (channelLink) {

                text +=
                    '\n\n' +
                    '━━━━━━━━━━━━━━━━━━━━\n' +
                    '📢 *Lihat Saluran MANZ BOT*\n' +
                    channelLink
            }

            await sock.sendMessage(
                jid,
                {
                    text
                }
            )

        } catch (err) {

            console.error(
                '❌ Menu Error:',
                err
            )

            try {

                await sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ Gagal menampilkan menu.\n\n' +
                            `Error: ${err.message}`
                    }
                )

            } catch {}
        }
    }
}