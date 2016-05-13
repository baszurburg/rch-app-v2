"use strict";
var observable = require("data/observable");
var gestures = require("ui/gestures");
var dialogsModule = require("ui/dialogs");
var frame = require("ui/frame");
var userViewModel = require("../../../shared/view-models/user-view-model");
var pageData;
var user;
var name;
var oldPassword;
var newPassword;
var confirmPassword;
var submitButton;
function pageLoaded(args) {
    var page = args.object;
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
exports.pageLoaded = pageLoaded;
function backTap(args) {
    frame.topmost().goBack();
}
exports.backTap = backTap;
function backSwipe(args) {
    if (args.direction === gestures.SwipeDirection.right) {
        frame.topmost().goBack();
    }
}
exports.backSwipe = backSwipe;
exports.focusPassword = function () {
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
exports.save = function () {
    disableForm();
    // Should we separate the function to only change the name (and other settings)
    user.changePassword()
        .then(function () {
        enableForm();
        // redirect to settings !?
    });
};
exports.forgotPassword = function () {
    var topmost = frame.topmost();
    topmost.navigate("views/account/password/password-page");
};
exports.goToRegister = function () {
    var topmost = frame.topmost();
    topmost.navigate("views/account/register/register-page");
};
function clearPasswords() {
    this.oldPassword = "";
    this.newPassword = "";
    this.confirmPassword = "";
}
function validate() {
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
function showError(error) {
    dialogsModule.alert({ title: "Error", message: error, okButtonText: "Close" });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1hY2NvdW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZWRpdC1hY2NvdW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLFVBQVUsV0FBVyxpQkFBaUIsQ0FBQyxDQUFDO0FBRS9DLElBQU8sUUFBUSxXQUFXLGFBQWEsQ0FBQyxDQUFDO0FBR3pDLElBQU8sYUFBYSxXQUFXLFlBQVksQ0FBQyxDQUFDO0FBRTdDLElBQU8sS0FBSyxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBSW5DLElBQU8sYUFBYSxXQUFXLDZDQUE2QyxDQUFDLENBQUM7QUFHOUUsSUFBSSxRQUFRLENBQUM7QUFDYixJQUFJLElBQUksQ0FBQztBQUNULElBQUksSUFBSSxDQUFDO0FBQ1QsSUFBSSxXQUFXLENBQUM7QUFDaEIsSUFBSSxXQUFXLENBQUM7QUFDaEIsSUFBSSxlQUFlLENBQUM7QUFDcEIsSUFBSSxZQUFZLENBQUM7QUFFakIsb0JBQTJCLElBQTBCO0lBQ2pELElBQUksSUFBSSxHQUFlLElBQUksQ0FBQyxNQUFNLENBQUM7SUFHbkMsSUFBSSxHQUFHLElBQUksYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBRXpDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25DLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzNDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzlDLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDekQsWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDakQsdURBQXVEO0lBRXZELFFBQVEsR0FBRyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDcEMsSUFBSSxFQUFFLElBQUk7UUFDSixRQUFRLEVBQUUsS0FBSztLQUNyQixD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