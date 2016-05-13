import observable = require("data/observable");
import pages = require("ui/page");
import gestures = require("ui/gestures");
import label = require("ui/label");
import listView = require("ui/list-view");
import dialogsModule = require("ui/dialogs");
import utils = require("utils/utils");
import frame = require("ui/frame");
import button = require("ui/button");
import view = require("ui/core/view");
import platform = require("platform");
import userViewModel = require("../../../shared/view-models/user-view-model");
import firebase = require("nativescript-plugin-firebase");

var pageData;
var user;
var name;
var oldPassword;
var newPassword;
var confirmPassword;
var submitButton;

export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    
    
    user = new userViewModel.UserViewModel();
    
    name = page.getViewById("name");
	oldPassword = page.getViewById("oldPassword");
    newPassword = page.getViewById("newPassword");
    confirmPassword = page.getViewById("confirmPassword");
	submitButton = page.getViewById("submit-button");
	//formUtil.hideKeyboardOnBlur(page, [email, password]);

	pageData = new observable.Observable({
		user: user,
        updating: false
	});    
    
    page.bindingContext = pageData;
    
}

export function backTap(args: gestures.GestureEventData) {
    frame.topmost().goBack();
}

export function backSwipe(args: gestures.SwipeGestureEventData) {
    if (args.direction === gestures.SwipeDirection.right) {
        frame.topmost().goBack();
    }
}

exports.focusPassword = function() {
	oldPassword.focus();
};

function disableForm() {
	name.isEnabled = false;
	oldPassword.isEnabled = false;
    newPassword.isEnabled = false;
	confirmPassword.isEnabled = false;    
	submitButton.isEnabled = false;
	pageData.set("updating", true);
}

function enableForm() {
	name.isEnabled = false;
	oldPassword.isEnabled = false;
    newPassword.isEnabled = false;
	confirmPassword.isEnabled = false;    
	submitButton.isEnabled = true;
	pageData.set("update", false);
}

exports.save = function() {
    
    disableForm();
    
    // Should we separate the function to only change the name (and other settings)
    
    user.changePassword()
        .then(function() {
            enableForm();
            // redirect to settings !?
        });
};


exports.forgotPassword = function() {
    var topmost = frame.topmost();
    topmost.navigate("views/account/password/password-page");
};

exports.goToRegister = function() {
    var topmost = frame.topmost();
    topmost.navigate("views/account/register/register-page");
};

    function clearPasswords() {
        this.oldPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";
    }

    function validate(): boolean {
        if (!this.user.name || this.user.name === "") {
            this.showError("Please enter your name.");
            return false;
        }

        if (!this.user.email || this.user.email === "") {
            this.showError("Please enter your email.");
            return false;
        }

        if (this.oldPassword) {
            if (!this.newPassword || this.newPassword === "") {
                this.showError("Please enter new password.");
                return false;
            }

            if (this.newPassword !== this.confirmPassword) {
                this.showError("Passwords did not match.");
            }
        }

        return true;
    }
    
    function  showError(error: string) {
        dialogsModule.alert({ title: "Error", message: error, okButtonText: "Close" });
    }