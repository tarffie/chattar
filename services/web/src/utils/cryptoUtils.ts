export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Generates an RSA key pair for E2E encryption
 * Public key will be sent to server
 * Private key must be stored securely on client
 */
export const generateKeypair = async (): Promise<KeyPair> => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, // extractable
    ["encrypt", "decrypt"],
  );

  // Export public key
  const publicKeyBuffer = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey,
  );
  const publicKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(publicKeyBuffer)),
  );

  // Export private key
  const privateKeyBuffer = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey,
  );
  const privateKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(privateKeyBuffer)),
  );

  return {
    publicKey: publicKeyBase64,
    privateKey: privateKeyBase64,
  };
};

/**
 * Store private key securely in IndexedDB (not localStorage!)
 */
export const storePrivateKey = async (
  userId: string,
  privateKey: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ChatAppKeys", 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["keys"], "readwrite");
      const store = transaction.objectStore("keys");
      store.put({ userId, privateKey });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys", { keyPath: "userId" });
      }
    };
  });
};

/**
 * Retrieve private key from IndexedDB
 */
export const getPrivateKey = async (userId: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ChatAppKeys", 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["keys"], "readonly");
      const store = transaction.objectStore("keys");
      const getRequest = store.get(userId);

      getRequest.onsuccess = () => {
        resolve(getRequest.result?.privateKey || null);
      };
      getRequest.onerror = () => reject(getRequest.error);
    };
  });
};
