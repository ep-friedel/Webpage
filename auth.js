function auth() {
    const   uuid = require('uuid'),
            jwt = require('jsonwebtoken'),
            secretKey = uuid.v4(),
            jwtOptions = {
                issuer: 'crawler.fochlac.com'
            },
            sql = require(process.env.SP_HOME + 'db')();

    let isLoggedInFunctions = {};


    function createJWT(userName) {
        console.log('createJWT');
        return new Promise( (resolve, reject) => {
            jwt.sign({user: userName}, secretKey, jwtOptions, (err, token) => {
                if (err) reject();
                else resolve(token);
            });
        });
    }

    function jwtVerify(request) {
        console.log('jwtVerify');
        return new Promise( (resolve, reject) => {
            if (request.headers.jwt === undefined && request.headers.cookie.indexOf('JWT=') === -1) {
                reject('no token provided');
                return;
            }
            let cookie = {},
                token;

            if (request.headers.cookie) {
                request.headers.cookie.split('; ').forEach(str => {
                    cookie[str.split('=')[0]] = str.split('=')[1];
                });
            }
            token = request.headers.jwt || cookie.JWT;

            jwt.verify(token, secretKey, (err, token) => {
                if (err) reject(err);
                else resolve(token);
            });
        });
    }

    function jwtGetUser(token, page) {
        console.log('jwtGetUser');
        return new Promise( (resolve, reject) => {
            sql.getUserList(page).then(data => {
                let userObject = data.filter((item) => {
                    return item.user === token.user;
                });

                if (userObject.length > 0) {
                    resolve(userObject[0]);
                } else {
                    reject();
                }
            });
        });
    }

    function promiseErrorAuth(err) {
        res.status(500).send();
    }

    function checkLogin(name, pass, page) {
        console.log('checkLogin');
        return sql.getUserList(page).then(data => {
            let userObject = data.filter((user) => {
                    return user.name.toLowerCase() === name.toLowerCase();
                });
            if (userObject.length === 1) {
                if (pass === userObject[0].pass) {
                    return createJWT(userObject[0].name);
                } else {
                    throw Error('NoMatchingPasswordError');
                }
            } else {
                throw Error('NoMatchingUserError');
            }
        });
    }

    return (popup) => {
        console.log('initializing');
        if (!isLoggedInFunctions[popup]) {
            console.log('creating middleware for ' + popup);
            isLoggedInFunctions[popup] = (req, res, next) => {
                console.log('running middleware for ' + popup);
                jwtVerify(req)
                .then(token => jwtGetUser(token, req.params.user))
                .then((userObject) => {
                    req.user = userObject;
                    next();
                })
                .catch((err) => {
                    if (req.headers.authorization) {
                        let data = (new Buffer(req.headers.authorization.split(' ')[1], 'base64')).toString().split(':');

                        return checkLogin(data[0], data[1], 'fochlac');
                    } else {
                        if (popup === 'popup') {
                            res.status(401).set('WWW-Authenticate', 'Basic realm="Secure Area"').send('fail');
                        } else {
                            res.status(403).send('<html>Error while logging in!</html>');
                        }
                    }
                })
                .then((myJwt) => {
                    if (myJwt) {
                        res.set('Set-Cookie', 'JWT='+myJwt);
                        next();
                    }
                })
                .catch(() => {
                    if (popup === 'popup') {
                        res.status(401).send('fail');
                    } else {
                        res.status(403).send('<html>Error while logging in!</html>');
                    }
                });
            };
        }
        return isLoggedInFunctions[popup];
    };
}

module.exports = auth;