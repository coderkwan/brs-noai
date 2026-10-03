
const encoder = new TextEncoder()
const decoder = new TextDecoder()

function b64urlEncode(bytes) {
    const arr = new Uint8Array(bytes)
    let bin = ''
    for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i])
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(str) {
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'))
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes
}

async function importKey(secret) {
    return crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        {name: 'HMAC', hash: 'SHA-256'},
        false,
        ['sign', 'verify'],
    )
}

// Constant-time string comparison to avoid leaking length/content via timing.
export function safeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false
    if (a.length !== b.length) return false
    let result = 0
    for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    return result === 0
}

export async function signSession(payload, secret) {
    const key = await importKey(secret)
    const data = b64urlEncode(encoder.encode(JSON.stringify(payload)))
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
    return `${data}.${b64urlEncode(sig)}`
}

// Returns the decoded payload if the token is valid and unexpired, else null.
export async function verifySession(token, secret) {
    if (!token || !secret || !token.includes('.')) return null
    const [data, sig] = token.split('.')
    if (!data || !sig) return null
    try {
        const key = await importKey(secret)
        const valid = await crypto.subtle.verify('HMAC', key, b64urlDecode(sig), encoder.encode(data))
        if (!valid) return null
        const payload = JSON.parse(decoder.decode(b64urlDecode(data)))
        if (typeof payload.exp === 'number' && Date.now() > payload.exp) return null
        return payload
    } catch {
        return null
    }
}
