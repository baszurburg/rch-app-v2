"use strict";
var gestures = require("ui/gestures");
var platform = require("platform");
var utils = require("utils/utils");
var frame = require("ui/frame");
var label = require("ui/label");
var formattedStringModule = require("text/formatted-string");
var spanModule = require("text/span");
function pageNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = page.navigationContext;
    console.log("start news-page");
    renderContentExtended(page);
}
exports.pageNavigatingTo = pageNavigatingTo;
function disableScroll(listView) {
    if (listView.android) {
        listView.android.setSelector(new android.graphics.drawable.ColorDrawable(0));
        listView.android.setOnTouchListener(new android.view.View.OnTouchListener({
            onTouch: function (view, motionEvent) {
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
function shareTap(args) {
    var item = args.view.bindingContext;
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
        currentPage.ios.presentViewControllerAnimatedCompletion(controller, true, null);
    }
}
exports.shareTap = shareTap;
function backTap(args) {
    frame.topmost().goBack();
}
exports.backTap = backTap;
// export function showMapTap(args: gestures.GestureEventData) {
//     var session = <appViewModel.SessionModel>args.view.bindingContext;
//     frame.topmost().navigate({
//         moduleName: "views/map-page/map-page",
//         context: session
//     });
// }
function backSwipe(args) {
    if (args.direction === gestures.SwipeDirection.right) {
        frame.topmost().goBack();
    }
}
exports.backSwipe = backSwipe;
/**
 * Renders the extended new content
 *
 * @param page (The page object)
 */
function renderContentExtended(page) {
    page.bindingContext;
    var post = page.bindingContext;
    var layout = page.getViewById("contentExtended");
    var content = post.content.extended;
    var simple = testSimple(content);
    if (simple) {
        simpleContent(layout, content);
    }
    else {
        complexContent(layout, content);
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
    var keyString = "", prevKey = "", labels = [], strings = [], spans = [], labelIndex = 0, spanIndex = 0, linkArray = [];
    console.log("complex content");
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
                }
                else if (keyString === "text") {
                    // TEXT
                    spans[spanIndex] = new spanModule.Span();
                    spans[spanIndex].text = contentItem[key].toString() + " ";
                    strings[labelIndex].spans.push(spans[spanIndex]);
                    spanIndex += 1;
                }
                else if (keyString === "strong" || key.toString() === "b") {
                    // STRONG
                    spans[spanIndex] = new spanModule.Span();
                    spans[spanIndex].fontAttributes = 1;
                    spans[spanIndex].text = contentItem[key].toString() + " ";
                    strings[labelIndex].spans.push(spans[spanIndex]);
                    spanIndex += 1;
                }
                else if (keyString === "a") {
                    // LINK
                    linkArray = contentItem[key];
                    spans[spanIndex] = new spanModule.Span();
                    //spans[spanIndex].underline = 1;
                    if (prevKey = keyString) {
                        spans[spanIndex].text = " " + linkArray[1]["text"].toString();
                    }
                    else {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3cy1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmV3cy1wYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxJQUFPLFFBQVEsV0FBVyxhQUFhLENBQUMsQ0FBQztBQUN6QyxJQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUN0QyxJQUFPLEtBQUssV0FBVyxhQUFhLENBQUMsQ0FBQztBQUN0QyxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUVuQyxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUluQyxJQUFPLHFCQUFxQixXQUFXLHVCQUF1QixDQUFDLENBQUM7QUFDaEUsSUFBTyxVQUFVLFdBQVcsV0FBVyxDQUFDLENBQUM7QUFHekMsMEJBQWlDLElBQXlCO0lBQ3RELElBQUksSUFBSSxHQUFlLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDbkMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7SUFFN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRS9CLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBRWhDLENBQUM7QUFSZSx3QkFBZ0IsbUJBUS9CLENBQUE7QUFFRCx1QkFBdUIsUUFBdUI7SUFDMUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDbkIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RSxRQUFRLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBQ3RFLE9BQU8sRUFBRSxVQUFTLElBQXVCLEVBQUUsV0FBcUM7Z0JBQzVFLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxT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