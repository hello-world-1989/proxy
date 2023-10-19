import axios from 'axios';
import * as path from 'path';
import * as express from 'express';

const app = express();

axios.defaults.headers.common['Accept-Language'] =
  'zh-CN,zh;q=0.9,en-US;q=0.8,en;';

axios.defaults.headers.common['User-Agent'] =
  'Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/21.0';

app.use(
  '/',
  express.static(path.join(__dirname, '../public/temp-main/readme.html'))
);

app.use('/http(s)?*', async (req, res) => {
  const temp = req.originalUrl;
  const temp1 = temp.replace('/http', 'http');

  const url = new URL(temp1);

  const hostname = url.hostname;

  // req.session.host = temp1.includes('https://')
  //   ? 'https://' + hostname
  //   : 'http://' + hostname;
  try {
    const response = await axios.get(temp1);
    res.send(response.data);
  } catch (err) {
    res.send('');
  }
});

app.use('/search', async (req, res) => {
  try {
    const response = await axios.get(
      'https://www.google.com' + req.originalUrl
    );
    res.send(response.data);
  } catch (err) {
    res.send('');
  }
});

app.use('/url', async (req, res) => {
  const temp = req?.originalUrl?.replace('/url?q=', '');

  const temp1 = temp.split('&');

  const url = temp1?.[0];

  try {
    const response = await axios.get(url);
    res.send(response.data);
  } catch (err) {
    res.send('');
  }
});

app.use('/google', async (req, res) => {
  try {
    const response = await axios.get('https://www.google.com');

    res.send(response.data);
  } catch (err) {
    res.send('');
  }
});

// app.use('*', async (req, res) => {
//   console.log('url: ', req.url);
//   // console.log('headers: ', req.headers);

//   const host = req.session.host;

//   const temp = new URL(req.headers.referer);
//   const temp1 = temp.pathname;

//   console.log('host: ', host);
//   console.log('temp1: ', temp1);

//   try {
//     const response = await axios.get(host + temp1);
//     res.send(response.data);
//   } catch (err) {
//     res.send('');
//   }
// });

const port = process.env.PORT || 3001;

app.listen(port, () => console.log(`listening on port ${port}`));

// http
//   .createServer(app)
//   .listen(port, () => console.log(`listening on port ${port}`));
