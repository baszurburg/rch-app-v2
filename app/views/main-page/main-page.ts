import observable = require("data/observable");
import pages = require("ui/page");
import gestures = require("ui/gestures");
import label = require("ui/label");
import listView = require("ui/list-view");
import frame = require("ui/frame");
import view = require("ui/core/view");
import search = require("ui/search-bar");
import platform = require("platform");
import button = require("ui/button");
import scrollView = require("ui/scroll-view");
import postModel = require("../../shared/models/posts/posts");
import appViewModel = require("../../shared/view-models/app-view-model");

import settingsModel = require("../../shared/services/settings/settings");

var settings = new settingsModel.SettingsModel();

//var fbase = appViewModel.firebaseViewModel;

export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;

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

//
    
    // console.log("appViewModel.appModel.user: " + appViewModel.appModel.user);
    // console.log("appViewModel.appModel.user.email: " + appViewModel.appModel.user.email);
    
    // console.log("appViewModel.appModel.user: " + appViewModel.appModel.user);
    // console.log("appViewModel.appModel.user.email: " + appViewModel.appModel.user.email);    
    
    // console.log("settings.user: " + settings.user);
    // console.log("settings.user.email: " + settings.user.email);
    // console.log("settings.user.['email']: " + settings.user['email']);
    
     

//
    page.bindingContext = appViewModel.appModel;
    
}

export function selectNews(args: listView.ItemEventData) {
    var post = <postModel.PostModel>args.view.bindingContext;
    var page = view.getAncestor(<view.View>args.object, "Page")

    frame.topmost().navigate({
        moduleName: "views/news/news-page",
        context: post
    });

}

export function selectView(args: observable.EventData) {
    var btn = <button.Button>args.object;
    var page = view.getAncestor(btn, "Page");
    var slideBar = <any>page.getViewById("SideDrawer");
    slideBar.closeDrawer();

    appViewModel.appModel.selectView(parseInt((<any>btn).tag), btn.text);
}

export function showSlideout(args: gestures.GestureEventData) {
    var page = view.getAncestor(args.view, "Page");
    var slideBar = <any>page.getViewById("SideDrawer");
    slideBar.showDrawer();
}



export function refreshNewsList(args) {

    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;
    
    appViewModel.firebaseViewModel.doQuery('posts', function() {
        appViewModel.appModel.onNewsDataLoaded();
        pullRefresh.refreshing = false;
    });
    
}

export function refreshAgendaList(args) {

    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;
    
    appViewModel.firebaseViewModel.doQuery('agenda', function() {
        pullRefresh.refreshing = false;
    });
        
}

// GO TO Functions

exports.goToLogin = function() {
    var topmost = frame.topmost();
    topmost.navigate("views/account/login/login-page");
};

export function goToUrl(args: gestures.GestureEventData) {
    var url = (<any>args.view).tag;
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

export function goToView(args: gestures.GestureEventData) {
    var view = (<any>args.view).tag;
    if (view) {
        frame.topmost().navigate({
            moduleName: view
        });
    }
}

