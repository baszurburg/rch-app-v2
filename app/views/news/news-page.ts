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
import postModel = require("../../shared/models/posts/posts");
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

export function shareButtonTap(args) {
    var item = <postModel.PostModel>args.object.bindingContext
    share(item);
}

export function shareTap(args: gestures.GestureEventData) {
    var item = <postModel.PostModel>args.view.bindingContext;
    share(item);
}

function share(item) {
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

    //page.bindingContext
    var post = <postModel.PostModel>page.bindingContext;
    var layout = page.getViewById("contentExtended");
    var content = post.content.extended;

    var simple = testSimple(content);

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

    var contentItem = {};
    var keyString = "",
        prevKey = "",
        labels = [],
        strings = [],
        spans = [],
        labelIndex = 0,
        spanIndex = 0,
        linkArray = [];

    for (var i = 0; i < contentLength; i++) {

        // ToDo: better names for labels and strings (labelFormatted en formattedString) 
        contentItem = content[i];

        for (var key in contentItem) {
            if (contentItem.hasOwnProperty(key)) {
                keyString = key.toString();

                // CREATE LABEL
                // Sometimes the first node is a text node, then also a break
                if (i === 0 && (keyString !== "break")) {
                    labels[labelIndex] = createFormattedLabel();
                    strings[labelIndex] = new formattedStringModule.FormattedString();
                }

                // BREAK
                if (keyString === "break") {
                    // WRITE LABEL
                    if (i > 0 && i < contentLength - 1) {
                        labels[labelIndex].formattedText = strings[labelIndex];
                        layout.addChild(labels[labelIndex]);
                        labelIndex += 1;
                    }
                    // CREATE ALABVEL
                    if (i < contentLength - 1) {
                        labels[labelIndex] = createFormattedLabel();
                        strings[labelIndex] = new formattedStringModule.FormattedString();
                    }
                } else if (keyString === "text") {
                    // TEXT
                    spans[spanIndex] = new spanModule.Span();
                    spans[spanIndex].text = contentItem[key].toString() + " ";
                    strings[labelIndex].spans.push(spans[spanIndex]);
                    spanIndex += 1;
                } else if (keyString === "strong" || key.toString() === "b") {
                    // STRONG
                    spans[spanIndex] = new spanModule.Span();
                    spans[spanIndex].fontAttributes = 1;
                    spans[spanIndex].text = contentItem[key].toString() + " ";
                    strings[labelIndex].spans.push(spans[spanIndex]);
                    spanIndex += 1;
                } else if (keyString === "a") {
                    // LINK
                    linkArray = contentItem[key];

                    spans[spanIndex] = new spanModule.Span();
                    spans[spanIndex].underline = 1;
                    if (prevKey = keyString) {
                     spans[spanIndex].text = " " + linkArray[1]["text"].toString();                       
                    } else {
                     spans[spanIndex].text = linkArray[1]["text"].toString();                       
                    }

                    strings[labelIndex].spans.push(spans[spanIndex]);

                    spanIndex += 1;
                }

                prevKey = keyString;

                // WRITE LABEL
                // Write the last label to the container.
                if (i === (contentLength - 1)) {
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