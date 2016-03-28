"use strict";
var frame = require("ui/frame");
var view = require("ui/core/view");
var platform = require("platform");
var appViewModel = require("../../shared/view-models/app-view-model");
var firebaseModel = require("../../shared/view-models/firebase-view-model");
var fbase = firebaseModel.firebaseViewModel;
function pageLoaded(args) {
    var page = args.object;
    // Enable platform specific feature (in this case Android page caching)
    if (frame.topmost().android) {
        frame.topmost().android.cachePagesOnNavigate = true;
    }
    hideSearchKeyboard(page);
    var iosFrame = frame.topmost().ios;
    if (iosFrame) {
        // Fix status bar color and nav bar vidibility
        iosFrame.controller.view.window.backgroundColor = UIColor.blackColor();
        iosFrame.navBarVisibility = "never";
    }
    page.bindingContext = appViewModel.appModel;
}
exports.pageLoaded = pageLoaded;
function selectSession(args) {
    var session = args.view.bindingContext;
    var page = view.getAncestor(args.object, "Page");
    hideSearchKeyboard(page);
    if (!session.isBreak) {
        frame.topmost().navigate({
            moduleName: "views/session-page/session-page",
            context: session
        });
    }
}
exports.selectSession = selectSession;
function selectView(args) {
    var btn = args.object;
    var page = view.getAncestor(btn, "Page");
    var slideBar = page.getViewById("SideDrawer");
    slideBar.closeDrawer();
    appViewModel.appModel.selectView(parseInt(btn.tag), btn.text);
    hideSearchKeyboard(page);
}
exports.selectView = selectView;
function toggleFavorite(args) {
    var session = args.view.bindingContext;
    session.toggleFavorite();
}
exports.toggleFavorite = toggleFavorite;
function showSlideout(args) {
    console.log("show slideout");
    var page = view.getAncestor(args.view, "Page");
    var slideBar = page.getViewById("SideDrawer");
    slideBar.showDrawer();
    hideSearchKeyboard(page);
}
exports.showSlideout = showSlideout;
function hideSearchKeyboard(page) {
    var searchBar = page.getViewById("search");
    if (searchBar.android) {
        searchBar.android.clearFocus();
    }
    if (searchBar.ios) {
        searchBar.ios.resignFirstResponder();
    }
}
function goToUrl(args) {
    var url = args.view.tag;
    if (url) {
        if (platform.device.os === platform.platformNames.ios) {
            var nsUrl = NSURL.URLWithString(url);
            var sharedApp = UIApplication.sharedApplication();
            if (sharedApp.canOpenURL(nsUrl)) {
                sharedApp.openURL(nsUrl);
            }
        }
        else if (platform.device.os === platform.platformNames.android) {
            var intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url));
            var activity = frame.topmost().android.activity;
            activity.startActivity(android.content.Intent.createChooser(intent, "share"));
        }
    }
}
exports.goToUrl = goToUrl;
// Firebase functions
function doInit() {
    console.log('We do an init');
    fbase.doInit();
}
exports.doInit = doInit;
function doStoreCompaniesBySetValue() {
    console.log("doStoreCompaniesBySetValue");
    fbase.doStoreCompaniesBySetValue();
}
exports.doStoreCompaniesBySetValue = doStoreCompaniesBySetValue;
function doQueryPosts() {
    console.log("doQueryPosts");
    fbase.doQueryPosts();
}
exports.doQueryPosts = doQueryPosts;
console.log('doing postInit');
fbase.doPostInit();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFpbi1wYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFJQSxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUNuQyxJQUFPLElBQUksV0FBVyxjQUFjLENBQUMsQ0FBQztBQUV0QyxJQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUd0QyxJQUFPLFlBQVksV0FBVyx5Q0FBeUMsQ0FBQyxDQUFDO0FBQ3pFLElBQU8sYUFBYSxXQUFXLDhDQUE4QyxDQUFDLENBQUM7QUFFL0UsSUFBSSxLQUFLLEdBQUcsYUFBYSxDQUFDLGlCQUFpQixDQUFDO0FBRTVDLG9CQUEyQixJQUEwQjtJQUNqRCxJQUFJLElBQUksR0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDO0lBRW5DLHVFQUF1RTtJQUN2RSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMxQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztJQUN4RCxDQUFDO0lBRUQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFekIsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUNuQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ1gsOENBQThDO1FBQzlDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZFLFFBQVEsQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7SUFDeEMsQ0FBQztJQUVELElBQUksQ0FBQyxjQUFjLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQztBQUNoRCxDQUFDO0FBbEJlLGtCQUFVLGFBa0J6QixDQUFBO0FBRUQsdUJB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