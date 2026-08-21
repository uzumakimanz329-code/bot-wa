const fs = require('fs')
const path = require('path')

const CHANNEL_FILE =
    path.join(
        process.cwd(),
        'database',
        'channel.json'
    )

function getChannelData() {

    try {

        if (
            !fs.existsSync(
                CHANNEL_FILE
            )
        ) {
            return null
        }

        const data =
            JSON.parse(
                fs.readFileSync(
                    CHANNEL_FILE,
                    'utf8'
                )
            )

        if (
            !data?.connected ||
            !data?.link
        ) {
            return null
        }

        return data

    } catch (err) {

        console.error(
            '⚠️ Channel Data Error:',
            err.message
        )

        return null
    }
}

function addChannelFooter(
    text
) {

    if (
        typeof text !== 'string' ||
        !text
    ) {
        return text
    }

    const data =
        getChannelData()

    if (!data)
        return text

    if (
        text.includes(
            'whatsapp.com/channel/'
        )
    ) {
        return text
    }

    return (
        text +
        '\n\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '📢 *Lihat Saluran MANZ BOT*\n' +
        data.link
    )
}

module.exports = {
    getChannelData,
    addChannelFooter
}