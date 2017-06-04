const fs = require('fs'),
    proxyFile = process.env.PROXY_HOME + 'urlmap.js';

const _readFile = () => {
        return new Promise((resolve, reject) => {
            fs.readFile(proxyFile, 'utf8', (err, data) => {
                if (err) {
                    reject({status: 500, reason: 'error reading file' + err});
                } else {
                    resolve(JSON.parse(data.split('module.exports = ')[1].split(';')[0]));
                }
            });
        });
    },

    _writeFile = (data) => {
        let string = 'module.exports = ' + JSON.stringify(data, null, 4) + ';';

        return new Promise((resolve, reject) => {
            fs.writeFile(proxyFile, string, 'utf8', (err) => {
                if (err) {
                    reject({status: 500, reason: 'error writing file' + err});
                } else {
                    resolve()
                }
            });
        });
    };


module.exports = {
    addProxy: (data) => {
        return new Promise((resolve, reject) => {
            if ((data.redirect && data.redirectUrl && data.redirectUrl.length && data.subdomain) || (data.port && data.port.length && data.subdomain)) {
                _readFile()
                    .then(urlmap => {
                        urlmap[data.subdomain + '.fochlac.com'] = data.redirect ?
                        {
                            redirect: true,
                            redirectUrl: data.redirectUrl
                        }
                        :
                        {
                            redirect: false,
                            redirectUrl: 'https://localhost:' + process.env[data.port] + data.path
                        };
                        return urlmap;
                    })
                    .then(_writeFile)
                    .then(resolve)
                    .catch((err) => reject({status: 500, reason: err}));
            } else {
                reject({status: 400, reason: (!data.subdomain) ? 'Subdomain missing' : !(data.port && data.port.length) ? 'Port missing' : 'Url missing'});
            }
        });
    },

    deleteProxy: (subdomain) => {
        return _readFile()
            .then(urlmap => {
                delete urlmap[subdomain + '.fochlac.com'];
                return urlmap;
            })
            .then(_writeFile);
    },

    listProxies: () => {
        return _readFile();
    },

    getProxy: (subdomain) => {
        return _readFile()
            .then(data => {
                if (data[subdomain + '.fochlac.com']) {
                    data[subdomain + '.fochlac.com']
                } else {
                    throw({status: 404, reason: 'Unknown Subdomain'})
                }
            });
    }

};