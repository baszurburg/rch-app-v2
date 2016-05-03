"use strict";
var frame = require("ui/frame");
var view = require("ui/core/view");
var platform = require("platform");
var userViewModel = require("../../shared/view-models/user-view-model");
var appViewModel = require("../../shared/view-models/app-view-model");
var isAuthenticated;
var user;
var userView = new userViewModel.UserViewModel();
function pageLoaded(args) {
    var page = args.object;
    // Enable platform specific feature (in this case Android page caching)
    if (frame.topmost().android) {
        frame.topmost().android.cachePagesOnNavigate = true;
    }
    var iosFrame = frame.topmost().ios;
    if (iosFrame) {
        // Fix status bar color and nav bar visibility
        iosFrame.controller.view.window.backgroundColor = UIColor.blackColor();
        iosFrame.navBarVisibility = "never";
    }
    console.log("in mainPage loaded");
    var user = appViewModel.appModel.user;
    var isAuthenticated = appViewModel.appModel.isAuthenticated;
    //
    // console.log("appViewModel.appModel.user: " + appViewModel.appModel.user);
    // console.log("appViewModel.appModel.user.email: " + appViewModel.appModel.user.email);
    // console.log("appViewModel.appModel.user: " + appViewModel.appModel.user);
    // console.log("appViewModel.appModel.user.email: " + appViewModel.appModel.user.email);    
    //
    page.bindingContext = appViewModel.appModel;
}
exports.pageLoaded = pageLoaded;
function selectNews(args) {
    var post = args.view.bindingContext;
    var page = view.getAncestor(args.object, "Page");
    frame.topmost().navigate({
        moduleName: "views/news/news-page",
        context: post
    });
}
exports.selectNews = selectNews;
function selectView(args) {
    var btn = args.object;
    var page = view.getAncestor(btn, "Page");
    var slideBar = page.getViewById("SideDrawer");
    slideBar.closeDrawer();
    appViewModel.appModel.selectView(parseInt(btn.tag), btn.text);
}
exports.selectView = selectView;
function showSlideout(args) {
    var page = view.getAncestor(args.view, "Page");
    var slideBar = page.getViewById("SideDrawer");
    slideBar.showDrawer();
}
exports.showSlideout = showSlideout;
function refreshNewsList(args) {
    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;
    appViewModel.firebaseViewModel.doQuery('posts', function () {
        appViewModel.appModel.onNewsDataLoaded();
        pullRefresh.refreshing = false;
    });
}
exports.refreshNewsList = refreshNewsList;
function refreshAgendaList(args) {
    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;
    appViewModel.firebaseViewModel.doQuery('agenda', function () {
        pullRefresh.refreshing = false;
    });
}
exports.refreshAgendaList = refreshAgendaList;
exports.logOut = function () {
    userView.logOut();
};
// GO TO Functions
exports.goToLogin = function () {
    var topmost = frame.topmost();
    topmost.navigate("views/account/login/login-page");
};
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
function goToView(args) {
    var view = args.view.tag;
    if (view) {
        frame.topmost().navigate({
            moduleName: view
        });
    }
}
exports.goToView = goToView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFpbi1wYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFLQSxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUNuQyxJQUFPLElBQUksV0FBVyxjQUFjLENBQUMsQ0FBQztBQUV0QyxJQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUt0QyxJQUFPLGFBQWEsV0FBVywwQ0FBMEMsQ0FBQyxDQUFDO0FBQzNFLElBQU8sWUFBWSxXQUFXLHlDQUF5QyxDQUFDLENBQUM7QUFFekUsSUFBSSxlQUF3QixDQUFDO0FBQzdCLElBQUksSUFBeUIsQ0FBQztBQUM5QixJQUFJLFFBQVEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUVqRCxvQkFBMkIsSUFBMEI7SUFDakQsSUFBSSxJQUFJLEdBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUVuQyx1RUFBdUU7SUFDdkUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDMUIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7SUFDeEQsQ0FBQztJQUVELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUM7SUFDbkMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNYLDhDQUE4QztRQUM5QyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN2RSxRQUFRLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUE7SUFDakMsSUFBSSxJQUFJLEdBQUcsWUFBWSxD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