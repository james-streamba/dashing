'use strict';

var messages = require('../../models/messages');

var Messages = Backbone.View.extend({

  el: '.messages',

  template: JST['client/templates/modules/messages.hbs'],

  events: {},

  initialize: function() {
    // Re-render template when messages model changes
    this.listenTo(messages, 'change', this.render);
    this.render();
  },

  render: function() {
    this.$el.html(this.template(messages.toJSON()));
    return this;
  }

});

module.exports = Messages;
