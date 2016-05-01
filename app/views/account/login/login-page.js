"use strict";
var observable = require("data/observable");
var gestures = require("ui/gestures");
var frame = require("ui/frame");
var userViewModel = require("../../../shared/view-models/user-view-model");
var pageData;
var user;
var email;
var password;
var submitButton;
function pageLoaded(args) {
    var page = args.object;
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
exports.logIn = function () {
    disableForm();
    user.login()
        .then(function (a) {
        enableForm();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4tcGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvZ2luLXBhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQU8sVUFBVSxXQUFXLGlCQUFpQixDQUFDLENBQUM7QUFFL0MsSUFBTyxRQUFRLFdBQVcsYUFBYSxDQUFDLENBQUM7QUFLekMsSUFBTyxLQUFLLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFJbkMsSUFBTyxhQUFhLFdBQVcsNkNBQTZDLENBQUMsQ0FBQztBQUc5RSxJQUFJLFFBQVEsQ0FBQztBQUNiLElBQUksSUFBSSxDQUFDO0FBQ1QsSUFBSSxLQUFLLENBQUM7QUFDVixJQUFJLFFBQVEsQ0FBQztBQUNiLElBQUksWUFBWSxDQUFDO0FBRWpCLG9CQUEyQixJQUEwQjtJQUNqRCxJQUFJLElBQUksR0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDO0lBR25DLElBQUksR0FBRyxJQUFJLGFBQWEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUV6QyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4QyxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNqRCx1REFBdUQ7SUFFdkQsUUFBUSxHQUFHLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQztRQUNwQyxJQUFJLEVBQUUsSUFBSTtRQUNKLGNBQWMsRUFBRSxLQUFLO0tBQzNCLENBQUMsQ0FBQztJQUVBLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDO0FBRW5DLENBQUM7QUFsQmUsa0JBQVUsYUFrQnpCLENBQUE7QUFFRCxpQkFBd0IsSUFBK0I7SUFDbkQsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzdCLENBQUM7QUFGZSxlQUFPLFVBRXRCLENBQUE7QUFFRCxtQkFBMEIsSUFBb0M7SUFDMUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbkQsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzdCLENBQUM7QUFDTCxDQUFDO0FBSmUsaUJBQVMsWUFJeEIsQ0FBQTtBQUVELE9BQU8sQ0FBQyxhQUFhLEdBQUc7SUFDdkIsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2xCLENBQUMsQ0FBQztBQUVGO0lBQ0MsS0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDeEIsUUFBUSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDM0IsWUFBWSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDL0IsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBRUQ7SUFDQyxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUN2QixRQUFRLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUMxQixZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUM5QixRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFFRCxPQUFPLENBQUMsS0FBSyxHQUFHO0lBRVosV0FBVyxFQUFFLENBQUM7SUFFZCxJQUFJLENBQUMsS0FBSyxFQUFFO1NBQ1AsSUFBSSxDQUFDLFVBQVMsQ0FBQztRQUNaLFVBQVUsRUFBRSxDQUFDO0lBQ2pCLENBQUMsQ0FBQyxDQUFDO0FBQ1gsQ0FBQyxDQUFDO0FBR0YsT0FBTyxDQUFDLGNBQWMsR0FBRztJQUNyQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDOUIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0FBQzdELENBQUMsQ0FBQztBQUVGLE9BQU8sQ0FBQyxZQUFZLEdBQUc7SUFDbkIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzlCLE9BQU8sQ0FBQyxRQUFRLENBQUMsc0NBQXNDLENBQUMsQ0FBQztBQUM3RCxDQUFDLENBQUMifQ==