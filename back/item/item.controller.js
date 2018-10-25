const sizeOf = require('image-size');
const crypto = require('crypto');

const Item = require('./item.model');
const service = require('./item.service');

module.exports = {
  async create(req, res, next) {
    const data = Object.assign({}, req.body);
    if (req.file) {
      try {
        service.validateImageSize(req.file.buffer);
      } catch (err) {
        return next(err);
      }
      const imageUrl = await service.uploadImage(req.file.buffer);
      data[req.file.fieldname] = imageUrl;
    }
    const result = await service.create(data);
    res.status(201).send(result);
  },

  async read(req, res) {
    const result = await service.read(req.params.id);
    res.send(result);
  },

  async update(req, res) {
    const result = await service.update(req.params.id, req.body);
    res.send(result);
  },

  async delete(req, res, next) {
    const result = await service.delete(req.params.id);
    res.send(result);
  },

  list(req, res, next) {
    Item.find({}, (err, items) => {
      if (err) return next(err);
      res.send({ items });
    });
  },

  async move(req, res) {
    const result = await service.move(req.body);
    res.send(result);
  },
};
