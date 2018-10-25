const { clearDatabaseHook } = require('../mongooseTestHooks');

const Item = require('./item.model');
const service = require('./item.service');

describe('item.service', () => {
  clearDatabaseHook();

  describe('#create', () => {
    test('should create first item successfully', async () => {
      const { item } = await service.create({ description: 'foo' });
      expect(item).toHaveProperty('description', 'foo');
    });

    test('should set beforeId property for item', async () => {
      await Item.create({ beforeId: null, afterId: null });
      const { item, beforeItem } = await service.create({ description: 'foo' });
      expect(String(item.beforeId)).toBe(beforeItem.id);
    });

    test('should set afterId property for last item', async () => {
      await Item.create({ beforeId: null, afterId: null });
      const { item, beforeItem } = await service.create({ description: 'foo' });
      expect(String(beforeItem.afterId)).toBe(item.id);
    });
  });

  describe('#delete', () => {
    test('should delete one item successfully', async () => {
      const item = await Item.create({ beforeId: null, afterId: null });
      await service.delete(item.id);
      const items = await Item.find({ _id: item.id });
      expect(items).toHaveLength(0);
    });

    test('should update before and after item', async () => {
      const item1 = await Item.create({ beforeId: null, afterId: null });
      const item2 = await Item.create({ beforeId: item1.id, afterId: null });
      const item3 = await Item.create({ beforeId: item2.id, afterId: null });
      item1.afterId = item2.id; await item1.save();
      item2.afterId = item3.id; await item2.save();
      const { beforeItem, afterItem } = await service.delete(item2.id);
      expect(String(beforeItem.afterId)).toBe(afterItem.id);
      expect(String(afterItem.beforeId)).toBe(beforeItem.id);
    });
  });

  describe('#move', () => {
    test('should reverse when there are two items and afterId is null', async () => {
      const item1 = await Item.create({ beforeId: null, afterId: null });
      const item2 = await Item.create({ beforeId: item1.id, afterId: null });
      item1.afterId = item2.id;
      await item1.save();
      const { items } = await service.move({ id: item1.id, afterId: null });
      expect(items).toHaveLength(2);
      const newItem1 = items.find(i => i.id === item1.id);
      const newItem2 = items.find(i => i.id === item2.id);
      expect(newItem1).toHaveProperty('afterId', null);
      expect(String(newItem1.beforeId)).toBe(item2.id);
      expect(newItem2).toHaveProperty('beforeId', null);
      expect(String(newItem2.afterId)).toBe(item1.id);
    });

    test('should move last item to first when id is last item and afterId is first item', async () => {
      const item1 = await Item.create({ beforeId: null, afterId: null });
      const item2 = await Item.create({ beforeId: item1.id, afterId: null });
      const item3 = await Item.create({ beforeId: item2.id, afterId: null });
      item1.afterId = item2.id; await item1.save();
      item2.afterId = item3.id; await item2.save();
      const { items } = await service.move({ id: item3.id, afterId: item1.id });
      expect(items).toHaveLength(3);
      const newItem1 = items.find(i => i.id === item1.id);
      const newItem2 = items.find(i => i.id === item2.id);
      const newItem3 = items.find(i => i.id === item3.id);
      expect(newItem3).toHaveProperty('beforeId', null);
      expect(String(newItem3.afterId)).toBe(item1.id);
      expect(String(newItem1.beforeId)).toBe(item3.id);
      expect(newItem2).toHaveProperty('afterId', null);
    });
  });
});
