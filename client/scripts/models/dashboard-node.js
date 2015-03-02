'use strict';

var DashboardNode = Backbone.Model.extend({

  initialize: function() {
  },

  defaults: {
    name: 'default_dashboard_module'
  }

});

module.exports = DashboardNode;