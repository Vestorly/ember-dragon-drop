/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-dragon-drop',
  included: function(app) {
    //import dragula
    app.import(app.bowerDirectory + '/dragula.js/dist/dragula.js');
    app.import(app.bowerDirectory + '/dragula.js/dist/dragula.css');
  }
};
