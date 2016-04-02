﻿import observable = require("data/observable");
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


/**
 * Renders the extended new content
 * 
 * @param page (The page object)
 */
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

/**
 * COMPLEX CONTENT
 * 
 * Renders rich text (complex content)
 * 
 * @param layout (the container where the content will be placed in)
 * @param content (The rich text formatted in json )
 */
function complexContent(layout, content) {
    var contentLength = content.length;

    contentLength = 3;

    console.log("complexContent");

    for (var i = 0; i < contentLength; i++) {
        var contentItem = {};
        // var labels = <label.Label>{};
        // var strings = <formattedStringModule.FormattedString>{};
        // var spans = <spanModule.Span>{};
        var labels = [];
        var strings = [];
        var spans = [];
        var spansTable = [];
        var labelIndex = 0,
            //            stringIndex = 0,
            spanIndex = 0;


        // ToDo: better names for labels and strings (labelFormatted en formattedString) 

        contentItem = content[i];

        for (var key in contentItem) {
            if (contentItem.hasOwnProperty(key)) {


                // Sometimes the first node is a text node, then also a break
                if (i === 0 && (key.toString() !== "break")) {
                    labels[labelIndex] = createFormattedLabel();
                    strings[labelIndex] = new formattedStringModule.FormattedString();
                    console.log('create first item')
                }

                // BREAK
                if (key.toString() === "break") {
                    // first write any existing label to the container
                    if (i > 0 && i < contentLength - 1) {
                        console.log('write label');
                        labels[labelIndex].formattedText = strings[labelIndex];
                        layout.addChild(labels[labelIndex]);
                        labelIndex += 1;
                        spansTable = [];
                    }
                    // New Label
                    if (i < contentLength - 1) {
                        console.log('create new label');
                        labels[labelIndex] = createFormattedLabel();
                        strings[labelIndex] = new formattedStringModule.FormattedString();
                    }
                } else if (key.toString() === "text") {
                    console.log('processing text: ' + contentItem[key].toString());
                    spans[spanIndex] = new spanModule.Span();
                    spans[spanIndex].text = contentItem[key].toString();
                    strings[labelIndex].spans.push(spans[spanIndex]);
                    spanIndex += 1;
                } else if (key.toString() === "strong" || key.toString() === "b") {
                    console.log('processing bold');
                    spans[spanIndex] = new spanModule.Span();
                    spans[spanIndex].fontAttributes = 1;
                    spans[spanIndex].text = contentItem[key].toString();
                    strings[labelIndex].spans.push(spans[spanIndex]);

                    console.log('spans: ' + strings[labelIndex].spans + ' ' + strings[labelIndex].spans.length);
                    console.log(spans[spanIndex].text);

                    spanIndex += 1;


                }


                // Write the last label to the container.
                if (i === (contentLength - 1)) {
                    console.log('write last item');
                    labels[labelIndex].formattedText = strings[labelIndex];
                    layout.addChild(labels[labelIndex]);
                }


            }
        }
    }
}


function createFormattedLabel() {
    var labelFormatted = new label.Label();

    labelFormatted.textWrap = true;
    labelFormatted.className = "news-textrow";

    return labelFormatted;
}


/**
 * SIMPLE CONTENT
 * 
 * When there are only texts and breaks
 * 
 * @param layout (the container where the content will be placed in)
 * @param content (The rich text formatted in json )
 */
function simpleContent(layout, content) {
    var contentLength = content.length;
    console.log("simpleContent");

    for (var i = 0; i < contentLength; i++) {

        var contentItem = {};
        contentItem = content[i];

        for (var key in contentItem) {
            if (contentItem.hasOwnProperty(key)) {

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