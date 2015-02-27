/**
*   Settings View Spec Test
*/


'use strict';

var SettingsView = require('../../../../client/scripts/views/account/settings');

describe('Settings View', function() {

  beforeEach(function() {
    this.settingsView = new SettingsView();
  });

  it('provides the "Settings View" instance', function() {
    // Expect it to exist
    expect(this.settingsView).toBeDefined();
  });

});
