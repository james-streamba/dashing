/**
*   Messages Model Spec Test
*/


'use strict';

var messagesModel = require('../../../client/scripts/models/messages');

describe('Messages Model', function() {

  it('provides the "Messages Model" instance', function() {
    // Expect it to exist
    expect(messagesModel).toBeDefined();
  });

});
