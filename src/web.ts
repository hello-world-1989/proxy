import * as path from 'path';
import * as express from 'express';

const app = express();

app.use('/', express.static(path.join(__dirname, '../public/temp-main')));

const port = process.env.PORT1 || 3001;

app.listen(port, () => console.log(`listening on port ${port}`));
