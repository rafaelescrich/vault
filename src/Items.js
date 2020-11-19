import { SkynetClient, genKeyPairFromSeed } from "skynet-js";
import { encrypt, decrypt } from './Crypto';
import { SKYNET_URL, APP_VERSION } from './Constants';

const client = new SkynetClient(SKYNET_URL);
const dataKey = `${APP_VERSION}.json`;

export const getItems = async (seed) => {
    const keyPair = genKeyPairFromSeed(seed);
    const publicKey = keyPair.publicKey;
    const cacheKey = `${APP_VERSION}-${publicKey}`;

    try {
        let data = localStorage.getItem(cacheKey);

        if (!data) {
            const publicKey = genKeyPairFromSeed(seed).publicKey;
            const response = await client.db.getJSON(publicKey, dataKey);

            localStorage.setItem(cacheKey, response.data);
            data = response.data;
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
    const publicKey = keyPair.publicKey;
    const privateKey = keyPair.privateKey;
    const cacheKey = `${APP_VERSION}-${publicKey}`;

    try {
        const encryptedData = await encrypt(JSON.stringify(items), seed);
        const response = await client.db.setJSON(privateKey, dataKey, encryptedData);

        if (response) {
            console.log('setJSON response', response);
            updateStatus('error');
        } else {
            localStorage.setItem(cacheKey, encryptedData);
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
