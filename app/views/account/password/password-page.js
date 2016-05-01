"use strict";
var observable = require("data/observable");
var gestures = require("ui/gestures");
var frame = require("ui/frame");
//import platform = require("platform");
var userViewModel = require("../../../shared/view-models/user-view-model");
var pageData;
var user;
var email;
var submitButton;
function pageLoaded(args) {
    var page = args.object;
    user = new userViewModel.UserViewModel();
    email = page.getViewById("email");
    submitButton = page.getViewById("submit-button");
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
function disableForm() {
    email.isEnabled = false;
    submitButton.isEnabled = false;
}
function enableForm() {
    email.isEnabled = true;
    submitButton.isEnabled = true;
}
exports.reset = function () {
    console.log('reset - user.email: ' + user.email);
    disableForm();
    user.resetPassword()
        .then(function (a) {
        console.log('a:' + a);
        enableForm();
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFzc3dvcmQtcGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBhc3N3b3JkLXBhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQU8sVUFBVSxXQUFXLGlCQUFpQixDQUFDLENBQUM7QUFFL0MsSUFBTyxRQUFRLFdBQVcsYUFBYSxDQUFDLENBQUM7QUFLekMsSUFBTyxLQUFLLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFHbkMsd0NBQXdDO0FBQ3hDLElBQU8sYUFBYSxXQUFXLDZDQUE2QyxDQUFDLENBQUM7QUFHOUUsSUFBSSxRQUFRLENBQUM7QUFDYixJQUFJLElBQUksQ0FBQztBQUNULElBQUksS0FBSyxDQUFDO0FBQ1YsSUFBSSxZQUFZLENBQUM7QUFFakIsb0JBQTJCLElBQTBCO0lBQ2pELElBQUksSUFBSSxHQUFlLElBQUksQ0FBQyxNQUFNLENBQUM7SUFFdEMsSUFBSSxHQUFHLElBQUksYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBRXRDLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JDLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBRWpELFFBQVEsR0FBRyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDcEMsSUFBSSxFQUFFLElBQUk7UUFDSixjQUFjLEVBQUUsS0FBSztLQUMzQixDQUFDLENBQUM7SUFFQSxJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQztBQUVuQyxDQUFDO0FBZmUsa0JBQVUsYUFlekIsQ0FBQTtBQUVELGlCQUF3QixJQUErQjtJQUNuRCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDN0IsQ0FBQztBQUZlLGVBQU8sVUFFdEIsQ0FBQTtBQUVELG1CQUEwQixJQUFvQztJQUMxRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNuRCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDN0IsQ0FBQztBQUNMLENBQUM7QUFKZSxpQkFBUyxZQUl4QixDQUFBO0FBRUQ7SUFDQyxLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN4QixZQUFZLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztBQUNoQyxDQUFDO0FBQ0Q7SUFDQyxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUN2QixZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUMvQixDQUFDO0FBSUQsT0FBTyxDQUFDLEtBQUssR0FBRztJQUVkLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWxELFdBQVcsRUFBRSxDQUFDO0lBRWQsSUFBSSxDQUFDLGFBQWEsRUFBRTtTQUNsQixJQUFJLENBQUMsVUFBUyxDQUFDO1FBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEIsVUFBVSxFQUFFLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztBQUVMLENBQUMsQ0FBQyJ9