const fs = require('fs')
const path = require('path')

const commands = new Map()

const base = path.join(
    __dirname,
    '../commands'
)

function loadCommands(dir) {

    if (!fs.existsSync(dir))
        return

    const files = fs.readdirSync(dir)

    for (const file of files) {

        const fullPath =
            path.join(dir, file)

        const stat =
            fs.statSync(fullPath)

        // Masuk ke folder
        if (stat.isDirectory()) {
            loadCommands(fullPath)
            continue
        }

        // Hanya file JS
        if (!file.endsWith('.js'))
            continue

        try {

            const command =
                require(fullPath)

            if (
                !command.name ||
                typeof command.execute !== 'function'
            ) {
                console.log(
                    `⚠️ Command tidak valid: ${fullPath}`
                )

                continue
            }

            commands.set(
                command.name.toLowerCase(),
                command
            )

            console.log(
                `✓ Loaded .${command.name}`
            )

        } catch (err) {

            console.error(
                `❌ Gagal load ${fullPath}`
            )

            console.error(
                err.message
            )
        }
    }
}

loadCommands(base)

console.log(
    `✓ Total command: ${commands.size}`
)

module.exports = commands