const BOT_API_URL = 'https://large-donkeys-warn.loca.lt';

const phoneInput = document.getElementById('phoneNumber');
const connectButton = document.getElementById('connectButton');
const connectStatus = document.getElementById('connectStatus');
const pairingBox = document.getElementById('pairingBox');
const pairingCode = document.getElementById('pairingCode');
const copyPairing = document.getElementById('copyPairing');

const searchInput = document.getElementById('searchInput');
const featureCards = document.querySelectorAll('.feature-card');
const categories = document.querySelectorAll('.category');


/* ================================
   STATUS
================================ */

function showStatus(message, type = '') {

    connectStatus.className = 'connect-status';

    if (type) {
        connectStatus.classList.add(type);
    }

    connectStatus.textContent = message;
    connectStatus.hidden = false;

}


/* ================================
   PHONE
================================ */

function normalizePhone(value) {

    let phone = String(value || '')
        .replace(/\D/g, '');

    if (phone.startsWith('0')) {
        phone = '62' + phone.slice(1);
    }

    return phone;

}


function isValidPhone(phone) {

    return (
        phone.length >= 10 &&
        phone.length <= 15 &&
        phone.startsWith('62')
    );

}


/* ================================
   PAIRING
================================ */

async function requestPairingCode() {

    const phone = normalizePhone(phoneInput.value);

    phoneInput.value = phone;

    if (!phone) {

        pairingBox.hidden = true;

        showStatus(
            '❌ Masukkan nomor WhatsApp terlebih dahulu.',
            'error'
        );

        phoneInput.focus();

        return;
    }

    if (!isValidPhone(phone)) {

        pairingBox.hidden = true;

        showStatus(
            '❌ Nomor WhatsApp tidak valid.',
            'error'
        );

        phoneInput.focus();

        return;
    }

    connectButton.disabled = true;
    connectButton.textContent = 'Connecting...';

    pairingBox.hidden = true;

    showStatus(
        '⏳ Menghubungkan ke server bot...',
        'loading'
    );


    try {

        const response = await fetch(
            BOT_API_URL + '/api/pairing',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    phone: phone
                })
            }
        );


        let data;

        try {

            data = await response.json();

        } catch (error) {

            throw new Error(
                'Server bot memberikan respons yang tidak valid.'
            );

        }


        if (!response.ok) {

            throw new Error(
                data?.error ||
                'Server bot menolak permintaan pairing.'
            );

        }


        if (!data?.success) {

            throw new Error(
                data?.error ||
                'Gagal mendapatkan pairing code.'
            );

        }


        const code = String(
            data.code || ''
        ).trim();


        if (!code) {

            throw new Error(
                'Server tidak mengirim pairing code.'
            );

        }


        pairingCode.textContent = code;
        pairingBox.hidden = false;

        showStatus(
            '✅ Pairing code berhasil dibuat.',
            'success'
        );


    } catch (error) {

        console.error(
            'Pairing error:',
            error
        );

        pairingBox.hidden = true;


        if (
            error instanceof TypeError ||
            error?.message === 'Failed to fetch'
        ) {

            showStatus(
                '❌ Tidak dapat terhubung ke server bot.',
                'error'
            );

        } else {

            showStatus(
                '❌ ' +
                (
                    error?.message ||
                    'Gagal menghubungkan ke server bot.'
                ),
                'error'
            );

        }

    } finally {

        connectButton.disabled = false;
        connectButton.textContent = 'Connect';

    }

}


/* ================================
   CONNECT BUTTON
================================ */

connectButton.addEventListener(
    'click',
    requestPairingCode
);


/* ================================
   ENTER
================================ */

phoneInput.addEventListener(
    'keydown',
    event => {

        if (event.key === 'Enter') {

            event.preventDefault();

            requestPairingCode();

        }

    }
);


/* ================================
   COPY PAIRING
================================ */

copyPairing.addEventListener(
    'click',
    async () => {

        const code =
            pairingCode.textContent.trim();

        if (
            !code ||
            code === '--------'
        ) {
            return;
        }


        try {

            await navigator.clipboard.writeText(code);

            copyPairing.textContent =
                '✅ Berhasil Disalin';

            setTimeout(
                () => {

                    copyPairing.textContent =
                        '📋 Salin Pairing Code';

                },
                1800
            );


        } catch (error) {

            console.error(
                'Copy error:',
                error
            );

            showStatus(
                '⚠️ Gagal menyalin pairing code.',
                'error'
            );

        }

    }
);


/* ================================
   SEARCH
================================ */

searchInput.addEventListener(
    'input',
    () => {

        const keyword =
            searchInput.value
                .toLowerCase()
                .trim();


        featureCards.forEach(
            card => {

                const text =
                    card.textContent.toLowerCase();

                card.style.display =
                    text.includes(keyword)
                        ? ''
                        : 'none';

            }
        );

    }
);


/* ================================
   CATEGORY
================================ */

categories.forEach(
    category => {

        category.addEventListener(
            'click',
            () => {

                categories.forEach(
                    item => {

                        item.classList.remove(
                            'active'
                        );

                    }
                );


                category.classList.add('active');


                const selected =
                    category.textContent
                        .trim()
                        .toLowerCase();


                featureCards.forEach(
                    card => {

                        if (selected === 'semua') {

                            card.style.display = '';

                            return;

                        }


                        const title =
                            card.querySelector('h3')
                                ?.textContent
                                .trim()
                                .toLowerCase();


                        card.style.display =
                            title === selected
                                ? ''
                                : 'none';

                    }
                );

            }
        );

    }
);