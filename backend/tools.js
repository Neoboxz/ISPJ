import forge from 'node-forge'
import dotenv from "dotenv"
import CryptoJS from 'crypto-js'

dotenv.config()
const privateKey = process.env.privateKey
const publicKey = process.env.publicKey
const key = "0f d7 4c e7 f4 0a 5e 86 cd 84 75 d9 7d 6b c2 37 "


//hashing function
export const hashing =(msg) => {
    var salt = forge.random.getBytesSync(128);
    var md = forge.sha256.create()
    md.update(msg)
    console.log("the hash is", md.digest().toHex())
    return [md.digest().toHex() , salt]
}

export const encryption_AES = async(msg) =>{
    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(msg), key).toString();
    return ciphertext

}

export const decrpytion_AES = async(ciphertext)=>{
    var bytes  = CryptoJS.AES.decrypt(ciphertext, key);
    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData
}
