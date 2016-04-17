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
    appViewModel.firebaseViewModel.doQueryPosts(function () {
        appViewModel.appModel.onNewsDataLoaded();
        pullRefresh.refreshing = false;
    });
}
exports.refreshNewsList = refreshNewsList;
function refreshAgendaList(args) {
    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;
    appViewModel.firebaseViewModel.doQueryAgenda(function () {
        pullRefresh.refreshing = false;
    });
}
exports.refreshAgendaList = refreshAgendaList;
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