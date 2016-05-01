import observable = require("data/observable");
import pages = require("ui/page");
import gestures = require("ui/gestures");
import label = require("ui/label");
import dialogsModule = require("ui/dialogs");
//import listView = require("ui/list-view");
import utils = require("utils/utils");
import frame = require("ui/frame");
import button = require("ui/button");
import view = require("ui/core/view");
//import platform = require("platform");
import userViewModel = require("../../../shared/view-models/user-view-model");
import firebase = require("nativescript-plugin-firebase");

var pageData;
var user;
var email;
var submitButton;

export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    
	user = new userViewModel.UserViewModel();
	    
    email = page.getViewById("email");
	submitButton = page.getViewById("submit-button");
    
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

function disableForm() {
	email.isEnabled = false;
	submitButton.isEnabled = false;
}
function enableForm() {
	email.isEnabled = true;
	submitButton.isEnabled = true;
}



exports.reset = function() {

 	console.log('reset - user.email: ' + user.email);

	disableForm();
	
	user.resetPassword()
		.then(function(a) {
			console.log('a:' + a);
			enableForm();
		});

};