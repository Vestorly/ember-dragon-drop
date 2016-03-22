import Ember from 'ember';

const {Component, on} = Ember;
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
	registerDrake: on('didInsertElement', function () {
    let options = this.getProperties(dragulaOptions);
    options.containers = options.containers ? options.containers.split(' ').map(selector => document.querySelector(selector)) : [];
    options.containers.push(this.element);

    let drake = window.dragula(options);
    this.set('drake', drake);

    let model = this.get('model');
    let self = this;

    drake.on('drag', (elt) => {
      this.set('_currentItem', this.eltToData(elt));
    });

    drake.on('drop', (elt) => {
      let eltData = this.get('_currentItem');
      let newIndex = this.eltIndex(elt);
      model.removeObject(eltData);
      model.insertAt(newIndex, eltData);
      this.rerender();
    });

    dragulaEvents.forEach(eventName => {
      if (!this[eventName]) { return; }

      drake.on(eventName, function() {
        let eltData = self.get('_currentItem');
        self.sendAction(eventName, eltData, model, ...arguments);
      });
    });
	}),

  eltToData(elt) {
    let model = this.get('model');
    let index = this.eltIndex(elt);
    if (index > -1) {
      return model.objectAt(index);
    }
  },

  eltIndex(elt) {
    let dragItems = this.$().children();
    return dragItems.index(elt);
  },

  destroyDrake: on('willDestroyElement', function () {
		this.get('drake.containers').removeObject(this.element);
		this.get('drake').destroy();
		this.set('drake', '');
	})
});
