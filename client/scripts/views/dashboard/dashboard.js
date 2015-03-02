'use strict';

var dashboardNode = require('../../models/dashboard-node');
var dashboardLeaf = require('../../models/dashboard-leaf');

var DashboardView = Backbone.View.extend({

  el: '.content',

  template: JST['client/templates/dashboard/dashboard.hbs'],

  events: {
  },

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.html(this.template({
      
    }));
    return this;
  }

});

module.exports = DashboardView;
