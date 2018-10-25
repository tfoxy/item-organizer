const crypto = require('crypto');
const path = require('path');

const fse = require('fs-extra');
const sizeOf = require('image-size');

const Item = require('./item.model');

module.exports = {
  async create(data) {
    const beforeItem = await Item.findOne({ afterId: null }, null);
    const realData = Object.assign({}, data);
    realData.afterId = null;
    realData.beforeId = beforeItem ? beforeItem.id : null;
    const item = await Item.create(realData);
    if (beforeItem) {
      beforeItem.afterId = item.id;
      await beforeItem.save();
    }
    return { item, beforeItem };
  },

  async read(id) {
    const item = Item.findById(id);
    return { item };
  },

  async update(id, data) {
    const realData = Object.assign({}, data);
    delete realData.afterId;
    delete realData.beforeId;
    const item = Item.findByIdAndUpdate(id, { $set: data }, { new: true });
    return { item };
  },

  async delete(id) {
    const item = await Item.findById(id);
    const { beforeId, afterId } = item;
    const beforeItem = beforeId ? await Item.findById(beforeId) : null;
    const afterItem = afterId ? await Item.findById(afterId) : null;
    await item.remove();
    if (beforeItem) {
      beforeItem.afterId = afterId;
      await beforeItem.save();
    }
    if (afterItem) {
      afterItem.beforeId = beforeId;
      await afterItem.save();
    }
    return { beforeItem, afterItem };
  },

  /**
   * Move an item from one place to another by using afterId for its destination
   * @param {{ id: string, afterId: string }} options
   */
  async move({ id, afterId = null }) {
    let itemsFilter = { _id: id };
    if (afterId) {
      itemsFilter._id = { $in: [id, afterId] };
    } else {
      itemsFilter = {
        $or: [
          itemsFilter,
          { afterId: null },
        ],  
      };
    }
    const items = await Item.find(itemsFilter);
    const item = items.find(i => i.id === id);
    const afterItem = afterId ? items.find(i => i.id === afterId) : null;
    const beforeId = afterId ? afterItem.beforeId : items.find(i => i.afterId === null).id;
    const writes = [];
    writes.push(getMoveUpdate(item.id, 'afterId', afterId));
    writes.push(getMoveUpdate(item.id, 'beforeId', beforeId));
    if (item.beforeId) {
      writes.push(getMoveUpdate(item.beforeId, 'afterId', item.afterId));
    }
    if (item.afterId) {
      writes.push(getMoveUpdate(item.afterId, 'beforeId', item.beforeId));
    }
    if (afterId) {
      writes.push(getMoveUpdate(afterId, 'beforeId', id))
    }
    if (beforeId) {
      writes.push(getMoveUpdate(beforeId, 'afterId', id))
    }
    await Item.bulkWrite(writes);
    const ids = [id, afterId];
    const newItems = await Item.find({
      $or: [
        { _id: { $in: ids } },
        { afterId: { $in: ids } },
        { beforeId: { $in: afterId ? ids : [id] } },
      ],
    });
    return { items: newItems };
  },

  validateImageSize(buffer) {
    const { width, height } = sizeOf(buffer);
    if (width !== 320 || height !== 320) {
      throw new Error('Image must be 320x320');
    }
  },

  async uploadImage(buffer) {
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    const imagePath = path.join('static', 'uploads', hash);
    await fse.writeFile(imagePath, buffer);
    return `/static/uploads/${hash}`;
  },
};


function getMoveUpdate(id, key, value) {
  return {
    updateOne: {
      filter: { _id: id },
      update: { [key]: value },
    },
  };
}
