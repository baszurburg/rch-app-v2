import observable = require("data/observable");
import pages = require("ui/page");
import gestures = require("ui/gestures");
import platform = require("platform");
import utils = require("utils/utils");
import frame = require("ui/frame");
import button = require("ui/button");
import label = require("ui/label");
import view = require("ui/core/view");
import list = require("ui/list-view");
import scrollView = require("ui/scroll-view");
import formattedStringModule = require("text/formatted-string");
import spanModule = require("text/span");

// ToDo: add programma model + uitslagen model
import programmaModel = require("../../../shared/models/programma/programma");
import uitslagenModel = require("../../../shared/models/uitslagen/uitslagen");

import appViewModel = require("../../../shared/view-models/app-view-model");

export function pageNavigatingTo(args: pages.NavigatedData) {
    var page = <pages.Page>args.object;
    
    page.bindingContext = page.navigationContext;
    
    console.log('wedstrijden details - page.navigationContext: ' + page.navigationContext);    

}

// function disableScroll(listView: list.ListView) {
//     if (listView.android) {
//         listView.android.setSelector(new android.graphics.drawable.ColorDrawable(0));
//         listView.android.setOnTouchListener(new android.view.View.OnTouchListener({
//             onTouch: function (view: android.view.View, motionEvent: android.view.MotionEvent) {
//                 return (motionEvent.getAction() === android.view.MotionEvent.ACTION_MOVE);
//             }
//         }));
//     }
//     if (listView.ios) {
//         listView.ios.scrollEnabled = false;
//         listView.ios.allowsSelection = false;
//     }
// }

export function shareButtonTap(args) {
    console.log('In wedstrijd details - args.object.bindingContext: ' + args.object.bindingContext);
    
    var item = <programmaModel.ProgrammaModel>args.object.bindingContext
    share(item);
}

export function shareTap(args: gestures.GestureEventData) {
    var item = <programmaModel.Programma>args.view.bindingContext;
    share(item);
}

function share(item) {
    // var shareText = item.name + " ";
    // shareText += item.content.brief + " ";
    // shareText += item.externalLink + " ";

    var shareText = " Wedstrijd... ";

    if (platform.device.os === platform.platformNames.android) {
        var intent = new android.content.Intent(android.content.Intent.ACTION_SEND);
        intent.setType("text/plain");
        intent.putExtra(android.content.Intent.EXTRA_SUBJECT, "subject");
        intent.putExtra(android.content.Intent.EXTRA_TEXT, shareText);

        var activity = frame.topmost().android.activity;
        activity.startActivity(android.content.Intent.createChooser(intent, "share"));
    }
    else if (platform.device.os === platform.platformNames.ios) {
        var currentPage = frame.topmost().currentPage;

        var controller = new UIActivityViewController(utils.ios.collections.jsArrayToNSArray([shareText]), null);

        (<UIViewController>currentPage.ios).presentViewControllerAnimatedCompletion(controller, true, null);
    }
}

export function backTap(args: gestures.GestureEventData) {
    frame.topmost().goBack();
}


export function backSwipe(args: gestures.SwipeGestureEventData) {
    if (args.direction === gestures.SwipeDirection.right) {
        frame.topmost().goBack();
    }
}

