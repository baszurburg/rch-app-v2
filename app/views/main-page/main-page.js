"use strict";
var frame = require("ui/frame");
var view = require("ui/core/view");
var platform = require("platform");
var appViewModel = require("../../shared/view-models/app-view-model");
var fbase = appViewModel.firebaseViewModel;
function pageLoaded(args) {
    var page = args.object;
    // Enable platform specific feature (in this case Android page caching)
    if (frame.topmost().android) {
        frame.topmost().android.cachePagesOnNavigate = true;
    }
    var iosFrame = frame.topmost().ios;
    if (iosFrame) {
        // Fix status bar color and nav bar vidibility
        iosFrame.controller.view.window.backgroundColor = UIColor.blackColor();
        iosFrame.navBarVisibility = "never";
    }
    page.bindingContext = appViewModel.appModel;
}
exports.pageLoaded = pageLoaded;
function selectNews(args) {
    var post = args.view.bindingContext;
    var page = view.getAncestor(args.object, "Page");
    frame.topmost().navigate({
        moduleName: "views/news-page/news-page",
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
    console.log("refreshNewsList");
    // Do work here... and when done call set refreshing property to false to stop the refreshing
    // loadItems().then(function (resp) {
    //     // ONLY USING A TIMEOUT TO SIMULATE/SHOW OFF THE REFRESHING
    //     setTimeout(function () {
    //         pullRefresh.refreshing = false;
    //     }, 1000);
    // }, function (err) {
    //     pullRefresh.refreshing = false;
    // });
    setTimeout(function () {
        pullRefresh.refreshing = false;
    }, 5000);
}
exports.refreshNewsList = refreshNewsList;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFpbi1wYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFLQSxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUNuQyxJQUFPLElBQUksV0FBVyxjQUFjLENBQUMsQ0FBQztBQUV0QyxJQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUd0QyxJQUFPLFlBQVksV0FBVyx5Q0FBeUMsQ0FBQyxDQUFDO0FBRXpFLElBQUksS0FBSyxHQUFHLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQztBQUUzQyxvQkFBMkIsSUFBMEI7SUFDakQsSUFBSSxJQUFJLEdBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUVuQyx1RUFBdUU7SUFDdkUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDMUIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7SUFDeEQsQ0FBQztJQUVELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUM7SUFDbkMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNYLDhDQUE4QztRQUM5QyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN2RSxRQUFRLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxJQUFJLENBQUMsY0FBYyxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUM7QUFDaEQsQ0FBQztBQWhCZSxrQkFBVSxhQWdCekIsQ0FBQTtBQUVELG9CQUEyQixJQUE0QjtJQUNuRCxJQUFJLElBQUksR0FBMkIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDNUQsSUFB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