"use strict";
var frame = require("ui/frame");
var view = require("ui/core/view");
var platform = require("platform");
var appViewModel = require("../../shared/view-models/app-view-model");
//import firebaseModel = require("../../shared/view-models/firebase-view-model");
var fbase = appViewModel.firebaseViewModel;
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
function selectNews(args) {
    var post = args.view.bindingContext;
    var page = view.getAncestor(args.object, "Page");
    hideSearchKeyboard(page);
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
// fbase.doPostInit(); 
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFpbi1wYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFJQSxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUNuQyxJQUFPLElBQUksV0FBVyxjQUFjLENBQUMsQ0FBQztBQUV0QyxJQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUd0QyxJQUFPLFlBQVksV0FBVyx5Q0FBeUMsQ0FBQyxDQUFDO0FBQ3pFLGlGQUFpRjtBQUVqRixJQUFJLEtBQUssR0FBRyxZQUFZLENBQUMsaUJBQWlCLENBQUM7QUFFM0Msb0JBQTJCLElBQTBCO0lBQ2pELElBQUksSUFBSSxHQUFlLElBQUksQ0FBQyxNQUFNLENBQUM7SUFFbkMsdUVBQXVFO0lBQ3ZFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzFCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO0lBQ3hELENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV6QixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO0lBQ25DLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDWCw4Q0FBOEM7UUFDOUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdkUsUUFBUSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztJQUN4QyxDQUFDO0lBRUQsSUFBSSxDQUFDLGNBQWMsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDO0FBQ2hELENBQUM7QUFsQmUsa0JBQVUsYUFrQnpCLENBQUE7QUFFRCx1QkFBOEIsSUFBNEI7SUFDdEQsSUFBSSxPQUFP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