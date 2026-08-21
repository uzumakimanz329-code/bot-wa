const lists = new Map()

function setTargets(jid, list) {

    lists.set(
        jid,
        list
    )
}

function getTarget(jid, number) {

    const list =
        lists.get(jid) || []

    return list[
        Number(number) - 1
    ] || null
}

function getTargets(jid) {

    return lists.get(jid) || []
}

function clearTargets(jid) {

    lists.delete(jid)
}

module.exports = {
    setTargets,
    getTarget,
    getTargets,
    clearTargets
}