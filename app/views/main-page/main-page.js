"use strict";
var frame = require("ui/frame");
var view = require("ui/core/view");
var platform = require("platform");
var appViewModel = require("../../shared/view-models/app-view-model");
//var fbase = appViewModel.firebaseViewModel;
var isAuthenticated;
var user;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFpbi1wYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFLQSxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUNuQyxJQUFPLElBQUksV0FBVyxjQUFjLENBQUMsQ0FBQztBQUV0QyxJQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQU10QyxJQUFPLFlBQVksV0FBVyx5Q0FBeUMsQ0FBQyxDQUFDO0FBRXpFLDZDQUE2QztBQUM3QyxJQUFJLGVBQXdCLENBQUM7QUFDN0IsSUFBSSxJQUF5QixDQUFDO0FBRzlCLG9CQUEyQixJQUEwQjtJQUNqRCxJQUFJLElBQUksR0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDO0lBRW5DLHVFQUF1RTtJQUN2RSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMxQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztJQUN4RCxDQUFDO0lBRUQsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUNuQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ1gsOENBQThDO1FBQzlDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZFLFFBQVEsQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7SUFDeEMsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtJQUNqQyxJQUFJLElBQUksR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztJQUN0QyxJQUFJLGVBQWUsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQztJ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