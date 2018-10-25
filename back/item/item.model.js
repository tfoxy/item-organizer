const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  description: { type: String, max: 300 },
  image: { type: String },
  beforeId: { type: Schema.Types.ObjectId, ref: 'Item' },
  afterId: { type: Schema.Types.ObjectId, ref: 'Item' },
});

// Duplicate the ID field.
ItemSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
ItemSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Item', ItemSchema);
