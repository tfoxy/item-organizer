export default class Component {
  constructor(template) {
    this.el = null;
    this.refs = null;
    this.template = template;
  }

  mount() {
    const div = document.createElement('div');
    div.innerHTML = this.template;
    this.el = div.firstChild;
    if (this.mounted) this.mounted();
    return this.el;
  }

  destroy() {
    this.el.parentElement.removeChild(this.el);
  }
}
