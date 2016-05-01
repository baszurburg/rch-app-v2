import observable = require("data/observable");
import pages = require("ui/page");
import gestures = require("ui/gestures");
import label = require("ui/label");
import listView = require("ui/list-view");
import dialogModule = require("ui/dialogs");
import utils = require("utils/utils");
import frame = require("ui/frame");
import button = require("ui/button");
import view = require("ui/core/view");
import platform = require("platform");
import userViewModel = require("../../../shared/view-models/user-view-model");
import firebase = require("nativescript-plugin-firebase");

var pageData;
var user;
var email;
var password;
var submitButton;

export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    
   user = new userViewModel.UserViewModel();
    
    email = page.getViewById("email");
	password = page.getViewById("password");
	submitButton = page.getViewById("submit-button");
	//formUtil.hideKeyboardOnBlur(page, [email, password]);

	pageData = new observable.Observable({
        user: user,
		authenticating: false
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
	password.focus();
};

function disableForm() {
	email.isEnabled = false;
	password.isEnabled = false;
	submitButton.isEnabled = false;
	pageData.set("authenticating", true);
}
function enableForm() {
	email.isEnabled = true;
	password.isEnabled = true;
	submitButton.isEnabled = true;
	pageData.set("authenticating", false);
}

exports.register = function() {

 	console.log('login - user.email: ' + user.email);
    console.log('login - user: ' + user.password);
    disableForm();
        
    user.register()
        .then(function(a) {
            console.log('a:' + a);
            enableForm();
        });
};