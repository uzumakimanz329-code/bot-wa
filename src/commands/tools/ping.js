module.exports = {
    name: 'ping',
    owner: false,

    async execute(sock, msg) {
        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '🏓 Pong!\nMANZ BOT ONLINE'
            }
        )
    }
}