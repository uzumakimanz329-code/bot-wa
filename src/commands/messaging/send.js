const targets =
    require('./targets')

module.exports = {
    name: 'send',
    owner: true,

    async execute(sock, msg, { args }) {

        const jid =
            msg.key.remoteJid

        /*
         * =========================
         * VALIDASI
         * =========================
         */

        if (args.length < 2) {

            return sock.sendMessage(
                jid,
                {
                    text:
                        '❌ Format salah.\n\n' +
                        '📌 Dari Send List:\n' +
                        '.send 1 Halo 👋\n\n' +
                        '📌 Nomor langsung:\n' +
                        '.send 628123456789 Halo 👋\n\n' +
                        '📌 Grup langsung:\n' +
                        '.send 1234567890-123456789@g.us Halo'
                }
            )
        }

        const targetInput =
            args[0]

        const message =
            args
                .slice(1)
                .join(' ')

        let target = null
        let targetInfo = null

        /*
         * =========================
         * CEK NOMOR LIST
         * =========================
         */

        if (
            /^\d+$/.test(targetInput)
        ) {

            targetInfo =
                targets.getTarget(
                    jid,
                    Number(targetInput)
                )

            /*
             * Kalau ditemukan di Send List
             */

            if (targetInfo) {

                target =
                    targetInfo.jid

                console.log(
                    `✓ LIST ${targetInput} → ${target}`
                )
            }
        }

        /*
         * =========================
         * JIKA TIDAK DITEMUKAN DI LIST
         * =========================
         *
         * Angka panjang dianggap nomor
         * WhatsApp langsung.
         */

        if (!target) {

            if (
                /^\d+$/.test(targetInput)
            ) {

                /*
                 * Angka pendek seperti 1, 2, 3
                 * dianggap nomor list.
                 */

                if (
                    targetInput.length <= 4
                ) {

                    return sock.sendMessage(
                        jid,
                        {
                            text:
                                `❌ List nomor ${targetInput} tidak ditemukan.\n\n` +
                                'Silakan jalankan .sendlist terlebih dahulu.'
                        }
                    )
                }

                /*
                 * Nomor WhatsApp langsung
                 */

                target =
                    `${targetInput}@s.whatsapp.net`

            } else {

                /*
                 * Bisa berupa JID group
                 */

                target =
                    targetInput
            }
        }

        /*
         * =========================
         * VALIDASI TARGET
         * =========================
         */

        if (
            !target.endsWith(
                '@s.whatsapp.net'
            ) &&
            !target.endsWith(
                '@g.us'
            )
        ) {

            return sock.sendMessage(
                jid,
                {
                    text:
                        '❌ Tujuan tidak valid.'
                }
            )
        }

        /*
         * =========================
         * KIRIM
         * =========================
         */

        try {

            console.log(
                `📤 Mengirim ke: ${target}`
            )

            await sock.sendMessage(
                target,
                {
                    text: message
                }
            )

            /*
             * =========================
             * KONFIRMASI
             * =========================
             */

            const tujuan =
                targetInfo
                    ? `${targetInfo.name} (${targetInfo.type})`
                    : target

            await sock.sendMessage(
                jid,
                {
                    text:
                        '✅ Pesan berhasil dikirim.\n\n' +
                        `📤 Tujuan: ${tujuan}\n` +
                        `📝 Pesan: ${message}`
                }
            )

            console.log(
                `✓ SEND → ${target}`
            )

        } catch (err) {

            console.error(
                '❌ Send Error:',
                err
            )

            /*
             * Jangan membuat error kedua
             * kalau koneksi WhatsApp sudah putus.
             */

            try {

                await sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ Gagal mengirim pesan.\n\n' +
                            `Error: ${err.message}`
                    }
                )

            } catch (replyError) {

                console.error(
                    '❌ Gagal mengirim laporan error:',
                    replyError.message
                )
            }
        }
    }
}