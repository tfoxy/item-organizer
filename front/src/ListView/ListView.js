import 'dragula/dist/dragula.css';
import dragula from 'dragula';

import Component from '../Component';
import ListItem from '../ListItem/ListItem';
import ItemService from '../Item.service';

import './ListView.css';
import template from './ListView.html';

export default class ListView extends Component {
  constructor() {
    super(template);
    this.itemService = new ItemService();
    this.listItemMap = new Map();

    this.createItem = this.createItem.bind(this);
    this.editItem = this.editItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.itemDropped = this.itemDropped.bind(this);
  }

  mounted() {
    this.refs = {
      items: this.el.querySelector('.ListView__items'),
      form: this.el.querySelector('.ListView__form'),
      idInput: this.el.querySelector('.ListView__idInput'),
      descriptionInput: this.el.querySelector('.ListView__descriptionInput'),
      imageInput: this.el.querySelector('.ListView__imageInput'),
    };

    this.refs.form.addEventListener('submit', this.createItem);

    const drake = dragula([this.refs.items], {
      moves(el, container, handle) {
        do {
          if (handle.classList.contains('ListItem__dragHandle')) {
            return true;
          }
          handle = handle.parentElement;
        } while(handle);
      },
    });
    drake.on('drop', this.itemDropped);

    this.itemService.fetchAllItems().then((items) => {
      items.forEach((item) => {
        this.addItemToMap(item);
      });
    });
  }

  async addItem(itemData) {
    const item = await this.itemService.createItem(itemData);
    this.addItemToMap(item);
  }

  async addItemToMap(item) {
    const listItem = new ListItem();
    listItem.setItem(item);
    listItem.listenToEditEvent(this.editItem);
    listItem.listenToDeleteEvent(this.deleteItem);
    this.listItemMap.set(item.id, listItem);
    if (this.refs) {
      this.refs.items.appendChild(listItem.mount());
    }
  }

  async createItem(event) {
    event.preventDefault();
    const id = this.refs.idInput.value;
    const description = this.refs.descriptionInput.value;
    const image = this.refs.imageInput.files[0];
    const listItem = this.listItemMap.get(id);
    if (listItem) {
      await listItem.editInfo({ description });
    } else {
      await this.addItem({
        id,
        description,
        image,
      });
    }
    this.refs.form.reset();
  }

  editItem(item) {
    this.refs.idInput.value = item.id;
    this.refs.descriptionInput.value = item.description;
    this.refs.descriptionInput.focus();
  };

  deleteItem(item) {
    this.listItemMap.get(item.id).destroy();
    this.itemService.deleteItem(item.id);
  };

  itemDropped(el, target, source, sibling) {
    const listItemValues = Array.from(this.listItemMap.values());
    const listItem = listItemValues.find(i => i.el === el);
    const siblingListItem = sibling ? listItemValues.find(i => i.el === sibling) : null;
    const siblingItem = siblingListItem ? siblingListItem.item : null;
    this.itemService.moveItem({
      id: listItem.item.id,
      afterId: siblingItem ? siblingItem.id : null,
    });
  }

  getLastItem() {
    if (this.items.length === 0) return null;
    let item = this.items[0];
    while (item.afterId) {
      item = this.listItemMap.get(item.afterId).item;
    }
    return item;
  }
}