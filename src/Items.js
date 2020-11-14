import { SkynetClient, genKeyPairFromSeed } from "skynet-js";
import { encrypt, decrypt } from './Crypto';

const client = new SkynetClient('https://siasky.net');
const dataKey = "vault-1.0.0.json";

export const getItems = async (seed) => {
    try {
        const publicKey = genKeyPairFromSeed(seed).publicKey;
        const { data } = await client.db.getJSON(publicKey, dataKey);
        const decryptedData = await decrypt(data, seed);

        return JSON.parse(decryptedData);
    } catch (error) {
        return [];
    }
};

export const publishItems = async (items, seed) => {
    publishStatus('init');

    try {
        const encryptedData = await encrypt(JSON.stringify(items), seed);
        const privateKey = genKeyPairFromSeed(seed).privateKey;

        const response = await client.db.setJSON(privateKey, dataKey, encryptedData);

        if (response) {
            console.log('setJSON response', response);
            publishStatus('error');
        } else {
            publishStatus('finish');
        }
    } catch (error) {
        console.log('setJSON error', error);
        publishStatus('error');
    }
};

const publishStatus = status => {
    document.body.setAttribute('data-publish', status);

    if (['error', 'finish'].includes(status)) {
        setTimeout(() => {
            document.body.removeAttribute('data-publish');
        }, 5000);
    }
}
