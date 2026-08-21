const targets =
    require('./targets')

module.exports = {
    name: 'sendlist',
    owner: true,

    async execute(sock, msg) {

        const jid =
            msg.key.remoteJid

        try {

            /*
             * =========================
             * CONTACT
             * =========================
             */

            const contactList = []

            const contacts =
                sock.store?.contacts || {}

            for (
                const [contactJid, contact]
                of Object.entries(contacts)
            ) {

                if (
                    !contactJid.endsWith(
                        '@s.whatsapp.net'
                    )
                ) {
                    continue
                }

                const contactNumber =
                    contactJid
                        .split('@')[0]
                        .split(':')[0]

                const botNumber =
                    sock.user?.id
                        ?.split(':')[0]
                        ?.split('@')[0]

                /*
                 * Jangan masukkan nomor bot sendiri
                 */

                if (
                    contactNumber === botNumber
                ) {
                    continue
                }

                const name =
                    contact.name ||
                    contact.notify ||
                    contact.verifiedName ||
                    contactNumber

                contactList.push({
                    jid: contactJid,
                    name
                })
            }

            /*
             * =========================
             * GROUP
             * =========================
             */

            const groups =
                await sock.groupFetchAllParticipating()

            const groupList =
                Object.values(
                    groups || {}
                )

            /*
             * =========================
             * BUAT TARGET LIST
             * =========================
             */

            const targetList = []

            /*
             * CONTACT
             */

            for (
                const contact
                of contactList
            ) {

                targetList.push({

                    number:
                        targetList.length + 1,

                    type:
                        'contact',

                    jid:
                        contact.jid,

                    name:
                        contact.name
                })
            }

            /*
             * GROUP
             */

            for (
                const group
                of groupList
            ) {

                targetList.push({

                    number:
                        targetList.length + 1,

                    type:
                        'group',

                    jid:
                        group.id,

                    name:
                        group.subject
                })
            }

            /*
             * =========================
             * SIMPAN TARGET
             * =========================
             */

            targets.setTargets(
                jid,
                targetList
            )

            /*
             * =========================
             * MENU
             * =========================
             */

            let text =
                '╭━━━「 📤 SEND LIST 」━━━╮\n' +
                '┃\n'

            /*
             * CONTACT
             */

            text +=
                '┃ 👤 CONTACT\n'

            if (
                !contactList.length
            ) {

                text +=
                    '┃ └─ Tidak ada kontak.\n'

            } else {

                contactList.forEach(
                    (contact, index) => {

                        text +=
                            `┃ ${index + 1}. ${contact.name}\n`
                    }
                )
            }

            /*
             * GROUP
             */

            text +=
                '┃\n' +
                '┃ 👥 GROUP\n'

            if (
                !groupList.length
            ) {

                text +=
                    '┃ └─ Tidak ada grup.\n'

            } else {

                const startNumber =
                    contactList.length + 1

                groupList.forEach(
                    (group, index) => {

                        text +=
                            `┃ ${startNumber + index}. ${group.subject}\n`
                    }
                )
            }

            /*
             * =========================
             * FOOTER
             * =========================
             */

            text +=
                '┃\n' +
                '┃ Gunakan:\n' +
                '┃ .send nomor pesan\n' +
                '┃\n' +
                '┃ Contoh:\n' +
                '┃ .send 1 Halo 👋\n' +
                '┃ .send 2 Selamat pagi\n' +
                '┃\n' +
                '╰━━━━━━━━━━━━━━━━━━━━━━╯'

            await sock.sendMessage(
                jid,
                {
                    text
                }
            )

            console.log(
                `✓ SendList tersimpan: ${targetList.length} target`
            )

        } catch (err) {

            console.error(
                '❌ Sendlist Error:',
                err
            )

            try {

                await sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ Gagal mengambil daftar Contact/Group.\n\n' +
                            `Error: ${err.message}`
                    }
                )

            } catch (replyError) {

                console.error(
                    '❌ Gagal mengirim pesan error:',
                    replyError.message
                )
            }
        }
    }
}