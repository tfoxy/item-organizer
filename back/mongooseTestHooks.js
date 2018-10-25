const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getConnectionString();
  await mongoose.connect(mongoUri, { useNewUrlParser: true }, (err) => {
    if (err) console.error(err);
  });
});

afterAll(() => {
  mongoose.disconnect();
  if (mongoServer) mongoServer.stop();
});

exports.clearDatabaseHook = clearDatabaseHook;


function clearDatabaseHook() {
  beforeEach(() => {
    return Promise.all(Object.values(mongoose.connection.collections).map(c => c.remove()));
  });
}
