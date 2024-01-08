import axios from 'axios';
import * as express from 'express';
import * as httpProxy from 'http-proxy';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const QRCode = require('qrcode');
const Jimp = require('jimp');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

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

app.use('/', express.static(path.join(__dirname, '../public/temp-main')));

axios.defaults.headers.common['Accept-Language'] =
  'zh-CN,zh;q=0.9,en-US;q=0.8,en;';

axios.defaults.headers.common['User-Agent'] =
  'Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/21.0';

axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

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

app.use('/google', async (req, res) => {
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

app.use('/github', async (req, res) => {
  try {
    const response = await axios.get(
      'https://raw.githubusercontent.com/hello-world-1989/cn-news/main/server.txt'
    );

    res.send(response?.data);
  } catch (err) {
    console.log(err);
    res.send('');
  }
});

//TODO: change path
app.use('/gen-qr', async (req, res) => {
  try {

    const killFfmpeg = 'pkill -f ffmpeg';
    try {
      await exec(killFfmpeg);
    } catch (err) {
      console.log('pkill -f ffmpeg error');
    }
    
    const keyArray = await fetchAPI();

    const audio1Path = path.join(
      __dirname,
      '../public/temp-main/audio/ban1.mp3'
    );
    const audio2Path = path.join(
      __dirname,
      '../public/temp-main/audio/ban2.mp3'
    );

    const qrDirPath = path.join(__dirname, '../public/qr');

    if (!fs.existsSync(qrDirPath)) {
      fs.mkdirSync(qrDirPath, { recursive: true });
    }

    const bgqrDirPath = path.join(__dirname, '../public/bgqr');

    if (!fs.existsSync(bgqrDirPath)) {
      fs.mkdirSync(bgqrDirPath, { recursive: true });
    }

    const liveDirPath = path.join(__dirname, '../public/live');

    if (!fs.existsSync(liveDirPath)) {
      fs.mkdirSync(liveDirPath, { recursive: true });
    }

    for (let i = 0; i < keyArray.length; i++) {
      const shadowsocksKey = keyArray[i];

      const audioPath = i % 2 === 0 ? audio1Path : audio2Path;

      if (shadowsocksKey) {
        // Load background image
        //path.join(__dirname, '../public/temp-main/images/background.png')
        const backgroundPath = path.join(
          __dirname,
          '../public/temp-main/images/background.png'
        ); // Replace with the path to your background image

        const overlayPath = `${qrDirPath}/qrcode${i}.png`;

        QRCode.toFile(overlayPath, shadowsocksKey);

        const background = await Jimp.read(backgroundPath);
        const overlay = await Jimp.read(overlayPath);

        // Resize overlay image to fit the background
        overlay.resize(300, 300);

        // Calculate center position
        const centerX = background.getWidth() - overlay.getWidth() - 50;
        const centerY = background.getHeight() - overlay.getHeight() - 50;

        // Composite the overlay image onto the background at the center
        background.composite(overlay, centerX, centerY, {
          mode: Jimp.BLEND_SOURCE_OVER,
          opacityDest: 1,
          opacitySource: 1,
        });

        // Save the merged image
        // for (let j = 1; j <= 9; j++) {
        const outputPath = `${bgqrDirPath}/bgqr${i}.png`;
        await background.writeAsync(outputPath);
        // }

        const ffmpegCommand = `ffmpeg -loop 1 -i ${outputPath} -i ${audioPath} -c:v libx264 -c:a aac -strict experimental -b:a 192k -shortest -y ${liveDirPath}/output_video${i}.mp4`;

        // Run FFmpeg command
        try {
          //TODO
          
          await exec(ffmpegCommand);

          const filePath = `${liveDirPath}/videos.txt`;
          const dataToAppend = `file output_video${i}.mp4\n`;

          if (i === 0) {
            fs.writeFileSync(filePath, dataToAppend);
          } else {
            fs.appendFileSync(filePath, dataToAppend);
          }
          
          //await sleep(100 * 1000);
          // console.log('FFmpeg Output:', stdout);
          // if (stderr) {
          //   console.error('FFmpeg Error:', stderr);
          // }
        } catch (error) {
          console.error('FFmpeg Error:', error.message);
        }

        console.log(`Images and video gen successfully ${i}!`);
      }
    }

    const mergeCmd = `ffmpeg -f concat -safe 0 -i ${liveDirPath}/videos.txt -c copy -y ${liveDirPath}/live.mp4`;

    await exec(mergeCmd);
    //await sleep(30 * 1000);

    console.log(`Merge videos successfully!`);

    res.send('QR code with background generated successfully!');
  } catch (err) {
    console.log(err);
    res.send('');
  }
});

//TODO: add subscribe url
async function fetchAPI() {
  const url =
    '#';
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const base64String = await response.text();

  const decodedBuffer = Buffer.from(base64String, 'base64');
  const decodedString = decodedBuffer.toString('utf-8');
  //   console.log('decodedString:', decodedString);

  const array = decodedString.split('\r\n');

  console.log('array:', array);

  return array;
}

async function readSSKey() {
  const data = fs.readFileSync(path.join(__dirname, './ssKey.txt'));

  const array = data.toString().split('\n');

  console.log('array:', array);

  return array;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const port = process.env.PORT || 80;

app.listen(port, () => console.log(`listening on port ${port}`));

https
  .createServer(
    {
      key: fs.readFileSync(path.join(__dirname, './key.pem')),
      cert: fs.readFileSync(path.join(__dirname, './cert.pem')),
    },
    app
  )
  .listen(443, () => console.log(`listening on port 443`));
