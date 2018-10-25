import Component from '../Component';

import './ListItem.css';
import template from './ListItem.html';

import handleIcon from '../assets/handle.svg';
import deleteIcon from '../assets/delete.svg';
import editIcon from '../assets/edit.svg';

export default class ListItem extends Component {
  constructor() {
    super(template);
    this.item = null;
  
    this.editListeners = [];
    this.deleteListeners = [];
  }

  mounted() {
    this.refs = {
      image: this.el.querySelector('.ListItem__image'),
      description: this.el.querySelector('.ListItem__description'),
      editButton: this.el.querySelector('.ListItem__editButton'),
      deleteButton: this.el.querySelector('.ListItem__deleteButton'),
      dragHandle: this.el.querySelector('.ListItem__dragHandle'),
    };
    this.updateItemData();
    this.refs.editButton.innerHTML = editIcon;
    this.refs.dragHandle.innerHTML = handleIcon;
    this.refs.deleteButton.innerHTML = deleteIcon;
    this.refs.editButton.addEventListener('click', () => {
      this.editListeners.forEach(cb => cb(this.item));
    });
    this.refs.deleteButton.addEventListener('click', () => {
      this.deleteListeners.forEach(cb => cb(this.item));
    });
  }

  setItem(item) {
    this.item = item;
    if (this.el) {
      this.updateItemData();
    }
  }

  editInfo({ image, description }) {
    if (image) this.item.image = image;
    if (description) this.item.description = description;
    this.updateItemData();
  }

  updateItemData() {
    if (this.item.image) this.refs.image.src = this.item.image;
    this.refs.description.textContent = this.item.description;
  }

  listenToEditEvent(callback) {
    this.editListeners.push(callback);
  }

  listenToDeleteEvent(callback) {
    this.deleteListeners.push(callback);
  }
}
