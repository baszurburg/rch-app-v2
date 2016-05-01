import frameModule = require("ui/frame");

module.exports = {
	goToLoginPage: function() {
		frameModule.topmost().navigate("views/account/login/login-page");
	},
	goToPasswordPage: function() {
		frameModule.topmost().navigate("views/password/password");
	}


};