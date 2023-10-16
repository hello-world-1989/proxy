import axios from 'axios';

const app = require('express')();

const session = require('express-session');

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } }));

app.use('/http(s)?*', async (req, res) => {
  const temp = req.originalUrl;
  const temp1 = temp.replace('/http', 'http');

  const url = new URL(temp1);

  const hostname = url.hostname;

  req.session.host = temp1.includes('https://')
    ? 'https://' + hostname
    : 'http://' + hostname;
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

app.use('/', async (req, res) => {
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

app.listen(port);
