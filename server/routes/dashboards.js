/**
 * Dashbords Routes
 */

'use strict';

var dashboardsController = require('../controllers/dashboards');
var auth = require('../auth');

var routes = function(app) {

  // Read
  app.get('/api/dashboards', auth.isAuthenticated, dashboardsController.getDashboards);

};

module.exports = routes;
