const mongoose = require('mongoose');

module.exports = function setupMongoose(url) {
  mongoose.connect(url, { useNewUrlParser: true });
  mongoose.Promise = global.Promise;
  mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
}
