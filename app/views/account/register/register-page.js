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
exports.register = function () {
    console.log('login - user.email: ' + user.email);
    console.log('login - user: ' + user.password);
    disableForm();
    user.register()
        .then(function (a) {
        console.log('a:' + a);
        enableForm();
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXItcGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlZ2lzdGVyLXBhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQU8sVUFBVSxXQUFXLGlCQUFpQixDQUFDLENBQUM7QUFFL0MsSUFBTyxRQUFRLFdBQVcsYUFBYSxDQUFDLENBQUM7QUFLekMsSUFBTyxLQUFLLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFJbkMsSUFBTyxhQUFhLFdBQVcsNkNBQTZDLENBQUMsQ0FBQztBQUc5RSxJQUFJLFFBQVEsQ0FBQztBQUNiLElBQUksSUFBSSxDQUFDO0FBQ1QsSUFBSSxLQUFLLENBQUM7QUFDVixJQUFJLFFBQVEsQ0FBQztBQUNiLElBQUksWUFBWSxDQUFDO0FBRWpCLG9CQUEyQixJQUEwQjtJQUNqRCxJQUFJLElBQUksR0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDO0lBRXBDLElBQUksR0FBRyxJQUFJLGFBQWEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUV4QyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4QyxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNqRCx1REFBdUQ7SUFFdkQsUUFBUSxHQUFHLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQztRQUM5QixJQUFJLEVBQUUsSUFBSTtRQUNoQixjQUFjLEVBQUUsS0FBSztLQUNyQixDQUFDLENBQUM7SUFFQSxJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQztBQUVuQyxDQUFDO0FBakJlLGtCQUFVLGFBaUJ6QixDQUFBO0FBRUQsaUJBQXdCLElBQStCO0lBQ25ELEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUM3QixDQUFDO0FBRmUsZUFBTyxVQUV0QixDQUFBO0FBRUQsbUJBQTBCLElBQW9DO0lBQzFELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ25ELEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM3QixDQUFDO0FBQ0wsQ0FBQztBQUplLGlCQUFTLFlBSXhCLENBQUE7QUFFRCxPQUFPLENBQUMsYUFBYSxHQUFHO0lBQ3ZCLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNsQixDQUFDLENBQUM7QUFFRjtJQUNDLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLFFBQVEsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQzNCLFlBQVksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQy9CLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUNEO0lBQ0MsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDdkIsUUFBUSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDMUIsWUFBWSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDOUIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBRUQsT0FBTyxDQUFDLFFBQVEsR0FBRztJQUVqQixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QyxXQUFXLEVBQUUsQ0FBQztJQUVkLElBQUksQ0FBQyxRQUFRLEVBQUU7U0FDVixJQUFJLENBQUMsVUFBUyxDQUFDO1FBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEIsVUFBVSxFQUFFLENBQUM7SUFDakIsQ0FBQyxDQUFDLENBQUM7QUFDWCxDQUFDLENBQUMifQ==