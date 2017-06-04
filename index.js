#!/usr/bin/env node

const   express = require('express')
    ,   app = express()
    ,   bodyparser = require('body-parser')
    ,   compression = require('compression')
    ,   exec = require('child_process').execFile
    ,   hmac = require(process.env.WWW_HOME + 'hmac')(process.env.GITHUB_SECRET, 'X-Hub-Signature')
    ,   server = require('http').createServer(app)
    ,   server_port = process.env.WWW_PORT
    ,   fs = require('fs')
    ,   proxy = require('./proxy')
    ,   auth = require('./auth')()
    ,   server_ip_address = 'localhost'
    ,   https = require('https')
    ,   xssFilter = require('x-xss-protection')
    ,   sslServer = https.createServer({
            key: fs.readFileSync(process.env.KEYSTORE + 'fochlac_com_key.pem'),
            cert: fs.readFileSync(process.env.KEYSTORE + 'fochlac_com_cert_chain.pem')
        }, app);

sslServer.listen(server_port, server_ip_address, () => {
    console.log('listening on port '+ server_port);
});

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(compression());
app.use(xssFilter());
app.set('x-powered-by', false);

app.get('/admin.html', auth('popup'))
app.use('/', express.static(process.env.WWW_HOME + 'Public'));

app.get('/', (req, res) => res.redirect('https://' + req.headers.host + '/index.html'))

app.get('/api/proxy', (req, res) => {
    proxy.listProxies()
        .then((data) => res.status(200).send(data))
        .catch(err => res.status(err.status ? err.status : 500).send(err.reason ? err.reason : err));
});

app.post('/api/proxy/', (req, res) => {
    proxy.addProxy(req.body)
        .then(() => res.redirect('https://' + req.headers.host + '/admin.html'))
        .catch(err => res.status(err.status ? err.status : 500).send(err.reason ? err.reason : err));
});

app.post('/api/proxy/:proxy', (req, res) => {
    let options = {subdomain: req.params.proxy},
        attribute;

    for (attribute in req.body) {
        options[attribute] = req.body[attribute];
    }

    proxy.addProxy(options)
        .then(() => res.redirect('https://' + req.headers.host + '/admin.html'))
        .catch(err => res.status(err.status ? err.status : 500).send(err.reason ? err.reason : err));
});

app.delete('/api/proxy/:proxy', (req, res) => {
    proxy.deleteProxy(req.params.proxy)
        .then(() => res.redirect('https://' + req.headers.host + '/admin.html'))
        .catch(err => res.status(err.status ? err.status : 500).send(err.reason ? err.reason : err));
});

app.get('/api/proxy/:proxy', (req, res) => {
    proxy.getProxy(req.params.proxy)
        .then((data) => res.status(200).send(data))
        .catch(err => res.status(err.status ? err.status : 500).send(err.reason ? err.reason : err));
});

app.post('/api/triggerBuild', hmac, (req, res) => {
    exec(process.env.WWW_HOME + "scripts/build", (error, stdout, stderr) => {
        console.log(stdout + error + stderr);
    });
    res.status(200).send();
});

app.post('/api/triggerBuildReverseproxy', hmac, (req, res) => {
    exec(process.env.PROXY_HOME + "scripts/build", (error, stdout, stderr) => {
        console.log(stdout + error + stderr);
    });
    res.status(200).send();
});