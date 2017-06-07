import Ember from 'ember';

const {
  Component,
  run
} = Ember;

const dragulaOptions = [
  'moves',
  'accepts',
  'invalid',
  'containers',
  'isContainer',
  'copy',
  'copySortSource',
  'revertOnSpill',
  'removeOnSpill',
  'direction',
  'ignoreInputTextSelection',
  'mirrorContainer'
];

const dragulaEvents = [
  'drag',
  'dragend',
  'drop',
  'cancel',
  'remove',
  'shadow',
  'over',
  'out',
  'cloned'
];

export default Component.extend({

  /**
   Dragula object that gets set on `didInsertElement`.
   @property drake
   @type {Object}
   @default null
   */

  drake: null,

  /**
   Currently dragged item.
   @property _currentItem
   @type {Object}
   @default null
   */

  _currentItem: null,

  /**
   Property to re-insert the `dragon-drop` component.
   @property listVisible
   @type {Boolean}
   @default true
   */

  listVisible: true,

  /**
   Adds dragula events and sets `drake` object.
   @method didInsertElement
   */

  didInsertElement() {
    this._super(...arguments);

    let options = this.getProperties(dragulaOptions);
    options.containers = options.containers ? options.containers.split(' ').map(selector => document.querySelector(selector)) : [];
    options.containers.push(this.element);

    this.set('drake', window.dragula(options));
    this._setEvents();
  },

  /**
   Destroys `drake` object.
   @method willDestroyElement
   */

  willDestroyElement() {
    this._super(...arguments);
    this.get('drake.containers').removeObject(this.element);
    this.get('drake').destroy();
    this.set('drake', null);
  },

  /**
   Sets all dragula events onto `drake` object.
   @method _setEvents
   @private
   */

  _setEvents() {
    let drake = this.get('drake'),
        self = this;

    drake.on('drag', (elt) => {
      this.set('_currentItem', this.eltToData(elt));
    });

    drake.on('drop', (elt) => {
      let model = this.get('model'),
          eltData = this.get('_currentItem'),
          newIndex = this.eltIndex(elt);

      model.removeObject(eltData);
      model.insertAt(newIndex, eltData);
      if (this.get('reset')) {
        elt.remove();
        this._resetView();        
      }
    });

    dragulaEvents.forEach(eventName => {
      if (!this[eventName]) { return; }

      drake.on(eventName, function() {
        let model = self.get('model'),
            eltData = self.get('_currentItem');
        self.sendAction(eventName, eltData, model, ...arguments);
      });
    });
  },

  /**
   Re-inserts the list items to force a rerender after drag and drop.
   Idea is to force ember and dragula to sync up DOM elements.
   @method _resetView
   @private
   */

  _resetView() {
    this.set('listVisible', false);

    run.next(this, function() {
      this.set('listVisible', true);
    });
  },

  /**
   Returns dragged object in the model.
   @method eltToData
   */

  eltToData(elt) {
    let index = this.eltIndex(elt);
    if (index > -1) {
      return this.get('model').objectAt(index);
    }
  },

  /**
   Returns index of the dragged item(s) in the DOM.
   @method eltIndex
   */

  eltIndex(elt) {
    let dragItems = this.$().children();
    return dragItems.index(elt);
  }

});
