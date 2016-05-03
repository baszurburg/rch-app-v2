import frameModule = require("ui/frame");

module.exports = {
	goToMainPage: function () {
		frameModule.topmost().navigate("views/main-page/main-page");
	},
	goToLoginPage: function () {
		frameModule.topmost().navigate("views/account/login/login-page");
	},
	goToPasswordPage: function () {
		frameModule.topmost().navigate("views/password/password");
	}

};