/**
*   Forgot View Spec Test
*/


'use strict';

var ForgotView = require('../../../../client/scripts/views/account/forgot');

describe('Forgot View', function() {

  beforeEach(function() {
    this.forgotView = new ForgotView();
  });

  it('provides the "Forgot View" instance', function() {
    // Expect it to exist
    expect(this.forgotView).toBeDefined();
  });

});
