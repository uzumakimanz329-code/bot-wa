module.exports = {

    name: 'react',
    owner: false,

    async execute(
        sock,
        msg,
        { args }
    ) {

        const jid =
            msg.key.remoteJid

        /*
         * =================================
         * CEK EMOJI
         * =================================
         */

        if (
            !args ||
            args.length === 0
        ) {

            return sock.sendMessage(
                jid,
                {
                    text:
                        '❌ Masukkan emoji.\n\n' +
                        'Contoh:\n' +
                        'Reply pesan → .react ❤️'
                }
            )
        }

        const emoji =
            args.join(' ')


        /*
         * =================================
         * CARI PESAN YANG DIREPLY
         * =================================
         */

        const message =
            msg.message || {}

        const context =
            message.extendedTextMessage?.contextInfo

        if (
            !context ||
            !context.stanzaId
        ) {

            return sock.sendMessage(
                jid,
                {
                    text:
                        '❌ Reply pesan yang ingin diberi reaction terlebih dahulu.\n\n' +
                        'Contoh:\n' +
                        'Reply pesan → .react ❤️'
                }
            )
        }


        /*
         * =================================
         * KIRIM REACTION
         * =================================
         */

        try {

            await sock.sendMessage(
                jid,
                {
                    react: {
                        text: emoji,
                        key: {
                            remoteJid: jid,
                            fromMe:
                                context.participant
                                    ? false
                                    : true,
                            id:
                                context.stanzaId,
                            participant:
                                context.participant
                        }
                    }
                }
            )

            console.log(
                `✓ React ${emoji} → ${context.stanzaId}`
            )

        } catch (err) {

            console.error(
                '❌ React Error:',
                err
            )

            await sock.sendMessage(
                jid,
                {
                    text:
                        '❌ Gagal memberikan reaction.\n\n' +
                        `Error: ${err.message}`
                }
            )
        }
    }
}