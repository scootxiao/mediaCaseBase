import CryptoJS from 'crypto-js/crypto-js'

const CRYPTO_KEY = '800900'

// md5加密
function encodeAES(str) {
  return CryptoJS.AES.encrypt(str, CRYPTO_KEY).toString()
}

function decodeAES(str) {
  return CryptoJS.AES.decrypt(str, CRYPTO_KEY).toString(CryptoJS.enc.Utf8)
}

export { encodeAES, decodeAES }
