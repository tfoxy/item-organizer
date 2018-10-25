const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const setupMongoose = require('./mongoose.setup');
const itemRoute = require('./item/item.route');

setupMongoose(process.env.MONGODB_URI);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'build', 'index.html'));
});

app.use('/static', express.static(path.join(__dirname, 'static')));

app.use('/items', itemRoute);

const port = 8000;
app.listen(port, () => {
  console.log(`Server is up and running on port number ${port}`);
});
