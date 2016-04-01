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
import appViewModel = require("../../shared/view-models/app-view-model");

export function pageNavigatingTo(args: pages.NavigatedData) {
    var page = <pages.Page>args.object;
    page.bindingContext = page.navigationContext;

    renderContentExtended(page);

}

function disableScroll(listView: list.ListView) {
    if (listView.android) {
        listView.android.setSelector(new android.graphics.drawable.ColorDrawable(0));
        listView.android.setOnTouchListener(new android.view.View.OnTouchListener({
            onTouch: function(view: android.view.View, motionEvent: android.view.MotionEvent) {
                return (motionEvent.getAction() === android.view.MotionEvent.ACTION_MOVE);
            }
        }));
    }
    if (listView.ios) {
        listView.ios.scrollEnabled = false;
        listView.ios.allowsSelection = false;
    }
}

// export function toggleFavorite(args: gestures.GestureEventData) {
//     var item = <appViewModel.SessionModel>args.view.bindingContext;
//     item.toggleFavorite();
// }

export function shareTap(args: gestures.GestureEventData) {
    var item = <appViewModel.PostModel>args.view.bindingContext;

    var shareText = item.name + " ";
    shareText += item.content.brief + " ";
    shareText += item.externalLink + " ";

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

// export function showMapTap(args: gestures.GestureEventData) {
//     var session = <appViewModel.SessionModel>args.view.bindingContext;

//     frame.topmost().navigate({
//         moduleName: "views/map-page/map-page",
//         context: session
//     });
// }

export function backSwipe(args: gestures.SwipeGestureEventData) {
    if (args.direction === gestures.SwipeDirection.right) {
        frame.topmost().goBack();
    }
}

function renderContentExtended(page) {

    page.bindingContext
    var post = <appViewModel.PostModel>page.bindingContext;
    var layout = page.getViewById("contentExtended");
    var content = post.content.extended;

    var simple = testSimple(content);

    console.log('simple: ' + simple)

    if (simple) {
        simpleContent(layout, content)
    } else {
        complexContent(layout, content)
    }

}

function complexContent(layout, content) {

    console.log("complexContent");

    for (var i = 0; i < content.length; i++) {

        var contentItem = {};
        contentItem = content[i];

        for (var key in contentItem) {
            if (contentItem.hasOwnProperty(key)) {

                // If all keys are only text or break run simpleLabels
                if (key.toString() === "text") {
                    createSimpleLabel(contentItem, key, layout);
                }

            }
        }
    }

}


function simpleContent(layout, content) {

    console.log("simpleContent");

    for (var i = 0; i < content.length; i++) {

        var contentItem = {};
        contentItem = content[i];

        for (var key in contentItem) {
            if (contentItem.hasOwnProperty(key)) {

                // If all keys are only text or break run simpleLabels
                if (key.toString() === "text") {
                    createSimpleLabel(contentItem, key, layout);
                }

            }
        }
    }

}

function createSimpleLabel(contentItem, key, layout) {
    var label1 = new label.Label();
    label1.textWrap = true;
    label1.className = "news-textrow";

    label1.text = contentItem[key].toString();

    // connect to live view
    layout.addChild(label1);
}

function testSimple(content) {
    var simple = true;

    for (var i = 0; i < content.length; i++) {
        var contentItem = {};
        contentItem = content[i];

        for (var key in contentItem) {
            if (contentItem.hasOwnProperty(key)) {
                if (key.toString() !== "text" && key.toString() !== "break") {
                    simple = false;
                    break;
                }
            }
        }
        if (!simple) {
            break;
        }
    }

    return simple;
}