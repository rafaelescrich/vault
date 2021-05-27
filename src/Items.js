import { SkynetClient, genKeyPairFromSeed } from "skynet-js";
import { encrypt, decrypt } from './Crypto';
import { SKYNET_URL, APP_VERSION } from './Constants';
import { Buffer } from 'buffer';

window.Buffer = Buffer;
const client = new SkynetClient(SKYNET_URL);
const dataKey = APP_VERSION;

export const getItems = async (seed) => {
    const keyPair = genKeyPairFromSeed(seed);
    const { publicKey } = keyPair;
    const cacheKey = `${APP_VERSION}-${publicKey}`;

    try {
        let data = sessionStorage.getItem(cacheKey);

        if (!data) {
            const response = await client.db.getJSON(publicKey, dataKey);

            data = response.data.encryptedData;

            sessionStorage.setItem(cacheKey, data);
        }

        const decryptedData = await decrypt(data, seed);

        return JSON.parse(decryptedData);
    } catch (error) {
        return [];
    }
};

export const publishItems = async (items, seed) => {
    updateStatus('init');

    const keyPair = genKeyPairFromSeed(seed);
    const { publicKey, privateKey } = keyPair;
    const cacheKey = `${APP_VERSION}-${publicKey}`;

    const encryptedData = await encrypt(JSON.stringify(items), seed);

    try {
        const response = await client.db.setJSON(privateKey, dataKey, { encryptedData });

        if (response) {
            console.log('setJSON response', response);
            updateStatus('error');
        } else {
            sessionStorage.setItem(cacheKey, encryptedData);
            updateStatus('finish');
        }
    } catch (error) {
        console.log('setJSON error', error);
        updateStatus('error');
    }
};

const updateStatus = status => {
    document.body.setAttribute('data-publish', status);

    if (['error', 'finish'].includes(status)) {
        setTimeout(() => {
            document.body.removeAttribute('data-publish');
        }, 5000);
    }
}
