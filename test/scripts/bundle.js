(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jamesmaciver/Dev/dashing/client/scripts/models/messages.js":[function(require,module,exports){
'use strict';

var Messages = Backbone.Model.extend({

  initialize: function() {
  },

  defaults: {
    messages: {}
  },

  setMessages: function(data) {
    if (!_.isEmpty(data)) {
      this.set({
        messages: data
      });
    }
  }

});

module.exports = new Messages();

},{}],"/Users/jamesmaciver/Dev/dashing/client/scripts/models/user.js":[function(require,module,exports){
'use strict';

var messages = require('./messages');

var User = Backbone.Model.extend({

  idAttribute: '_id',

  url: '/user',

  initialize: function() {
  },

  defaults: {
    loggedIn: false,

    email: '',
    role: 'user',
    password: '',

    // Profile info
    firstName: '',
    lastName: '',
    picture: ''

  },

  // Check to see if current user is authenticated
  isAuthenticated: function(callback) {
    var self = this;
    this.fetch({
      success: function(model, res) {
        if (!res.error && res.user) {
          var userData = res.user;
          userData.loggedIn = true;

          self.set(userData);

          if (callback && callback.success) {
            callback.success(res);
          }
        } else {
          self.set({
            loggedIn: false
          });
          if (callback && callback.error) {
            callback.error(res);
          }
        }
      },
      error: function(model, res) {
        self.set({
          loggedIn: false
        });
        if (callback && callback.error) {
          callback.error(res);
        }
      }
    }).complete(function() {
      if (callback && callback.complete) {
        callback.complete();
      }
    });
  },

  postForm: function($form, callback) {
    var self = this;
    var postData = $form.serialize();
    var postUrl = $form.attr('action') || window.location.pathname;
    var options = callback.options || {};

    $.ajax({
      url: postUrl,
      dataType: 'json',
      data: postData,
      type: 'post',
      success: function(res) {

        if (!res.error) {
          // If user needs to be authenticated
          if (options.setToken) {
            // Store token in cookie that expires in a week
            self.setToken(res.token, 7);
          }
          // If user needs to be updated
          if (options.updateUser) {
            var userData = res.user;
            userData.loggedIn = true;

            self.set(userData);
          }
          if (callback.success) {
            callback.success(res);
          }
          if (options.successUrl) {
            Backbone.history.navigate(options.successUrl, {trigger: true});
          }
        } else {
          if (callback.error) {
            callback.error(res);
          }
          if (options.errorUrl) {
            Backbone.history.navigate(options.errorUrl, {trigger: true});
          }
        }
      },
      error: function(res) {
        if (callback.error) {
          callback.error(res);
        }
        if (options.errorUrl) {
          Backbone.history.navigate(options.errorUrl, {trigger: true});
        }
      }
    }).complete(function(res) {
      messages.setMessages(res.responseJSON);
      if (callback.complete) {
        callback.complete(res);
      }
    });
  },

  getToken: function() {
    return $.cookie('token');
  },

  setToken: function(token, duration) {
    return $.cookie('token', token, {expires: duration});
  },


  login: function($form, callback) {
    var cb = callback || function() {};
    cb.options = {
      successUrl: '/',
      errorUrl: '/login',
      setToken: true,
      updateUser: true
    };
    this.postForm($form, cb);
  },

  logout: function() {
    // Remove any auth cookies
    $.removeCookie('token');

    this.set({
      loggedIn: false
    });

    // Reset model data
    this.clear();

    // Redirect to root
    Backbone.history.navigate('/', true);
  },

  signup: function($form, callback) {
    var cb = callback || function() {};
    cb.options = {
      successUrl: '/',
      errorUrl: '/signup',
      setToken: true,
      updateUser: true
    };
    this.postForm($form, cb);
  },

  forgot: function($form, callback) {
    var cb = callback || function() {};
    cb.options = {
      successUrl: '/',
      errorUrl: '/forgot'
    };
    this.postForm($form, cb);
  },

  reset: function($form, callback) {
    var cb = callback || function() {};
    cb.options = {
      successUrl: '/',
      errorUrl: window.location.pathname
    };
    this.postForm($form, cb);
  },

  updateSettings: function($form, callback) {
    var cb = callback || function() {};
    cb.options = {
      successUrl: '/settings',
      errorUrl: '/settings',
      updateUser: true
    };
    this.postForm($form, cb);
  },

  updatePassword: function($form, callback) {
    var cb = callback || function() {};
    cb.options = {
      successUrl: '/settings',
      errorUrl: '/settings'
    };
    this.postForm($form, cb);
  }

});

module.exports = new User();

},{"./messages":"/Users/jamesmaciver/Dev/dashing/client/scripts/models/messages.js"}],"/Users/jamesmaciver/Dev/dashing/client/scripts/routes.js":[function(require,module,exports){
'use strict';

var user = require('./models/user');
var messages = require('./models/messages');
var router = require('./routes');
var LoginView = require('./views/account/login');
var SignupView = require('./views/account/signup');
var ResetView = require('./views/account/reset');
var ForgotView = require('./views/account/forgot');
var SettingsView = require('./views/account/settings');
var DefaultView = require('./views/layouts/default');
var IndexView = require('./views/index');

// Handle displaying and cleaning up views
var currentView;
var render = function(view) {
  if (currentView) {
    currentView.close();
  }

  currentView = view;

  $('#app-wrapper').html(currentView.render().$el);
};

var Router = Backbone.Router.extend({

  routes: {
    'login': 'login',
    'forgot': 'forgot',
    'reset/:token': 'reset',
    'signup': 'signup',
    'settings': 'settings',
    '': 'index'
  },
  index: function() {
    var homePage = new DefaultView({
      subviews: {
        '.content': new IndexView()
      }
    });
    render(homePage);
  },

  login: function() {
    // If user is logged in, redirect to settings page
    if (user.get('loggedIn')) {
      return router.navigate('/settings', {trigger: true});
    }
    var loginPage = new DefaultView({
      subviews: {
        '.content': new LoginView()
      }
    });
    render(loginPage);
  },


  forgot: function() {
    // If user is logged in, redirect to settings page
    if (user.get('loggedIn')) {
      return router.navigate('/settings', {trigger: true});
    }
    // If reset token is invalid or has expired, display error message
    if (window.location.search === '?error=invalid') {
      messages.setMessages({
        errors: [{
          msg: 'Reset is invalid or has expired.'
        }]
      });
    }
    var forgotPage = new DefaultView({
      subviews: {
        '.content': new ForgotView()
      }
    });
    render(forgotPage);
  },

  reset: function() {
    // If user is logged in, redirect to settings page
    if (user.get('loggedIn')) {
      return router.navigate('/settings', {trigger: true});
    }
    var resetPage = new DefaultView({
      subviews: {
        '.content': new ResetView()
      }
    });
    render(resetPage);
  },

  signup: function() {
    // If user is logged in, redirect to settings page
    if (user.get('loggedIn')) {
      return router.navigate('/settings', {trigger: true});
    }
    var signupPage = new DefaultView({
      subviews: {
        '.content': new SignupView()
      }
    });
    render(signupPage);
  },

  settings: function() {
    // If user is not logged in, redirect to login page
    if (!user.get('loggedIn')) {
      return router.navigate('/login', {trigger: true});
    }
    var settingsPage = new DefaultView({
      subviews: {
        '.content': new SettingsView()
      }
    });
    render(settingsPage);
  },

  // Runs before every route loads
  execute: function(callback, args) {
    // Clear out any global messages
    messages.clear();
    if (callback) {
      callback.apply(this, args);
    }
  }
});

module.exports = new Router();

},{"./models/messages":"/Users/jamesmaciver/Dev/dashing/client/scripts/models/messages.js","./models/user":"/Users/jamesmaciver/Dev/dashing/client/scripts/models/user.js","./routes":"/Users/jamesmaciver/Dev/dashing/client/scripts/routes.js","./views/account/forgot":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/forgot.js","./views/account/login":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/login.js","./views/account/reset":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/reset.js","./views/account/settings":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/settings.js","./views/account/signup":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/signup.js","./views/index":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/index.js","./views/layouts/default":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/layouts/default.js"}],"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/forgot.js":[function(require,module,exports){
'use strict';

var user = require('../../models/user');

var Forgot = Backbone.View.extend({

  el: '.content',

  template: JST['client/templates/account/forgot.hbs'],

  events: {
    'submit form': 'formSubmit'
  },

  initialize: function() {
    this.render();
  },

  formSubmit: function(e) {
    e.preventDefault();
    var $form = $(e.currentTarget);
    user.forgot($form);
  },

  render: function() {
    this.$el.html(this.template);
    return this;
  }

});

module.exports = Forgot;

},{"../../models/user":"/Users/jamesmaciver/Dev/dashing/client/scripts/models/user.js"}],"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/login.js":[function(require,module,exports){
'use strict';

var user = require('../../models/user');

var Login = Backbone.View.extend({

  el: '.content',

  template: JST['client/templates/account/login.hbs'],

  events: {
    'submit form': 'formSubmit'
  },

  initialize: function() {
    this.render();
  },

  formSubmit: function(e) {
    e.preventDefault();
    var $form = $(e.currentTarget);
    user.login($form);
  },

  render: function() {
    this.$el.html(this.template);
    return this;
  }

});

module.exports = Login;

},{"../../models/user":"/Users/jamesmaciver/Dev/dashing/client/scripts/models/user.js"}],"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/reset.js":[function(require,module,exports){
'use strict';

var user = require('../../models/user');

var Reset = Backbone.View.extend({

  el: '.content',

  template: JST['client/templates/account/reset.hbs'],

  events: {
    'submit form': 'formSubmit'
  },

  initialize: function() {
    this.render();
  },

  formSubmit: function(e) {
    e.preventDefault();
    var $form = $(e.currentTarget);
    user.reset($form);
  },

  render: function() {
    this.$el.html(this.template);
    return this;
  }

});

module.exports = Reset;

},{"../../models/user":"/Users/jamesmaciver/Dev/dashing/client/scripts/models/user.js"}],"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/settings.js":[function(require,module,exports){
'use strict';

var user = require('../../models/user');
var messages = require('../../models/messages');

var Settings = Backbone.View.extend({

  el: '.content',

  template: JST['client/templates/account/settings.hbs'],

  events: {
    'submit #profile-form': 'formInfo',
    'submit #password-form': 'formPassword',
    'submit #delete-form': 'formDelete',
  },

  initialize: function() {
    this.render();
  },

  formInfo: function(e) {
    e.preventDefault();
    var $form = $(e.currentTarget);
    user.updateSettings($form);
  },

  formPassword: function(e) {
    e.preventDefault();
    var $form = $(e.currentTarget);
    user.updatePassword($form);
  },

  formDelete: function(e) {
    e.preventDefault();
    user.destroy({
      success: function(res) {
        user.logout();
        Backbone.history.navigate('/', {trigger: true});
      },
      complete: function(res) {
        messages.setMessages(res.responseJSON);
      }
    });
  },

  render: function() {
    this.$el.html(this.template({
      user: user.toJSON()
    }));
    return this;
  }

});

module.exports = Settings;

},{"../../models/messages":"/Users/jamesmaciver/Dev/dashing/client/scripts/models/messages.js","../../models/user":"/Users/jamesmaciver/Dev/dashing/client/scripts/models/user.js"}],"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/signup.js":[function(require,module,exports){
'use strict';

var user = require('../../models/user');

var Signup = Backbone.View.extend({

  el: '.content',

  template: JST['client/templates/account/signup.hbs'],

  events: {
    'submit form': 'formSubmit'
  },

  initialize: function() {
    this.render();
  },

  formSubmit: function(e) {
    e.preventDefault();
    var $form = $(e.currentTarget);
    user.signup($form);
  },

  render: function() {
    this.$el.html(this.template);
    return this;
  }

});

module.exports = Signup;

},{"../../models/user":"/Users/jamesmaciver/Dev/dashing/client/scripts/models/user.js"}],"/Users/jamesmaciver/Dev/dashing/client/scripts/views/index.js":[function(require,module,exports){
'use strict';

var IndexView = Backbone.View.extend({

  el: '.content',

  template: JST['client/templates/index.hbs'],

  events: {},

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.html(this.template);
    return this;
  }

});

module.exports = IndexView;

},{}],"/Users/jamesmaciver/Dev/dashing/client/scripts/views/layouts/default.js":[function(require,module,exports){
'use strict';

var NavbarView = require('../modules/navbar');
var MessagesView = require('../modules/messages');

var Default = Backbone.View.extend({

  template: JST['client/templates/layouts/default.hbs'],

  events: {},

  initialize: function(options) {
    // Check to see if any options were passed in
    if (options) {
      this.options = options;
    }
  },

  render: function() {
    this.$el.html(this.template);

    // If subviews are passed in, then assign/render them
    if (this.options && this.options.subviews) {
      this.assign(_.extend(
        this.options.subviews,
        this.subviews
      ));
    }
    else {
      // Assign/Render subviews
      this.assign(this.subviews);
    }

    return this;
  },

  subviews: {
    '.main-nav': new NavbarView(),
    '.messages': new MessagesView()
  }

});

module.exports = Default;

},{"../modules/messages":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/modules/messages.js","../modules/navbar":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/modules/navbar.js"}],"/Users/jamesmaciver/Dev/dashing/client/scripts/views/modules/messages.js":[function(require,module,exports){
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

},{"../../models/messages":"/Users/jamesmaciver/Dev/dashing/client/scripts/models/messages.js"}],"/Users/jamesmaciver/Dev/dashing/client/scripts/views/modules/navbar.js":[function(require,module,exports){
/**
*   Navbar View
*/

'use strict';

var user = require('../../models/user');
var messages = require('../../models/messages');

var Navbar = Backbone.View.extend({

  el: '.main-nav',

  template: JST['client/templates/modules/navbar.hbs'],

  events: {
    'click #logoutLink': 'handleLogout'
  },

  initialize: function() {
    // Re-render template when user model changes
    this.listenTo(user, 'change', this.render);
    this.render();
  },

  handleLogout: function(e) {
    e.preventDefault();
    user.logout();
  },

  render: function() {
    this.$el.html(this.template({
      loggedIn: user.get('loggedIn'),
      user: user.toJSON()
    }));
    return this;
  }

});

module.exports = Navbar;

},{"../../models/messages":"/Users/jamesmaciver/Dev/dashing/client/scripts/models/messages.js","../../models/user":"/Users/jamesmaciver/Dev/dashing/client/scripts/models/user.js"}],"/Users/jamesmaciver/Dev/dashing/test/spec/models/messages.spec.js":[function(require,module,exports){
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

},{"../../../client/scripts/models/messages":"/Users/jamesmaciver/Dev/dashing/client/scripts/models/messages.js"}],"/Users/jamesmaciver/Dev/dashing/test/spec/models/user.spec.js":[function(require,module,exports){
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

},{"../../../client/scripts/models/user":"/Users/jamesmaciver/Dev/dashing/client/scripts/models/user.js"}],"/Users/jamesmaciver/Dev/dashing/test/spec/routes.spec.js":[function(require,module,exports){
/**
*   Router Spec Test
*/


'use strict';

var router = require('../../client/scripts/routes');

describe('Router', function() {

  it('provides the "Router" instance', function() {
    // Expect it to exist
    expect(router).toBeDefined();
  });

});

},{"../../client/scripts/routes":"/Users/jamesmaciver/Dev/dashing/client/scripts/routes.js"}],"/Users/jamesmaciver/Dev/dashing/test/spec/views/account/forgot.spec.js":[function(require,module,exports){
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

},{"../../../../client/scripts/views/account/forgot":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/forgot.js"}],"/Users/jamesmaciver/Dev/dashing/test/spec/views/account/login.spec.js":[function(require,module,exports){
/**
*   Login View Spec Test
*/


'use strict';

var LoginView = require('../../../../client/scripts/views/account/login');

describe('Login View', function() {

  beforeEach(function() {
    this.loginView = new LoginView();
  });

  it('provides the "Login View" instance', function() {
    // Expect it to exist
    expect(this.loginView).toBeDefined();
  });

});

},{"../../../../client/scripts/views/account/login":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/login.js"}],"/Users/jamesmaciver/Dev/dashing/test/spec/views/account/reset.spec.js":[function(require,module,exports){
/**
*   Reset View Spec Test
*/


'use strict';

var ResetView = require('../../../../client/scripts/views/account/reset');

describe('Reset View', function() {

  beforeEach(function() {
    this.resetView = new ResetView();
  });

  it('provides the "Reset View" instance', function() {
    // Expect it to exist
    expect(this.resetView).toBeDefined();
  });

});

},{"../../../../client/scripts/views/account/reset":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/reset.js"}],"/Users/jamesmaciver/Dev/dashing/test/spec/views/account/settings.spec.js":[function(require,module,exports){
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

},{"../../../../client/scripts/views/account/settings":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/settings.js"}],"/Users/jamesmaciver/Dev/dashing/test/spec/views/account/signup.spec.js":[function(require,module,exports){
/**
*   Signup View Spec Test
*/


'use strict';

var SignupView = require('../../../../client/scripts/views/account/signup');

describe('Signup View', function() {

  beforeEach(function() {
    this.signupView = new SignupView();
  });

  it('provides the "Signup View" instance', function() {
    // Expect it to exist
    expect(this.signupView).toBeDefined();
  });

});

},{"../../../../client/scripts/views/account/signup":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/account/signup.js"}],"/Users/jamesmaciver/Dev/dashing/test/spec/views/index.spec.js":[function(require,module,exports){
/**
*   Index View Spec Test
*/


'use strict';

var IndexView = require('../../../client/scripts/views/index');

describe('Index View', function() {

  beforeEach(function() {
    this.indexView = new IndexView();
  });

  it('provides the "Index View" instance', function() {
    // Expect it to exist
    expect(this.indexView).toBeDefined();
  });

});

},{"../../../client/scripts/views/index":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/index.js"}],"/Users/jamesmaciver/Dev/dashing/test/spec/views/layouts/default.spec.js":[function(require,module,exports){
/**
*   Default View Spec Test
*/


'use strict';

var DefaultView = require('../../../../client/scripts/views/layouts/default');

describe('Default View', function() {

  beforeEach(function() {
    this.defaultView = new DefaultView();
  });

  it('provides the "Default View" instance', function() {
    // Expect it to exist
    expect(this.defaultView).toBeDefined();
  });

});

},{"../../../../client/scripts/views/layouts/default":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/layouts/default.js"}],"/Users/jamesmaciver/Dev/dashing/test/spec/views/modules/messages.spec.js":[function(require,module,exports){
/**
*   Messages View Spec Test
*/


'use strict';

var MessagesView = require('../../../../client/scripts/views/modules/messages');

describe('Messages View', function() {

  beforeEach(function() {
    this.messagesView = new MessagesView();
  });

  it('provides the "Messages View" instance', function() {
    // Expect it to exist
    expect(this.messagesView).toBeDefined();
  });

});

},{"../../../../client/scripts/views/modules/messages":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/modules/messages.js"}],"/Users/jamesmaciver/Dev/dashing/test/spec/views/modules/navbar.spec.js":[function(require,module,exports){
/**
*   Navbar View Spec Test
*/


'use strict';

var NavbarView = require('../../../../client/scripts/views/modules/navbar');

describe('Navbar View', function() {

  beforeEach(function() {
    this.navbarView = new NavbarView();
  });

  it('provides the "Navbar View" instance', function() {
    // Expect it to exist
    expect(this.navbarView).toBeDefined();
  });

});

},{"../../../../client/scripts/views/modules/navbar":"/Users/jamesmaciver/Dev/dashing/client/scripts/views/modules/navbar.js"}]},{},["/Users/jamesmaciver/Dev/dashing/test/spec/models/messages.spec.js","/Users/jamesmaciver/Dev/dashing/test/spec/models/user.spec.js","/Users/jamesmaciver/Dev/dashing/test/spec/routes.spec.js","/Users/jamesmaciver/Dev/dashing/test/spec/views/account/forgot.spec.js","/Users/jamesmaciver/Dev/dashing/test/spec/views/account/login.spec.js","/Users/jamesmaciver/Dev/dashing/test/spec/views/account/reset.spec.js","/Users/jamesmaciver/Dev/dashing/test/spec/views/account/settings.spec.js","/Users/jamesmaciver/Dev/dashing/test/spec/views/account/signup.spec.js","/Users/jamesmaciver/Dev/dashing/test/spec/views/index.spec.js","/Users/jamesmaciver/Dev/dashing/test/spec/views/layouts/default.spec.js","/Users/jamesmaciver/Dev/dashing/test/spec/views/modules/messages.spec.js","/Users/jamesmaciver/Dev/dashing/test/spec/views/modules/navbar.spec.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc2NyaXB0cy9tb2RlbHMvbWVzc2FnZXMuanMiLCJjbGllbnQvc2NyaXB0cy9tb2RlbHMvdXNlci5qcyIsImNsaWVudC9zY3JpcHRzL3JvdXRlcy5qcyIsImNsaWVudC9zY3JpcHRzL3ZpZXdzL2FjY291bnQvZm9yZ290LmpzIiwiY2xpZW50L3NjcmlwdHMvdmlld3MvYWNjb3VudC9sb2dpbi5qcyIsImNsaWVudC9zY3JpcHRzL3ZpZXdzL2FjY291bnQvcmVzZXQuanMiLCJjbGllbnQvc2NyaXB0cy92aWV3cy9hY2NvdW50L3NldHRpbmdzLmpzIiwiY2xpZW50L3NjcmlwdHMvdmlld3MvYWNjb3VudC9zaWdudXAuanMiLCJjbGllbnQvc2NyaXB0cy92aWV3cy9pbmRleC5qcyIsImNsaWVudC9zY3JpcHRzL3ZpZXdzL2xheW91dHMvZGVmYXVsdC5qcyIsImNsaWVudC9zY3JpcHRzL3ZpZXdzL21vZHVsZXMvbWVzc2FnZXMuanMiLCJjbGllbnQvc2NyaXB0cy92aWV3cy9tb2R1bGVzL25hdmJhci5qcyIsInRlc3Qvc3BlYy9tb2RlbHMvbWVzc2FnZXMuc3BlYy5qcyIsInRlc3Qvc3BlYy9tb2RlbHMvdXNlci5zcGVjLmpzIiwidGVzdC9zcGVjL3JvdXRlcy5zcGVjLmpzIiwidGVzdC9zcGVjL3ZpZXdzL2FjY291bnQvZm9yZ290LnNwZWMuanMiLCJ0ZXN0L3NwZWMvdmlld3MvYWNjb3VudC9sb2dpbi5zcGVjLmpzIiwidGVzdC9zcGVjL3ZpZXdzL2FjY291bnQvcmVzZXQuc3BlYy5qcyIsInRlc3Qvc3BlYy92aWV3cy9hY2NvdW50L3NldHRpbmdzLnNwZWMuanMiLCJ0ZXN0L3NwZWMvdmlld3MvYWNjb3VudC9zaWdudXAuc3BlYy5qcyIsInRlc3Qvc3BlYy92aWV3cy9pbmRleC5zcGVjLmpzIiwidGVzdC9zcGVjL3ZpZXdzL2xheW91dHMvZGVmYXVsdC5zcGVjLmpzIiwidGVzdC9zcGVjL3ZpZXdzL21vZHVsZXMvbWVzc2FnZXMuc3BlYy5qcyIsInRlc3Qvc3BlYy92aWV3cy9tb2R1bGVzL25hdmJhci5zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIE1lc3NhZ2VzID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgfSxcblxuICBkZWZhdWx0czoge1xuICAgIG1lc3NhZ2VzOiB7fVxuICB9LFxuXG4gIHNldE1lc3NhZ2VzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKCFfLmlzRW1wdHkoZGF0YSkpIHtcbiAgICAgIHRoaXMuc2V0KHtcbiAgICAgICAgbWVzc2FnZXM6IGRhdGFcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTWVzc2FnZXMoKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1lc3NhZ2VzID0gcmVxdWlyZSgnLi9tZXNzYWdlcycpO1xuXG52YXIgVXNlciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cbiAgaWRBdHRyaWJ1dGU6ICdfaWQnLFxuXG4gIHVybDogJy91c2VyJyxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgfSxcblxuICBkZWZhdWx0czoge1xuICAgIGxvZ2dlZEluOiBmYWxzZSxcblxuICAgIGVtYWlsOiAnJyxcbiAgICByb2xlOiAndXNlcicsXG4gICAgcGFzc3dvcmQ6ICcnLFxuXG4gICAgLy8gUHJvZmlsZSBpbmZvXG4gICAgZmlyc3ROYW1lOiAnJyxcbiAgICBsYXN0TmFtZTogJycsXG4gICAgcGljdHVyZTogJydcblxuICB9LFxuXG4gIC8vIENoZWNrIHRvIHNlZSBpZiBjdXJyZW50IHVzZXIgaXMgYXV0aGVudGljYXRlZFxuICBpc0F1dGhlbnRpY2F0ZWQ6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuZmV0Y2goe1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24obW9kZWwsIHJlcykge1xuICAgICAgICBpZiAoIXJlcy5lcnJvciAmJiByZXMudXNlcikge1xuICAgICAgICAgIHZhciB1c2VyRGF0YSA9IHJlcy51c2VyO1xuICAgICAgICAgIHVzZXJEYXRhLmxvZ2dlZEluID0gdHJ1ZTtcblxuICAgICAgICAgIHNlbGYuc2V0KHVzZXJEYXRhKTtcblxuICAgICAgICAgIGlmIChjYWxsYmFjayAmJiBjYWxsYmFjay5zdWNjZXNzKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5zdWNjZXNzKHJlcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuc2V0KHtcbiAgICAgICAgICAgIGxvZ2dlZEluOiBmYWxzZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChjYWxsYmFjayAmJiBjYWxsYmFjay5lcnJvcikge1xuICAgICAgICAgICAgY2FsbGJhY2suZXJyb3IocmVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24obW9kZWwsIHJlcykge1xuICAgICAgICBzZWxmLnNldCh7XG4gICAgICAgICAgbG9nZ2VkSW46IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgY2FsbGJhY2suZXJyb3IpIHtcbiAgICAgICAgICBjYWxsYmFjay5lcnJvcihyZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkuY29tcGxldGUoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoY2FsbGJhY2sgJiYgY2FsbGJhY2suY29tcGxldGUpIHtcbiAgICAgICAgY2FsbGJhY2suY29tcGxldGUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBwb3N0Rm9ybTogZnVuY3Rpb24oJGZvcm0sIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBwb3N0RGF0YSA9ICRmb3JtLnNlcmlhbGl6ZSgpO1xuICAgIHZhciBwb3N0VXJsID0gJGZvcm0uYXR0cignYWN0aW9uJykgfHwgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuICAgIHZhciBvcHRpb25zID0gY2FsbGJhY2sub3B0aW9ucyB8fCB7fTtcblxuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHBvc3RVcmwsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgZGF0YTogcG9zdERhdGEsXG4gICAgICB0eXBlOiAncG9zdCcsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXMpIHtcblxuICAgICAgICBpZiAoIXJlcy5lcnJvcikge1xuICAgICAgICAgIC8vIElmIHVzZXIgbmVlZHMgdG8gYmUgYXV0aGVudGljYXRlZFxuICAgICAgICAgIGlmIChvcHRpb25zLnNldFRva2VuKSB7XG4gICAgICAgICAgICAvLyBTdG9yZSB0b2tlbiBpbiBjb29raWUgdGhhdCBleHBpcmVzIGluIGEgd2Vla1xuICAgICAgICAgICAgc2VsZi5zZXRUb2tlbihyZXMudG9rZW4sIDcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBJZiB1c2VyIG5lZWRzIHRvIGJlIHVwZGF0ZWRcbiAgICAgICAgICBpZiAob3B0aW9ucy51cGRhdGVVc2VyKSB7XG4gICAgICAgICAgICB2YXIgdXNlckRhdGEgPSByZXMudXNlcjtcbiAgICAgICAgICAgIHVzZXJEYXRhLmxvZ2dlZEluID0gdHJ1ZTtcblxuICAgICAgICAgICAgc2VsZi5zZXQodXNlckRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2FsbGJhY2suc3VjY2Vzcykge1xuICAgICAgICAgICAgY2FsbGJhY2suc3VjY2VzcyhyZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3B0aW9ucy5zdWNjZXNzVXJsKSB7XG4gICAgICAgICAgICBCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKG9wdGlvbnMuc3VjY2Vzc1VybCwge3RyaWdnZXI6IHRydWV9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrLmVycm9yKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5lcnJvcihyZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3B0aW9ucy5lcnJvclVybCkge1xuICAgICAgICAgICAgQmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZShvcHRpb25zLmVycm9yVXJsLCB7dHJpZ2dlcjogdHJ1ZX0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrLmVycm9yKSB7XG4gICAgICAgICAgY2FsbGJhY2suZXJyb3IocmVzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5lcnJvclVybCkge1xuICAgICAgICAgIEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUob3B0aW9ucy5lcnJvclVybCwge3RyaWdnZXI6IHRydWV9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLmNvbXBsZXRlKGZ1bmN0aW9uKHJlcykge1xuICAgICAgbWVzc2FnZXMuc2V0TWVzc2FnZXMocmVzLnJlc3BvbnNlSlNPTik7XG4gICAgICBpZiAoY2FsbGJhY2suY29tcGxldGUpIHtcbiAgICAgICAgY2FsbGJhY2suY29tcGxldGUocmVzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBnZXRUb2tlbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICQuY29va2llKCd0b2tlbicpO1xuICB9LFxuXG4gIHNldFRva2VuOiBmdW5jdGlvbih0b2tlbiwgZHVyYXRpb24pIHtcbiAgICByZXR1cm4gJC5jb29raWUoJ3Rva2VuJywgdG9rZW4sIHtleHBpcmVzOiBkdXJhdGlvbn0pO1xuICB9LFxuXG5cbiAgbG9naW46IGZ1bmN0aW9uKCRmb3JtLCBjYWxsYmFjaykge1xuICAgIHZhciBjYiA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uKCkge307XG4gICAgY2Iub3B0aW9ucyA9IHtcbiAgICAgIHN1Y2Nlc3NVcmw6ICcvJyxcbiAgICAgIGVycm9yVXJsOiAnL2xvZ2luJyxcbiAgICAgIHNldFRva2VuOiB0cnVlLFxuICAgICAgdXBkYXRlVXNlcjogdHJ1ZVxuICAgIH07XG4gICAgdGhpcy5wb3N0Rm9ybSgkZm9ybSwgY2IpO1xuICB9LFxuXG4gIGxvZ291dDogZnVuY3Rpb24oKSB7XG4gICAgLy8gUmVtb3ZlIGFueSBhdXRoIGNvb2tpZXNcbiAgICAkLnJlbW92ZUNvb2tpZSgndG9rZW4nKTtcblxuICAgIHRoaXMuc2V0KHtcbiAgICAgIGxvZ2dlZEluOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgLy8gUmVzZXQgbW9kZWwgZGF0YVxuICAgIHRoaXMuY2xlYXIoKTtcblxuICAgIC8vIFJlZGlyZWN0IHRvIHJvb3RcbiAgICBCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcvJywgdHJ1ZSk7XG4gIH0sXG5cbiAgc2lnbnVwOiBmdW5jdGlvbigkZm9ybSwgY2FsbGJhY2spIHtcbiAgICB2YXIgY2IgPSBjYWxsYmFjayB8fCBmdW5jdGlvbigpIHt9O1xuICAgIGNiLm9wdGlvbnMgPSB7XG4gICAgICBzdWNjZXNzVXJsOiAnLycsXG4gICAgICBlcnJvclVybDogJy9zaWdudXAnLFxuICAgICAgc2V0VG9rZW46IHRydWUsXG4gICAgICB1cGRhdGVVc2VyOiB0cnVlXG4gICAgfTtcbiAgICB0aGlzLnBvc3RGb3JtKCRmb3JtLCBjYik7XG4gIH0sXG5cbiAgZm9yZ290OiBmdW5jdGlvbigkZm9ybSwgY2FsbGJhY2spIHtcbiAgICB2YXIgY2IgPSBjYWxsYmFjayB8fCBmdW5jdGlvbigpIHt9O1xuICAgIGNiLm9wdGlvbnMgPSB7XG4gICAgICBzdWNjZXNzVXJsOiAnLycsXG4gICAgICBlcnJvclVybDogJy9mb3Jnb3QnXG4gICAgfTtcbiAgICB0aGlzLnBvc3RGb3JtKCRmb3JtLCBjYik7XG4gIH0sXG5cbiAgcmVzZXQ6IGZ1bmN0aW9uKCRmb3JtLCBjYWxsYmFjaykge1xuICAgIHZhciBjYiA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uKCkge307XG4gICAgY2Iub3B0aW9ucyA9IHtcbiAgICAgIHN1Y2Nlc3NVcmw6ICcvJyxcbiAgICAgIGVycm9yVXJsOiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWVcbiAgICB9O1xuICAgIHRoaXMucG9zdEZvcm0oJGZvcm0sIGNiKTtcbiAgfSxcblxuICB1cGRhdGVTZXR0aW5nczogZnVuY3Rpb24oJGZvcm0sIGNhbGxiYWNrKSB7XG4gICAgdmFyIGNiID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oKSB7fTtcbiAgICBjYi5vcHRpb25zID0ge1xuICAgICAgc3VjY2Vzc1VybDogJy9zZXR0aW5ncycsXG4gICAgICBlcnJvclVybDogJy9zZXR0aW5ncycsXG4gICAgICB1cGRhdGVVc2VyOiB0cnVlXG4gICAgfTtcbiAgICB0aGlzLnBvc3RGb3JtKCRmb3JtLCBjYik7XG4gIH0sXG5cbiAgdXBkYXRlUGFzc3dvcmQ6IGZ1bmN0aW9uKCRmb3JtLCBjYWxsYmFjaykge1xuICAgIHZhciBjYiA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uKCkge307XG4gICAgY2Iub3B0aW9ucyA9IHtcbiAgICAgIHN1Y2Nlc3NVcmw6ICcvc2V0dGluZ3MnLFxuICAgICAgZXJyb3JVcmw6ICcvc2V0dGluZ3MnXG4gICAgfTtcbiAgICB0aGlzLnBvc3RGb3JtKCRmb3JtLCBjYik7XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFVzZXIoKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHVzZXIgPSByZXF1aXJlKCcuL21vZGVscy91c2VyJyk7XG52YXIgbWVzc2FnZXMgPSByZXF1aXJlKCcuL21vZGVscy9tZXNzYWdlcycpO1xudmFyIHJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVzJyk7XG52YXIgTG9naW5WaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9hY2NvdW50L2xvZ2luJyk7XG52YXIgU2lnbnVwVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvYWNjb3VudC9zaWdudXAnKTtcbnZhciBSZXNldFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2FjY291bnQvcmVzZXQnKTtcbnZhciBGb3Jnb3RWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9hY2NvdW50L2ZvcmdvdCcpO1xudmFyIFNldHRpbmdzVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvYWNjb3VudC9zZXR0aW5ncycpO1xudmFyIERlZmF1bHRWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9sYXlvdXRzL2RlZmF1bHQnKTtcbnZhciBJbmRleFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2luZGV4Jyk7XG5cbi8vIEhhbmRsZSBkaXNwbGF5aW5nIGFuZCBjbGVhbmluZyB1cCB2aWV3c1xudmFyIGN1cnJlbnRWaWV3O1xudmFyIHJlbmRlciA9IGZ1bmN0aW9uKHZpZXcpIHtcbiAgaWYgKGN1cnJlbnRWaWV3KSB7XG4gICAgY3VycmVudFZpZXcuY2xvc2UoKTtcbiAgfVxuXG4gIGN1cnJlbnRWaWV3ID0gdmlldztcblxuICAkKCcjYXBwLXdyYXBwZXInKS5odG1sKGN1cnJlbnRWaWV3LnJlbmRlcigpLiRlbCk7XG59O1xuXG52YXIgUm91dGVyID0gQmFja2JvbmUuUm91dGVyLmV4dGVuZCh7XG5cbiAgcm91dGVzOiB7XG4gICAgJ2xvZ2luJzogJ2xvZ2luJyxcbiAgICAnZm9yZ290JzogJ2ZvcmdvdCcsXG4gICAgJ3Jlc2V0Lzp0b2tlbic6ICdyZXNldCcsXG4gICAgJ3NpZ251cCc6ICdzaWdudXAnLFxuICAgICdzZXR0aW5ncyc6ICdzZXR0aW5ncycsXG4gICAgJyc6ICdpbmRleCdcbiAgfSxcbiAgaW5kZXg6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBob21lUGFnZSA9IG5ldyBEZWZhdWx0Vmlldyh7XG4gICAgICBzdWJ2aWV3czoge1xuICAgICAgICAnLmNvbnRlbnQnOiBuZXcgSW5kZXhWaWV3KClcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZW5kZXIoaG9tZVBhZ2UpO1xuICB9LFxuXG4gIGxvZ2luOiBmdW5jdGlvbigpIHtcbiAgICAvLyBJZiB1c2VyIGlzIGxvZ2dlZCBpbiwgcmVkaXJlY3QgdG8gc2V0dGluZ3MgcGFnZVxuICAgIGlmICh1c2VyLmdldCgnbG9nZ2VkSW4nKSkge1xuICAgICAgcmV0dXJuIHJvdXRlci5uYXZpZ2F0ZSgnL3NldHRpbmdzJywge3RyaWdnZXI6IHRydWV9KTtcbiAgICB9XG4gICAgdmFyIGxvZ2luUGFnZSA9IG5ldyBEZWZhdWx0Vmlldyh7XG4gICAgICBzdWJ2aWV3czoge1xuICAgICAgICAnLmNvbnRlbnQnOiBuZXcgTG9naW5WaWV3KClcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZW5kZXIobG9naW5QYWdlKTtcbiAgfSxcblxuXG4gIGZvcmdvdDogZnVuY3Rpb24oKSB7XG4gICAgLy8gSWYgdXNlciBpcyBsb2dnZWQgaW4sIHJlZGlyZWN0IHRvIHNldHRpbmdzIHBhZ2VcbiAgICBpZiAodXNlci5nZXQoJ2xvZ2dlZEluJykpIHtcbiAgICAgIHJldHVybiByb3V0ZXIubmF2aWdhdGUoJy9zZXR0aW5ncycsIHt0cmlnZ2VyOiB0cnVlfSk7XG4gICAgfVxuICAgIC8vIElmIHJlc2V0IHRva2VuIGlzIGludmFsaWQgb3IgaGFzIGV4cGlyZWQsIGRpc3BsYXkgZXJyb3IgbWVzc2FnZVxuICAgIGlmICh3aW5kb3cubG9jYXRpb24uc2VhcmNoID09PSAnP2Vycm9yPWludmFsaWQnKSB7XG4gICAgICBtZXNzYWdlcy5zZXRNZXNzYWdlcyh7XG4gICAgICAgIGVycm9yczogW3tcbiAgICAgICAgICBtc2c6ICdSZXNldCBpcyBpbnZhbGlkIG9yIGhhcyBleHBpcmVkLidcbiAgICAgICAgfV1cbiAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgZm9yZ290UGFnZSA9IG5ldyBEZWZhdWx0Vmlldyh7XG4gICAgICBzdWJ2aWV3czoge1xuICAgICAgICAnLmNvbnRlbnQnOiBuZXcgRm9yZ290VmlldygpXG4gICAgICB9XG4gICAgfSk7XG4gICAgcmVuZGVyKGZvcmdvdFBhZ2UpO1xuICB9LFxuXG4gIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAvLyBJZiB1c2VyIGlzIGxvZ2dlZCBpbiwgcmVkaXJlY3QgdG8gc2V0dGluZ3MgcGFnZVxuICAgIGlmICh1c2VyLmdldCgnbG9nZ2VkSW4nKSkge1xuICAgICAgcmV0dXJuIHJvdXRlci5uYXZpZ2F0ZSgnL3NldHRpbmdzJywge3RyaWdnZXI6IHRydWV9KTtcbiAgICB9XG4gICAgdmFyIHJlc2V0UGFnZSA9IG5ldyBEZWZhdWx0Vmlldyh7XG4gICAgICBzdWJ2aWV3czoge1xuICAgICAgICAnLmNvbnRlbnQnOiBuZXcgUmVzZXRWaWV3KClcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZW5kZXIocmVzZXRQYWdlKTtcbiAgfSxcblxuICBzaWdudXA6IGZ1bmN0aW9uKCkge1xuICAgIC8vIElmIHVzZXIgaXMgbG9nZ2VkIGluLCByZWRpcmVjdCB0byBzZXR0aW5ncyBwYWdlXG4gICAgaWYgKHVzZXIuZ2V0KCdsb2dnZWRJbicpKSB7XG4gICAgICByZXR1cm4gcm91dGVyLm5hdmlnYXRlKCcvc2V0dGluZ3MnLCB7dHJpZ2dlcjogdHJ1ZX0pO1xuICAgIH1cbiAgICB2YXIgc2lnbnVwUGFnZSA9IG5ldyBEZWZhdWx0Vmlldyh7XG4gICAgICBzdWJ2aWV3czoge1xuICAgICAgICAnLmNvbnRlbnQnOiBuZXcgU2lnbnVwVmlldygpXG4gICAgICB9XG4gICAgfSk7XG4gICAgcmVuZGVyKHNpZ251cFBhZ2UpO1xuICB9LFxuXG4gIHNldHRpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAvLyBJZiB1c2VyIGlzIG5vdCBsb2dnZWQgaW4sIHJlZGlyZWN0IHRvIGxvZ2luIHBhZ2VcbiAgICBpZiAoIXVzZXIuZ2V0KCdsb2dnZWRJbicpKSB7XG4gICAgICByZXR1cm4gcm91dGVyLm5hdmlnYXRlKCcvbG9naW4nLCB7dHJpZ2dlcjogdHJ1ZX0pO1xuICAgIH1cbiAgICB2YXIgc2V0dGluZ3NQYWdlID0gbmV3IERlZmF1bHRWaWV3KHtcbiAgICAgIHN1YnZpZXdzOiB7XG4gICAgICAgICcuY29udGVudCc6IG5ldyBTZXR0aW5nc1ZpZXcoKVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJlbmRlcihzZXR0aW5nc1BhZ2UpO1xuICB9LFxuXG4gIC8vIFJ1bnMgYmVmb3JlIGV2ZXJ5IHJvdXRlIGxvYWRzXG4gIGV4ZWN1dGU6IGZ1bmN0aW9uKGNhbGxiYWNrLCBhcmdzKSB7XG4gICAgLy8gQ2xlYXIgb3V0IGFueSBnbG9iYWwgbWVzc2FnZXNcbiAgICBtZXNzYWdlcy5jbGVhcigpO1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgUm91dGVyKCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1c2VyID0gcmVxdWlyZSgnLi4vLi4vbW9kZWxzL3VzZXInKTtcblxudmFyIEZvcmdvdCA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuICBlbDogJy5jb250ZW50JyxcblxuICB0ZW1wbGF0ZTogSlNUWydjbGllbnQvdGVtcGxhdGVzL2FjY291bnQvZm9yZ290LmhicyddLFxuXG4gIGV2ZW50czoge1xuICAgICdzdWJtaXQgZm9ybSc6ICdmb3JtU3VibWl0J1xuICB9LFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH0sXG5cbiAgZm9ybVN1Ym1pdDogZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgJGZvcm0gPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgdXNlci5mb3Jnb3QoJGZvcm0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwuaHRtbCh0aGlzLnRlbXBsYXRlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3Jnb3Q7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1c2VyID0gcmVxdWlyZSgnLi4vLi4vbW9kZWxzL3VzZXInKTtcblxudmFyIExvZ2luID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG4gIGVsOiAnLmNvbnRlbnQnLFxuXG4gIHRlbXBsYXRlOiBKU1RbJ2NsaWVudC90ZW1wbGF0ZXMvYWNjb3VudC9sb2dpbi5oYnMnXSxcblxuICBldmVudHM6IHtcbiAgICAnc3VibWl0IGZvcm0nOiAnZm9ybVN1Ym1pdCdcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9LFxuXG4gIGZvcm1TdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyICRmb3JtID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgIHVzZXIubG9naW4oJGZvcm0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwuaHRtbCh0aGlzLnRlbXBsYXRlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2dpbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHVzZXIgPSByZXF1aXJlKCcuLi8uLi9tb2RlbHMvdXNlcicpO1xuXG52YXIgUmVzZXQgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cbiAgZWw6ICcuY29udGVudCcsXG5cbiAgdGVtcGxhdGU6IEpTVFsnY2xpZW50L3RlbXBsYXRlcy9hY2NvdW50L3Jlc2V0LmhicyddLFxuXG4gIGV2ZW50czoge1xuICAgICdzdWJtaXQgZm9ybSc6ICdmb3JtU3VibWl0J1xuICB9LFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH0sXG5cbiAgZm9ybVN1Ym1pdDogZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgJGZvcm0gPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgdXNlci5yZXNldCgkZm9ybSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5odG1sKHRoaXMudGVtcGxhdGUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2V0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXNlciA9IHJlcXVpcmUoJy4uLy4uL21vZGVscy91c2VyJyk7XG52YXIgbWVzc2FnZXMgPSByZXF1aXJlKCcuLi8uLi9tb2RlbHMvbWVzc2FnZXMnKTtcblxudmFyIFNldHRpbmdzID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG4gIGVsOiAnLmNvbnRlbnQnLFxuXG4gIHRlbXBsYXRlOiBKU1RbJ2NsaWVudC90ZW1wbGF0ZXMvYWNjb3VudC9zZXR0aW5ncy5oYnMnXSxcblxuICBldmVudHM6IHtcbiAgICAnc3VibWl0ICNwcm9maWxlLWZvcm0nOiAnZm9ybUluZm8nLFxuICAgICdzdWJtaXQgI3Bhc3N3b3JkLWZvcm0nOiAnZm9ybVBhc3N3b3JkJyxcbiAgICAnc3VibWl0ICNkZWxldGUtZm9ybSc6ICdmb3JtRGVsZXRlJyxcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9LFxuXG4gIGZvcm1JbmZvOiBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciAkZm9ybSA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICB1c2VyLnVwZGF0ZVNldHRpbmdzKCRmb3JtKTtcbiAgfSxcblxuICBmb3JtUGFzc3dvcmQ6IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyICRmb3JtID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgIHVzZXIudXBkYXRlUGFzc3dvcmQoJGZvcm0pO1xuICB9LFxuXG4gIGZvcm1EZWxldGU6IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdXNlci5kZXN0cm95KHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB1c2VyLmxvZ291dCgpO1xuICAgICAgICBCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcvJywge3RyaWdnZXI6IHRydWV9KTtcbiAgICAgIH0sXG4gICAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIG1lc3NhZ2VzLnNldE1lc3NhZ2VzKHJlcy5yZXNwb25zZUpTT04pO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwuaHRtbCh0aGlzLnRlbXBsYXRlKHtcbiAgICAgIHVzZXI6IHVzZXIudG9KU09OKClcbiAgICB9KSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1c2VyID0gcmVxdWlyZSgnLi4vLi4vbW9kZWxzL3VzZXInKTtcblxudmFyIFNpZ251cCA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuICBlbDogJy5jb250ZW50JyxcblxuICB0ZW1wbGF0ZTogSlNUWydjbGllbnQvdGVtcGxhdGVzL2FjY291bnQvc2lnbnVwLmhicyddLFxuXG4gIGV2ZW50czoge1xuICAgICdzdWJtaXQgZm9ybSc6ICdmb3JtU3VibWl0J1xuICB9LFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH0sXG5cbiAgZm9ybVN1Ym1pdDogZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgJGZvcm0gPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgdXNlci5zaWdudXAoJGZvcm0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwuaHRtbCh0aGlzLnRlbXBsYXRlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaWdudXA7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBJbmRleFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cbiAgZWw6ICcuY29udGVudCcsXG5cbiAgdGVtcGxhdGU6IEpTVFsnY2xpZW50L3RlbXBsYXRlcy9pbmRleC5oYnMnXSxcblxuICBldmVudHM6IHt9LFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5odG1sKHRoaXMudGVtcGxhdGUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEluZGV4VmlldztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIE5hdmJhclZpZXcgPSByZXF1aXJlKCcuLi9tb2R1bGVzL25hdmJhcicpO1xudmFyIE1lc3NhZ2VzVmlldyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvbWVzc2FnZXMnKTtcblxudmFyIERlZmF1bHQgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cbiAgdGVtcGxhdGU6IEpTVFsnY2xpZW50L3RlbXBsYXRlcy9sYXlvdXRzL2RlZmF1bHQuaGJzJ10sXG5cbiAgZXZlbnRzOiB7fSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIGFueSBvcHRpb25zIHdlcmUgcGFzc2VkIGluXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwuaHRtbCh0aGlzLnRlbXBsYXRlKTtcblxuICAgIC8vIElmIHN1YnZpZXdzIGFyZSBwYXNzZWQgaW4sIHRoZW4gYXNzaWduL3JlbmRlciB0aGVtXG4gICAgaWYgKHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuc3Vidmlld3MpIHtcbiAgICAgIHRoaXMuYXNzaWduKF8uZXh0ZW5kKFxuICAgICAgICB0aGlzLm9wdGlvbnMuc3Vidmlld3MsXG4gICAgICAgIHRoaXMuc3Vidmlld3NcbiAgICAgICkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIEFzc2lnbi9SZW5kZXIgc3Vidmlld3NcbiAgICAgIHRoaXMuYXNzaWduKHRoaXMuc3Vidmlld3MpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIHN1YnZpZXdzOiB7XG4gICAgJy5tYWluLW5hdic6IG5ldyBOYXZiYXJWaWV3KCksXG4gICAgJy5tZXNzYWdlcyc6IG5ldyBNZXNzYWdlc1ZpZXcoKVxuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERlZmF1bHQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtZXNzYWdlcyA9IHJlcXVpcmUoJy4uLy4uL21vZGVscy9tZXNzYWdlcycpO1xuXG52YXIgTWVzc2FnZXMgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cbiAgZWw6ICcubWVzc2FnZXMnLFxuXG4gIHRlbXBsYXRlOiBKU1RbJ2NsaWVudC90ZW1wbGF0ZXMvbW9kdWxlcy9tZXNzYWdlcy5oYnMnXSxcblxuICBldmVudHM6IHt9LFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgIC8vIFJlLXJlbmRlciB0ZW1wbGF0ZSB3aGVuIG1lc3NhZ2VzIG1vZGVsIGNoYW5nZXNcbiAgICB0aGlzLmxpc3RlblRvKG1lc3NhZ2VzLCAnY2hhbmdlJywgdGhpcy5yZW5kZXIpO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5odG1sKHRoaXMudGVtcGxhdGUobWVzc2FnZXMudG9KU09OKCkpKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNZXNzYWdlcztcbiIsIi8qKlxuKiAgIE5hdmJhciBWaWV3XG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1c2VyID0gcmVxdWlyZSgnLi4vLi4vbW9kZWxzL3VzZXInKTtcbnZhciBtZXNzYWdlcyA9IHJlcXVpcmUoJy4uLy4uL21vZGVscy9tZXNzYWdlcycpO1xuXG52YXIgTmF2YmFyID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG4gIGVsOiAnLm1haW4tbmF2JyxcblxuICB0ZW1wbGF0ZTogSlNUWydjbGllbnQvdGVtcGxhdGVzL21vZHVsZXMvbmF2YmFyLmhicyddLFxuXG4gIGV2ZW50czoge1xuICAgICdjbGljayAjbG9nb3V0TGluayc6ICdoYW5kbGVMb2dvdXQnXG4gIH0sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgLy8gUmUtcmVuZGVyIHRlbXBsYXRlIHdoZW4gdXNlciBtb2RlbCBjaGFuZ2VzXG4gICAgdGhpcy5saXN0ZW5Ubyh1c2VyLCAnY2hhbmdlJywgdGhpcy5yZW5kZXIpO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH0sXG5cbiAgaGFuZGxlTG9nb3V0OiBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHVzZXIubG9nb3V0KCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5odG1sKHRoaXMudGVtcGxhdGUoe1xuICAgICAgbG9nZ2VkSW46IHVzZXIuZ2V0KCdsb2dnZWRJbicpLFxuICAgICAgdXNlcjogdXNlci50b0pTT04oKVxuICAgIH0pKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBOYXZiYXI7XG4iLCIvKipcbiogICBNZXNzYWdlcyBNb2RlbCBTcGVjIFRlc3RcbiovXG5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWVzc2FnZXNNb2RlbCA9IHJlcXVpcmUoJy4uLy4uLy4uL2NsaWVudC9zY3JpcHRzL21vZGVscy9tZXNzYWdlcycpO1xuXG5kZXNjcmliZSgnTWVzc2FnZXMgTW9kZWwnLCBmdW5jdGlvbigpIHtcblxuICBpdCgncHJvdmlkZXMgdGhlIFwiTWVzc2FnZXMgTW9kZWxcIiBpbnN0YW5jZScsIGZ1bmN0aW9uKCkge1xuICAgIC8vIEV4cGVjdCBpdCB0byBleGlzdFxuICAgIGV4cGVjdChtZXNzYWdlc01vZGVsKS50b0JlRGVmaW5lZCgpO1xuICB9KTtcblxufSk7XG4iLCIvKipcbiogICBVc2VyIE1vZGVsIFNwZWMgVGVzdFxuKi9cblxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1c2VyTW9kZWwgPSByZXF1aXJlKCcuLi8uLi8uLi9jbGllbnQvc2NyaXB0cy9tb2RlbHMvdXNlcicpO1xuXG5kZXNjcmliZSgnVXNlciBNb2RlbCcsIGZ1bmN0aW9uKCkge1xuXG4gIGl0KCdwcm92aWRlcyB0aGUgXCJVc2VyIE1vZGVsXCIgaW5zdGFuY2UnLCBmdW5jdGlvbigpIHtcbiAgICAvLyBFeHBlY3QgaXQgdG8gZXhpc3RcbiAgICBleHBlY3QodXNlck1vZGVsKS50b0JlRGVmaW5lZCgpO1xuICB9KTtcblxufSk7XG4iLCIvKipcbiogICBSb3V0ZXIgU3BlYyBUZXN0XG4qL1xuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHJvdXRlciA9IHJlcXVpcmUoJy4uLy4uL2NsaWVudC9zY3JpcHRzL3JvdXRlcycpO1xuXG5kZXNjcmliZSgnUm91dGVyJywgZnVuY3Rpb24oKSB7XG5cbiAgaXQoJ3Byb3ZpZGVzIHRoZSBcIlJvdXRlclwiIGluc3RhbmNlJywgZnVuY3Rpb24oKSB7XG4gICAgLy8gRXhwZWN0IGl0IHRvIGV4aXN0XG4gICAgZXhwZWN0KHJvdXRlcikudG9CZURlZmluZWQoKTtcbiAgfSk7XG5cbn0pO1xuIiwiLyoqXG4qICAgRm9yZ290IFZpZXcgU3BlYyBUZXN0XG4qL1xuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEZvcmdvdFZpZXcgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9jbGllbnQvc2NyaXB0cy92aWV3cy9hY2NvdW50L2ZvcmdvdCcpO1xuXG5kZXNjcmliZSgnRm9yZ290IFZpZXcnLCBmdW5jdGlvbigpIHtcblxuICBiZWZvcmVFYWNoKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZm9yZ290VmlldyA9IG5ldyBGb3Jnb3RWaWV3KCk7XG4gIH0pO1xuXG4gIGl0KCdwcm92aWRlcyB0aGUgXCJGb3Jnb3QgVmlld1wiIGluc3RhbmNlJywgZnVuY3Rpb24oKSB7XG4gICAgLy8gRXhwZWN0IGl0IHRvIGV4aXN0XG4gICAgZXhwZWN0KHRoaXMuZm9yZ290VmlldykudG9CZURlZmluZWQoKTtcbiAgfSk7XG5cbn0pO1xuIiwiLyoqXG4qICAgTG9naW4gVmlldyBTcGVjIFRlc3RcbiovXG5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTG9naW5WaWV3ID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vY2xpZW50L3NjcmlwdHMvdmlld3MvYWNjb3VudC9sb2dpbicpO1xuXG5kZXNjcmliZSgnTG9naW4gVmlldycsIGZ1bmN0aW9uKCkge1xuXG4gIGJlZm9yZUVhY2goZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5sb2dpblZpZXcgPSBuZXcgTG9naW5WaWV3KCk7XG4gIH0pO1xuXG4gIGl0KCdwcm92aWRlcyB0aGUgXCJMb2dpbiBWaWV3XCIgaW5zdGFuY2UnLCBmdW5jdGlvbigpIHtcbiAgICAvLyBFeHBlY3QgaXQgdG8gZXhpc3RcbiAgICBleHBlY3QodGhpcy5sb2dpblZpZXcpLnRvQmVEZWZpbmVkKCk7XG4gIH0pO1xuXG59KTtcbiIsIi8qKlxuKiAgIFJlc2V0IFZpZXcgU3BlYyBUZXN0XG4qL1xuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlc2V0VmlldyA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2NsaWVudC9zY3JpcHRzL3ZpZXdzL2FjY291bnQvcmVzZXQnKTtcblxuZGVzY3JpYmUoJ1Jlc2V0IFZpZXcnLCBmdW5jdGlvbigpIHtcblxuICBiZWZvcmVFYWNoKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVzZXRWaWV3ID0gbmV3IFJlc2V0VmlldygpO1xuICB9KTtcblxuICBpdCgncHJvdmlkZXMgdGhlIFwiUmVzZXQgVmlld1wiIGluc3RhbmNlJywgZnVuY3Rpb24oKSB7XG4gICAgLy8gRXhwZWN0IGl0IHRvIGV4aXN0XG4gICAgZXhwZWN0KHRoaXMucmVzZXRWaWV3KS50b0JlRGVmaW5lZCgpO1xuICB9KTtcblxufSk7XG4iLCIvKipcbiogICBTZXR0aW5ncyBWaWV3IFNwZWMgVGVzdFxuKi9cblxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTZXR0aW5nc1ZpZXcgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9jbGllbnQvc2NyaXB0cy92aWV3cy9hY2NvdW50L3NldHRpbmdzJyk7XG5cbmRlc2NyaWJlKCdTZXR0aW5ncyBWaWV3JywgZnVuY3Rpb24oKSB7XG5cbiAgYmVmb3JlRWFjaChmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldHRpbmdzVmlldyA9IG5ldyBTZXR0aW5nc1ZpZXcoKTtcbiAgfSk7XG5cbiAgaXQoJ3Byb3ZpZGVzIHRoZSBcIlNldHRpbmdzIFZpZXdcIiBpbnN0YW5jZScsIGZ1bmN0aW9uKCkge1xuICAgIC8vIEV4cGVjdCBpdCB0byBleGlzdFxuICAgIGV4cGVjdCh0aGlzLnNldHRpbmdzVmlldykudG9CZURlZmluZWQoKTtcbiAgfSk7XG5cbn0pO1xuIiwiLyoqXG4qICAgU2lnbnVwIFZpZXcgU3BlYyBUZXN0XG4qL1xuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFNpZ251cFZpZXcgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9jbGllbnQvc2NyaXB0cy92aWV3cy9hY2NvdW50L3NpZ251cCcpO1xuXG5kZXNjcmliZSgnU2lnbnVwIFZpZXcnLCBmdW5jdGlvbigpIHtcblxuICBiZWZvcmVFYWNoKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2lnbnVwVmlldyA9IG5ldyBTaWdudXBWaWV3KCk7XG4gIH0pO1xuXG4gIGl0KCdwcm92aWRlcyB0aGUgXCJTaWdudXAgVmlld1wiIGluc3RhbmNlJywgZnVuY3Rpb24oKSB7XG4gICAgLy8gRXhwZWN0IGl0IHRvIGV4aXN0XG4gICAgZXhwZWN0KHRoaXMuc2lnbnVwVmlldykudG9CZURlZmluZWQoKTtcbiAgfSk7XG5cbn0pO1xuIiwiLyoqXG4qICAgSW5kZXggVmlldyBTcGVjIFRlc3RcbiovXG5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgSW5kZXhWaWV3ID0gcmVxdWlyZSgnLi4vLi4vLi4vY2xpZW50L3NjcmlwdHMvdmlld3MvaW5kZXgnKTtcblxuZGVzY3JpYmUoJ0luZGV4IFZpZXcnLCBmdW5jdGlvbigpIHtcblxuICBiZWZvcmVFYWNoKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaW5kZXhWaWV3ID0gbmV3IEluZGV4VmlldygpO1xuICB9KTtcblxuICBpdCgncHJvdmlkZXMgdGhlIFwiSW5kZXggVmlld1wiIGluc3RhbmNlJywgZnVuY3Rpb24oKSB7XG4gICAgLy8gRXhwZWN0IGl0IHRvIGV4aXN0XG4gICAgZXhwZWN0KHRoaXMuaW5kZXhWaWV3KS50b0JlRGVmaW5lZCgpO1xuICB9KTtcblxufSk7XG4iLCIvKipcbiogICBEZWZhdWx0IFZpZXcgU3BlYyBUZXN0XG4qL1xuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIERlZmF1bHRWaWV3ID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vY2xpZW50L3NjcmlwdHMvdmlld3MvbGF5b3V0cy9kZWZhdWx0Jyk7XG5cbmRlc2NyaWJlKCdEZWZhdWx0IFZpZXcnLCBmdW5jdGlvbigpIHtcblxuICBiZWZvcmVFYWNoKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZGVmYXVsdFZpZXcgPSBuZXcgRGVmYXVsdFZpZXcoKTtcbiAgfSk7XG5cbiAgaXQoJ3Byb3ZpZGVzIHRoZSBcIkRlZmF1bHQgVmlld1wiIGluc3RhbmNlJywgZnVuY3Rpb24oKSB7XG4gICAgLy8gRXhwZWN0IGl0IHRvIGV4aXN0XG4gICAgZXhwZWN0KHRoaXMuZGVmYXVsdFZpZXcpLnRvQmVEZWZpbmVkKCk7XG4gIH0pO1xuXG59KTtcbiIsIi8qKlxuKiAgIE1lc3NhZ2VzIFZpZXcgU3BlYyBUZXN0XG4qL1xuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIE1lc3NhZ2VzVmlldyA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2NsaWVudC9zY3JpcHRzL3ZpZXdzL21vZHVsZXMvbWVzc2FnZXMnKTtcblxuZGVzY3JpYmUoJ01lc3NhZ2VzIFZpZXcnLCBmdW5jdGlvbigpIHtcblxuICBiZWZvcmVFYWNoKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWVzc2FnZXNWaWV3ID0gbmV3IE1lc3NhZ2VzVmlldygpO1xuICB9KTtcblxuICBpdCgncHJvdmlkZXMgdGhlIFwiTWVzc2FnZXMgVmlld1wiIGluc3RhbmNlJywgZnVuY3Rpb24oKSB7XG4gICAgLy8gRXhwZWN0IGl0IHRvIGV4aXN0XG4gICAgZXhwZWN0KHRoaXMubWVzc2FnZXNWaWV3KS50b0JlRGVmaW5lZCgpO1xuICB9KTtcblxufSk7XG4iLCIvKipcbiogICBOYXZiYXIgVmlldyBTcGVjIFRlc3RcbiovXG5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTmF2YmFyVmlldyA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2NsaWVudC9zY3JpcHRzL3ZpZXdzL21vZHVsZXMvbmF2YmFyJyk7XG5cbmRlc2NyaWJlKCdOYXZiYXIgVmlldycsIGZ1bmN0aW9uKCkge1xuXG4gIGJlZm9yZUVhY2goZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5uYXZiYXJWaWV3ID0gbmV3IE5hdmJhclZpZXcoKTtcbiAgfSk7XG5cbiAgaXQoJ3Byb3ZpZGVzIHRoZSBcIk5hdmJhciBWaWV3XCIgaW5zdGFuY2UnLCBmdW5jdGlvbigpIHtcbiAgICAvLyBFeHBlY3QgaXQgdG8gZXhpc3RcbiAgICBleHBlY3QodGhpcy5uYXZiYXJWaWV3KS50b0JlRGVmaW5lZCgpO1xuICB9KTtcblxufSk7XG4iXX0=
