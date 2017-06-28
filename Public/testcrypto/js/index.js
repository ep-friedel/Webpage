function cryptoMod() {
    let user = {
            nick: '',
            id: '',
            pass: '',
            keyring: {
                self: {}
            },
            friends: {},
            events: {},
            documents: {}
        },
        salt = 'This is my awesome key salt.' + user.nick + '. fochlac.com';

    function arrayBufferToHexString(arrayBuffer) {
        let byteArray = new Uint8Array(arrayBuffer),
            hexString = "",
            nextHexByte,
            i;

        for (i=0; i<byteArray.byteLength; i++) {
            nextHexByte = byteArray[i].toString(16);
            if (nextHexByte.length < 2) {
                nextHexByte = "0" + nextHexByte;
            }
            hexString += nextHexByte;
        }
        return hexString;
    }

    function arrayBufferToBase64(buffer) {
        let binary = '',
            bytes = new Uint8Array(buffer),
            len = bytes.byteLength,
            _i;

        for (_i = 0; _i < len; _i++) {
            binary += String.fromCharCode(bytes[_i]);
        }
        return window.btoa(binary);
    }

    function base64ToArrayBuffer(base64) {
        let binary_string =  window.atob(base64),
            len = binary_string.length,
            bytes = new Uint8Array(len),
            _i;

        for (_i = 0; _i < len; _i++)        {
            bytes[_i] = binary_string.charCodeAt(_i);
        }
        return bytes.buffer;
    }

    function strToArr(str) {
      return new TextEncoder().encode(str)
    }

    function arrToStr(arr) {
      return new TextDecoder().decode(arr)
    }

    function generateSplice() {
        let length = (user.nick.length > user.pass.length) ? user.pass.length : user.nick.length,
            splice = '',
            _i;

        for (_i = 0; _i < length; _i++) {
            splice += user.nick[_i] + user.pass[_i];
        }

        splice += (user.nick.length > user.pass.length) ? user.nick.slice(length) : user.pass.slice(length);
        return splice;
    }

    function generateRsaKey() {
        return window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: {name: "SHA-256"}
            },
            true,
            ["encrypt", "decrypt"]);
    }

    function generateHashKey(source) {
        return window.crypto.subtle.importKey(
                "raw",
                strToArr(source),
                {"name": "PBKDF2"},
                false,
                ["deriveKey"]
            ).then(baseKey => {
                return window.crypto.subtle.deriveKey(
                        {
                            "name": "PBKDF2",
                            "salt": strToArr(salt),
                            "iterations": 100,
                            "hash": "SHA-256"
                        },
                        baseKey,
                        {"name": "AES-CBC", "length": 128},
                        true,
                        ["encrypt", "decrypt"]
                    );
            }).then(aesKey => {
                return window.crypto.subtle.exportKey("jwk", aesKey);
            }).then(aesKey => {
                return aesKey;
            });
    }

    function importHash(hash) {
        return window.crypto.subtle.importKey(
                "jwk",
                hash ? hash : user.keyring.self.hash,
                {"name": "AES-CBC", "length": 128},
                false,
                ["encrypt", "decrypt"]
            );
    }

    function decode(data, hash) {
        return importHash(hash)
            .then((key) => {
                return window.crypto.subtle.decrypt({name: "AES-CBC", iv: data.iv}, key, base64ToArrayBuffer(data.data));
            }).then((plaintext) => {
                return arrToStr(plaintext);
            });
    }

    function encode(data, hash) {
        let iv = window.crypto.getRandomValues(new Uint8Array(16));

        return importHash(hash)
            .then((key) => {
                return window.crypto.subtle.encrypt({"name": 'AES-CBC', "iv": iv}, key, strToArr(data));
            }).then(data => {
                return {
                    "data": arrayBufferToBase64(data),
                    "iv": iv
                }
            });
    }

    return {
        decode: decode,

        encode: encode,

        generateHash: () => {
            return generateHashKey(generateSplice())
                .then(hash => {
                    user.keyring.self.hash = hash;
                    return hash;
                })
        },

        generatePrivateKeys: () => {
            let keys = {};

            return generateRsaKey()
                .then(rsaKey => {
                    user.keyring.self.rsa = rsaKey;
                    return window.crypto.subtle.exportKey('jwk', rsaKey.privateKey);
                }).then(privateKey => {
                    console.log('1 privateKey: ', privateKey);
                    return encode(JSON.stringify(privateKey));
                }).then(encPrivateKey => {
                    keys.privateKey = encPrivateKey;
                    return window.crypto.subtle.exportKey('jwk', user.keyring.self.rsa.publicKey);
                }).then(publicKey => {
                    keys.publicKey = publicKey;
                    return keys;
                });
        },

        getPassHash: () => {
            return encode(user.pass);
        },

        getId: () => {
            return user.id;
        },

        getNick: () => {
            return user.nick;
        },

        setNick: (nick) => {
            user.nick = nick;
            generateId();
        },

        getKey: (id) => {
            return user.keyring[id];
        },

        setKey: (id, key) => {
            user.keyring[id] = key;
        },

        friendList: () => {
            let friend,
                friendlist = [];

            for (friend in user.friends) {
                friendlist.push(friend.nick);
            }

            return friendlist;
        }
    }
}


document.addEventListener("DOMContentLoaded", () => {
    let dom = {
            user: document.getElementById('user'),
            pass: document.getElementById('pass'),
            register: document.getElementById('register'),
            login: document.getElementById('login')
        },
        crypto = cryptoMod();

    dom.register.addEventListener('click', ()=>{
        crypto.generateHash()
            .then(hash => dom.AESID.value = JSON.stringify(hash))
            .then(crypto.generatePrivateKeys)
            .then(keys => {
                dom.pubkey.value = JSON.stringify(keys.publicKey);
                dom.privkey.value = JSON.stringify(keys.privateKey);
            }).catch(console.log);
    });


});
