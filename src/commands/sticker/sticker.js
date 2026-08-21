const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process')

const {
    downloadContentFromMessage
} = require('@whiskeysockets/baileys')


const FONT =
    '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf'


function runFFmpeg(args) {

    return new Promise((resolve, reject) => {

        execFile(
            'ffmpeg',
            args,
            {
                maxBuffer: 1024 * 1024 * 10
            },
            (error, stdout, stderr) => {

                if (error) {

                    console.error(
                        'FFmpeg stderr:',
                        stderr
                    )

                    reject(error)

                    return
                }

                resolve()
            }
        )
    })
}


function unwrapMessage(message) {

    if (!message)
        return null

    if (message.ephemeralMessage)
        return unwrapMessage(
            message.ephemeralMessage.message
        )

    if (message.viewOnceMessage)
        return unwrapMessage(
            message.viewOnceMessage.message
        )

    if (message.viewOnceMessageV2)
        return unwrapMessage(
            message.viewOnceMessageV2.message
        )

    if (message.viewOnceMessageV2Extension)
        return unwrapMessage(
            message.viewOnceMessageV2Extension.message
        )

    return message
}


function getQuotedMessage(msg) {

    const message =
        msg.message || {}

    const context =
        message.extendedTextMessage?.contextInfo ||
        message.imageMessage?.contextInfo ||
        message.videoMessage?.contextInfo ||
        message.documentMessage?.contextInfo ||
        {}

    return unwrapMessage(
        context.quotedMessage
    )
}


async function downloadMedia(
    media,
    type,
    output
) {

    const stream =
        await downloadContentFromMessage(
            media,
            type
        )

    const write =
        fs.createWriteStream(output)

    for await (
        const chunk of stream
    ) {

        write.write(chunk)
    }

    await new Promise(
        (resolve, reject) => {

            write.on(
                'finish',
                resolve
            )

            write.on(
                'error',
                reject
            )

            write.end()
        }
    )
}


/*
 * ==========================================
 * TEXT → STICKER
 * ==========================================
 */

