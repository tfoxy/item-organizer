import ItemService from './Item.service';

describe('Item.service', () => {
  describe('#sortItemsWithAfterIdAndBeforeId', () => {
    test('should sort successfully', () => {
      const service = new ItemService();
      service.items = [{
        id: '1',
        afterId: null,
        beforeId: '2',
      }, {
        id: '2',
        afterId: '1',
        beforeId: null,
      }];
      service.sortItemsWithAfterIdAndBeforeId();
      expect(service.items).toHaveProperty(['0', 'id'], '2');
      expect(service.items).toHaveProperty(['1', 'id'], '1');
    });
  });
});
