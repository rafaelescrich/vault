const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toBase64 = buffer => btoa(String.fromCharCode(...new Uint8Array(buffer)));
const fromBase64 = buffer => Uint8Array.from(atob(buffer), c => c.charCodeAt(0));
const defaultAlgorithm = 'AES-GCM';

const PBKDF2 = async (phrase, salt, iterations = 100000, length = 256, hash = 'SHA-256', algorithm = defaultAlgorithm) => {
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(phrase),
        {name: 'PBKDF2'},
        false,
        ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode(salt),
            iterations,
            hash
        },
        keyMaterial,
        { name: algorithm, length },
        false,
        ['encrypt', 'decrypt']
    );
}

export const encrypt = async (string, seed) => {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const text = encoder.encode(string);
    const key = await PBKDF2(seed, salt);

    const encrypted = await window.crypto.subtle.encrypt(
        { name: defaultAlgorithm, iv },
        key,
        text
    );

    return toBase64([
        ...salt,
        ...iv,
        ...new Uint8Array(encrypted)
    ]);
}

export const decrypt = async (string, seed) => {
    const salt_len = 16;
    const iv_len = 16;

    const encrypted = fromBase64(string);

    const salt = encrypted.slice(0, salt_len);
    const iv = encrypted.slice(salt_len, salt_len + iv_len);
    const key = await PBKDF2(seed, salt);

    const decrypted = await window.crypto.subtle.decrypt(
        { name: defaultAlgorithm, iv },
        key,
        encrypted.slice(salt_len + iv_len)
    );

    return decoder.decode(decrypted);
}
