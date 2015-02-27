this["JST"] = this["JST"] || {};

this["JST"]["client/templates/account/forgot.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<h3>Forgot Password</h3>\n<form method=\"post\" action=\"/forgot\">\n  <p>Enter your email address below and we will send you password reset instructions.</p>\n\n  <p>\n    <label for=\"email\">Email:</label>\n    <input type=\"email\" name=\"email\" id=\"email\" placeholder=\"Enter your email\" autofocus=\"autofocus\" />\n  </p>\n\n  <button>Reset Password</button>\n</form>\n";
  },"useData":true});

this["JST"]["client/templates/account/login.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<h3>Sign in</h3>\n<form method=\"post\" action=\"/login\">\n  <p>\n    <label for=\"email\">Email:</label>\n    <input type=\"text\" name=\"email\" id=\"email\" placeholder=\"Enter your email\" autofocus=\"autofocus\" />\n  </p>\n\n  <p>\n    <label for=\"password\">Password:</label>\n    <input type=\"password\" name=\"password\" id=\"password\" placeholder=\"Password\" />\n  </p>\n\n  <button>Login</button>\n  <p><a href=\"/forgot\">Forgot your password?</a></p>\n</form>\n";
  },"useData":true});

this["JST"]["client/templates/account/reset.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<h3>Reset Password</h3>\n<form method=\"post\">\n  <p>\n    <label for=\"password\">New Password</label>\n    <input type=\"password\" name=\"password\" value=\"\" placeholder=\"New password\" autofocus=\"autofocus\" />\n  </p>\n\n  <p>\n    <label for=\"confirm\">Confirm Password</label>\n    <input type=\"password\" name=\"confirm\" value=\"\" placeholder=\"Confirm password\" />\n  </p>\n\n  <button>Change Password</button>\n</form>\n";
  },"useData":true});

this["JST"]["client/templates/account/settings.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "<h3>Profile Information</h3>\n\n<form id=\"profile-form\" action=\"/user?_method=PUT\" method=\"post\">\n\n  <p>\n    <label for=\"email\">Email:</label>\n    <input type=\"text\" name=\"email\" id=\"email\" value=\""
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.user : depth0)) != null ? stack1.email : stack1), depth0))
    + "\" />\n  </p>\n\n  <p>\n    <label for=\"firstName\">First Name:</label>\n    <input type=\"text\" name=\"firstName\" id=\"firstName\" value=\""
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.user : depth0)) != null ? stack1.firstName : stack1), depth0))
    + "\" />\n  </p>\n\n  <p>\n    <label for=\"lastName\">Last Name:</label>\n    <input type=\"text\" name=\"lastName\" id=\"lastName\" value=\""
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.user : depth0)) != null ? stack1.lastName : stack1), depth0))
    + "\" />\n  </p>\n\n  <button>Update Profile</button>\n</form>\n\n<h3>Change Password</h3>\n\n<form id=\"password-form\" action=\"/user/password?_method=PUT\" method=\"post\">\n\n  <p>\n    <label for=\"password\">New Password:</label>\n    <input type=\"password\" name=\"password\" id=\"password\" value='' />\n  </p>\n\n  <p>\n    <label for=\"confirmPassword\">Confirm Password:</label>\n    <input type=\"password\" name=\"confirmPassword\" id=\"confirmPassword\" value='' />\n  </p>\n\n  <button>Change Password</button>\n</form>\n\n<h3>Delete Account</h3>\n\n<p>You can delete your account, but keep in mind this action is irreversible.</p>\n\n<form id=\"delete-form\" action=\"/user\" method=\"post\">\n  <button>Delete my account</button>\n</form>\n";
},"useData":true});

this["JST"]["client/templates/account/signup.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<h3>Sign up</h3>\n<form id=\"signup-form\" method=\"post\" action=\"/user\">\n  <p>\n    <label for=\"email\">Email:</label>\n    <input type=\"text\" name=\"email\" id=\"email\" placeholder=\"Email\" />\n  </p>\n\n  <p>\n    <label for=\"password\">Password:</label>\n    <input type=\"password\" name=\"password\" id=\"password\" placeholder=\"Password\" />\n  </p>\n\n  <p>\n    <label for=\"confirmPassword\">Confirm Password:</label>\n    <input type=\"password\" name=\"confirmPassword\" id=\"confirmPassword\" placeholder=\"Confirm Password\" />\n  </p>\n\n  <button>Signup</button>\n</form>\n";
  },"useData":true});

