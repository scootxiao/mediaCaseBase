
import CryptoJS from 'crypto-js'

// DES加密 Pkcs7填充方式
export function encryptByDES(message, key) {
  const keyHex = CryptoJS.enc.Utf8.parse(key)
  const encrypted = CryptoJS.DES.encrypt(message, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}

// DES解密
export function decryptByDES(ciphertext, key) {
  const keyHex = CryptoJS.enc.Utf8.parse(key)
  // direct decrypt ciphertext
  const decrypted = CryptoJS.DES.decrypt({
    ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
  }, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}
