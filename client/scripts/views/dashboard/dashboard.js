'use strict';

var dashboardNode = require('../../models/dashboard-node');
var dashboardLeaf = require('../../models/dashboard-leaf');

var DashboardView = Backbone.View.extend({

  el: 'body',

  template: JST['client/templates/dashboard/dashboard.hbs'],

  events: {
  },

  initialize: function() {
    this.render();
    this.initGridster();
  },

  initGridster: function(){

    this.$('.gridster ul').gridster({
        widget_margins: [10, 10],
        widget_base_dimensions: [140, 140]
    });
  },

  render: function() {

    this.$el.html(this.template({}));
    return this;
  }

});

module.exports = DashboardView;