async function textToSticker(
    text,
    output
) {

    const textFile =
        output + '.txt'

    fs.writeFileSync(
        textFile,
        text,
        'utf8'
    )

    const escapedTextFile =
        textFile
            .replace(/\\/g, '\\\\')
            .replace(/:/g, '\\:')
            .replace(/'/g, "\\'")

    const filter =
        `drawtext=` +
        `fontfile='${FONT}':` +
        `textfile='${escapedTextFile}':` +
        `fontcolor=black:` +
        `fontsize=48:` +
        `x=(w-text_w)/2:` +
        `y=(h-text_h)/2:` +
        `line_spacing=10`

    try {

        await runFFmpeg([
            '-y',

            '-f',
            'lavfi',

            '-i',
            'color=c=white:s=512x512',

            '-vf',
            filter,

            '-frames:v',
            '1',

            '-c:v',
            'libwebp',

            '-lossless',
            '0',

            '-q:v',
            '75',

            output
        ])

    } finally {

        if (
            fs.existsSync(textFile)
        ) {
            fs.unlinkSync(textFile)
        }
    }
}


/*
 * ==========================================
 * IMAGE → STICKER
 * ==========================================
 */

async function imageToSticker(
    input,
    output
) {

    await runFFmpeg([
        '-y',

        '-i',
        input,

        '-vf',
        'scale=512:512:force_original_aspect_ratio=decrease,' +
        'pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white',

        '-c:v',
        'libwebp',

        '-lossless',
        '0',

        '-q:v',
        '75',

        output
    ])
}


/*
 * ==========================================
 * VIDEO → ANIMATED STICKER
 * ==========================================
 */

async function videoToSticker(
    input,
    output
) {

    await runFFmpeg([
        '-y',

        '-i',
        input,

        '-t',
        '6',

        '-vf',
        'fps=12,' +
        'scale=512:512:force_original_aspect_ratio=decrease,' +
        'pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white',

        '-c:v',
        'libwebp',

        '-lossless',
        '0',

        '-q:v',
        '50',

        '-loop',
        '0',

        output
    ])
}


/*
 * ==========================================
 * COMMAND
 * ==========================================
 */

module.exports = {

    name: 'sticker',
    owner: false,

    async execute(
        sock,
        msg,
        { args }
    ) {

        const jid =
            msg.key.remoteJid

        let input = null
        let output = null

        try {

            const tempDir =
                path.join(
                    process.cwd(),
                    'temp'
                )

            if (
                !fs.existsSync(tempDir)
            ) {

                fs.mkdirSync(
                    tempDir,
                    {
                        recursive: true
                    }
                )
            }

            const id =
                `${Date.now()}_${Math.random()
                    .toString(36)
                    .slice(2)}`


            /*
             * =================================
             * MODE 1
             * .sticker Hay
             * =================================
             */

            if (
                args &&
                args.length > 0
            ) {

                const text =
                    args.join(' ')

                output =
                    path.join(
                        tempDir,
                        `${id}.webp`
                    )

                console.log(
                    `📝 Text Sticker: ${text}`
                )

                await textToSticker(
                    text,
                    output
                )

                await sock.sendMessage(
                    jid,
                    {
                        sticker:
                            fs.readFileSync(
                                output
                            )
                    }
                )

                return
            }


            /*
             * =================================
             * MODE 2
             * REPLY MESSAGE
             * =================================
             */

            const quoted =
                getQuotedMessage(msg)

            if (!quoted) {

                await sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ Cara menggunakan .sticker:\n\n' +

                            '📝 Teks langsung:\n' +
                            '.sticker Hay\n\n' +

                            '💬 Reply teks:\n' +
                            'Reply pesan → .sticker\n\n' +

                            '🖼️ Reply gambar:\n' +
                            'Reply gambar → .sticker\n\n' +

                            '🎬 Reply video:\n' +
                            'Reply video → .sticker'
                    }
                )

                return
            }


            /*
             * =================================
             * REPLY TEXT
             * =================================
             */

            const quotedText =
                quoted.conversation ||
                quoted.extendedTextMessage?.text

            if (quotedText) {

                output =
                    path.join(
                        tempDir,
                        `${id}.webp`
                    )

                console.log(
                    `💬 Reply Text Sticker: ${quotedText}`
                )

                await textToSticker(
                    quotedText,
                    output
                )

                await sock.sendMessage(
                    jid,
                    {
                        sticker:
                            fs.readFileSync(
                                output
                            )
                    }
                )

                return
            }


            /*
             * =================================
             * REPLY IMAGE
             * =================================
             */

            const image =
                quoted.imageMessage

            if (image) {

                input =
                    path.join(
                        tempDir,
                        `${id}.jpg`
                    )

                output =
                    path.join(
                        tempDir,
                        `${id}.webp`
                    )

                console.log(
                    '🖼️ Mengunduh gambar...'
                )

                await downloadMedia(
                    image,
                    'image',
                    input
                )

                console.log(
                    '🎨 Membuat sticker...'
                )

                await imageToSticker(
                    input,
                    output
                )

                await sock.sendMessage(
                    jid,
                    {
                        sticker:
                            fs.readFileSync(
                                output
                            )
                    }
                )

                return
            }


            /*
             * =================================
             * REPLY VIDEO
             * =================================
             */

            const video =
                quoted.videoMessage

            if (video) {

                input =
                    path.join(
                        tempDir,
                        `${id}.mp4`
                    )

                output =
                    path.join(
                        tempDir,
                        `${id}.webp`
                    )

                console.log(
                    '🎬 Mengunduh video...'
                )

                await downloadMedia(
                    video,
                    'video',
                    input
                )

                console.log(
                    '🎨 Membuat animated sticker...'
                )

                await videoToSticker(
                    input,
                    output
                )

                await sock.sendMessage(
                    jid,
                    {
                        sticker:
                            fs.readFileSync(
                                output
                            )
                    }
                )

                return
            }


            /*
             * =================================
             * FORMAT TIDAK DIDUKUNG
             * =================================
             */

            await sock.sendMessage(
                jid,
                {
                    text:
                        '❌ Format pesan belum didukung.\n\n' +
                        'Gunakan reply teks, gambar, atau video.'
                }
            )

        } catch (err) {

            console.error(
                '❌ Sticker Error:',
                err
            )

            try {

                await sock.sendMessage(
                    jid,
                    {
                        text:
                            '❌ Gagal membuat sticker.\n\n' +
                            `Error: ${err.message}`
                    }
                )

            } catch (sendError) {

                console.error(
                    '❌ Gagal mengirim error:',
                    sendError.message
                )
            }

        } finally {

            /*
             * Bersihkan file sementara
             */

            if (
                input &&
                fs.existsSync(input)
            ) {

                try {
                    fs.unlinkSync(input)
                } catch {}
            }

            if (
                output &&
                fs.existsSync(output)
            ) {

                try {
                    fs.unlinkSync(output)
                } catch {}
            }
        }
    }
}
