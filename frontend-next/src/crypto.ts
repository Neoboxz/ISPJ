import { createCipheriv, createDecipheriv, pbkdf2, randomBytes , createHash} from "crypto";

export const cryptoCreateHash =(
  password
) => {
  const hash = createHash('sha256')
  hash.update(password)
  return hash.digest('hex')
}


export const cryptoGenerateKey = (): Buffer => {
  // return new Promise((resolve, reject) => {
  //   const salt = randomBytes(16)
  //   const iterations = 100000
  //   const keyLength = 32
  //   const digest = 'sha256'

  //   pbkdf2(password, salt, iterations, keyLength, digest, (err, derivedKey) => {
  //     if (err) reject(err)
  //     else resolve(derivedKey)
  //   })
  // })

  return Buffer.from(
    "03b4e54bd1b23ee42056b20843524192c9d90d19130c421bed9841f515d3638d",
    "hex"
  );
};

export const cryptoGenerateIv = (): Buffer => {
  return Buffer.from("cd629e72ba0628fc10edfc8001291c03", "hex");
};

export const cryptoEncryptBlob = (
  blob: File | Blob,
  key: Buffer,
  iv: Buffer
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const cipher = createCipheriv("aes-256-cbc", key, iv);
    const reader = new FileReader();
    reader.onload = function () {
      const encrypted = Buffer.concat([
        cipher.update(Buffer.from(reader.result as ArrayBuffer)),
        cipher.final(),
      ]);
      resolve(new Blob([encrypted]));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

export const cryptoDecryptBlob = (
  blob: File | Blob,
  key: Buffer,
  iv: Buffer
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const cipher = createDecipheriv("aes-256-cbc", key, iv);
    const reader = new FileReader();
    reader.onload = function () {
      const decrypted = Buffer.concat([
        cipher.update(Buffer.from(reader.result as ArrayBuffer)),
        cipher.final(),
      ]);
      resolve(new Blob([decrypted]));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

export const cryptoBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function () {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const cryptoBase64ToBlob = (base64: string): Blob => {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray]);
};
