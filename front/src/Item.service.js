import axios from 'axios';

const PREFIX = '/items/';

export default class ItemService {
  constructor() {
    this.items = [];
  }

  /**
   * Sort linked list of items by using beforeId and afterId properties.
   */
  sortItemsWithAfterIdAndBeforeId() {
    const itemMap = new Map();
    let currentItem = null;
    this.items.forEach((item) => {
      itemMap.set(item.id, item);
      if (item.beforeId === null) currentItem = item;
    });
    this.items = [];
    while (currentItem) {
      this.items.push(currentItem);
      currentItem = itemMap.get(currentItem.afterId);
    }
  }
  
  async fetchAllItems() {
    const response = await axios.get(PREFIX);
    this.items = response.data.items;
    this.sortItemsWithAfterIdAndBeforeId();
    return this.items;
  }

  _updateItemData(data) {
    const item = this.items.find(i => i.id === data.id);
    Object.assign(item, data);
  }
  
  async createItem(data) {
    let postData = data;
    if (data.image) {
      postData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        postData.append(key, value);
      });
    }
    const response = await axios.post(PREFIX, postData);
    const { item, beforeItem } = response.data;
    this.items.push(item);
    if (beforeItem) {
      this._updateItemData(beforeItem);
    };
    return item;
  }
  
  async readItem(id) {
    const response = await axios.get(`${PREFIX}${id}/`);
    const { item } = response.data;
    this._updateItemData(item);
    return item;
  }
  
  async updateItem(id, data) {
    const response = await axios.put(`${PREFIX}${id}/`, data);
    const { item } = response.data;
    this._updateItemData(item);
    return item;
  }
  
  async deleteItem(id) {
    const response = await axios.delete(`${PREFIX}${id}/`);
    const { afterItem, beforeItem } = response.data;
    if (afterItem) this._updateItemData(afterItem);
    if (beforeItem) this._updateItemData(beforeItem);
    const index = this.items.findIndex(i => i.id === id);
    if (index >= 0) this.items.splice(index, 1);
  }
  
  async moveItem(data) {
    const response = await axios.put(`${PREFIX}move/`, data);
    const { items } = response.data;
    this.items.forEach((item) => {
      this._updateItemData(item);
    });
  }
}