this["JST"]["client/templates/index.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"yeogurt-info\">\n  <h1>Welcome to Yeogurt!</h1>\n  <p>\n    Take a look at the <a href=\"https://github.com/larsonjj/generator-yeogurt#yeogurt-generator---\" data-bypass>documentation</a> and start mixing up something awesome.\n  </p>\n  <p>\n    <img src=\"/images/yeogurt-swirl.png\" width=\"75px\" class=\"logo\" />\n  </p>\n</div>\n<code class=\"version\">v0.14.2</code>\n";
  },"useData":true});

this["JST"]["client/templates/layouts/default.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"main-nav\"></div>\n<div class=\"default\">\n  <div class=\"main-container\">\n    <div class=\"messages\"></div>\n    <div class=\"content\"></div>\n  </div>\n</div>\n";
  },"useData":true});

this["JST"]["client/templates/modules/messages.hbs"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = helpers.each.call(depth0, ((stack1 = (depth0 != null ? depth0.messages : depth0)) != null ? stack1.errors : stack1), {"name":"each","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"2":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <div class=\"error\">"
    + escapeExpression(((helper = (helper = helpers.msg || (depth0 != null ? depth0.msg : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"msg","hash":{},"data":data}) : helper)))
    + "</div>\n";
},"4":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = helpers.each.call(depth0, ((stack1 = (depth0 != null ? depth0.messages : depth0)) != null ? stack1.info : stack1), {"name":"each","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"5":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <div class=\"info\">"
    + escapeExpression(((helper = (helper = helpers.msg || (depth0 != null ? depth0.msg : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"msg","hash":{},"data":data}) : helper)))
    + "</div>\n";
},"7":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = helpers.each.call(depth0, ((stack1 = (depth0 != null ? depth0.messages : depth0)) != null ? stack1.success : stack1), {"name":"each","hash":{},"fn":this.program(8, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"8":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <div class=\"success\">"
    + escapeExpression(((helper = (helper = helpers.msg || (depth0 != null ? depth0.msg : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"msg","hash":{},"data":data}) : helper)))
    + "</div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 != null ? depth0.messages : depth0)) != null ? stack1.errors : stack1), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 != null ? depth0.messages : depth0)) != null ? stack1.info : stack1), {"name":"if","hash":{},"fn":this.program(4, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 != null ? depth0.messages : depth0)) != null ? stack1.success : stack1), {"name":"if","hash":{},"fn":this.program(7, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});

this["JST"]["client/templates/modules/navbar.hbs"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  return "        <li class=\"nav-item\">\n          <a href='/login'>Login</a>\n        </li>\n        <li class=\"nav-item\">\n          <a href='/signup'>Create Account</a>\n        </li>\n";
  },"3":function(depth0,helpers,partials,data) {
  var stack1, buffer = "        <li class=\"nav-item\">\n          Hello ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 != null ? depth0.user : depth0)) != null ? stack1.firstName : stack1), {"name":"if","hash":{},"fn":this.program(4, data),"inverse":this.program(6, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n        </li>\n        <li class=\"nav-item\">\n          <a href='/settings'>My Account</a>\n        </li>\n        <li class=\"nav-item\">\n          <a id=\"logoutLink\" href='/logout'>Logout</a>\n        </li>\n";
},"4":function(depth0,helpers,partials,data) {
  var stack1, lambda=this.lambda, escapeExpression=this.escapeExpression;
  return " "
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.user : depth0)) != null ? stack1.firstName : stack1), depth0));
},"6":function(depth0,helpers,partials,data) {
  var stack1, lambda=this.lambda, escapeExpression=this.escapeExpression;
  return " "
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.user : depth0)) != null ? stack1.email : stack1), depth0));
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "<div class=\"navbar\">\n  <div class=\"nav\">\n    <ul class=\"nav-list pull-left\">\n      <li class=\"nav-item\"><a href=\"/\">Home</a></li>\n    </ul>\n    <ul class=\"nav-list pull-right\">\n";
  stack1 = helpers.unless.call(depth0, (depth0 != null ? depth0.loggedIn : depth0), {"name":"unless","hash":{},"fn":this.program(1, data),"inverse":this.program(3, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </ul>\n  </div>\n</div>\n";
},"useData":true});