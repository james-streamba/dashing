/**
 * Main Controller
 */

'use strict';

var User = require('mongoose').model('user');
var auth = require('../auth');

/**
 * GET /dashboards
 * Read user data.
 */
var getDashboards = function(req, res, next) {
  
  res.status(200).json([
  {
    name: "Den Helder"
  },
  {
    name: "Aberdeen"
  },
  {
    name: "Great Yarmouth"
  },
  {
    name: "Ijmuiden"
  }
  ]);
};

module.exports = {
  getDashboards: getDashboards
};
