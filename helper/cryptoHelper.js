require('dotenv').config();
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';
const key = crypto.createHash('sha256').update(SECRET_KEY).digest(); // 32 bytes

function encrypt(text) {
    const iv = crypto.randomBytes(16); 
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        content: encrypted
    };
}

function decrypt(hash) {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(hash.iv, 'hex'));
    let decrypted = decipher.update(hash.content, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}

module.exports = { encrypt, decrypt };
