import axios from 'axios';
import * as express from 'express';
import * as httpProxy from 'http-proxy';
import * as fs from 'fs';
import * as path from 'path';

const proxy = httpProxy.createProxyServer({
  target: {
    protocol: 'https:',
    host: 'www.google.com',
    port: 443,
    pfx: fs.readFileSync(path.join(__dirname, './keyStore.p12')),
    passphrase: 'password',
  },
  changeOrigin: true,
});

const app = express();

axios.defaults.headers.common['Accept-Language'] =
  'zh-CN,zh;q=0.9,en-US;q=0.8,en;';

axios.defaults.headers.common['User-Agent'] =
  'Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/21.0';

// app.use('/', express.static(path.join(__dirname, '../public/temp-main')));

app.use('/http(s)?*', async (req, res) => {
  const temp = req.originalUrl;
  const temp1 = temp.replace('/http', 'http');

  const url = new URL(temp1);

  const hostname = url.hostname;

  // req.session.host = temp1.includes('https://')
  //   ? 'https://' + hostname
  //   : 'http://' + hostname;
  try {
    // const response = await axios.get(temp1);

    const proxyRes: any = await new Promise((resolve, reject) => {
      proxy.web(req, res, { target: temp1 }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });

    res.send(proxyRes.data);
  } catch (err) {
    console.log(err);
    res.send('');
  }
});

app.use('/search', async (req, res) => {
  try {
    // const response = await axios.get(
    //   'https://www.google.com' + req.originalUrl
    // );

    const proxyRes: any = await new Promise((resolve, reject) => {
      proxy.web(
        req,
        res,
        { target: 'https://www.google.com' + req.originalUrl },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        }
      );
    });

    res.send(proxyRes.data);
  } catch (err) {
    console.log(err);
    res.send('');
  }
});

app.use('/url', async (req, res) => {
  const temp = req?.originalUrl?.replace('/url?q=', '');

  const temp1 = temp.split('&');

  const url = temp1?.[0];

  try {
    // const response = await axios.get(url);

    const proxyRes: any = await new Promise((resolve, reject) => {
      proxy.web(req, res, { target: url }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });

    res.send(proxyRes.data);
  } catch (err) {
    console.log(err);
    res.send('');
  }
});

app.use('/', async (req, res) => {
  try {
    // const response = await axios.get('https://www.google.com');

    const proxyRes: any = await new Promise((resolve, reject) => {
      proxy.web(req, res, { target: 'https://www.google.com' }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });

    console.log('proxyRes: ', proxyRes);

    res.send(proxyRes?.data);
  } catch (err) {
    console.log(err);
    res.send('');
  }
});

const port = process.env.PORT2 || 3002;

app.listen(8080, () => console.log(`listening on port ${port}`));

// http
//   .createServer(app)
//   .listen(port, () => console.log(`listening on port ${port}`));
