/**
*   User Model Spec Test
*/


'use strict';

var userModel = require('../../../client/scripts/models/user');

describe('User Model', function() {

  it('provides the "User Model" instance', function() {
    // Expect it to exist
    expect(userModel).toBeDefined();
  });

});
