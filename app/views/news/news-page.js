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
function shareButtonTap(args) {
    var item = args.object.bindingContext;
    share(item);
}
exports.shareButtonTap = shareButtonTap;
function shareTap(args) {
    var item = args.view.bindingContext;
    share(item);
}
exports.shareTap = shareTap;
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
        currentPage.ios.presentViewControllerAnimatedCompletion(controller, true, null);
    }
}
function backTap(args) {
    frame.topmost().goBack();
}
exports.backTap = backTap;
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
    //page.bindingContext
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
                    spans[spanIndex].underline = 1;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3cy1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmV3cy1wYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxJQUFPLFFBQVEsV0FBVyxhQUFhLENBQUMsQ0FBQztBQUN6QyxJQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUN0QyxJQUFPLEtBQUssV0FBVyxhQUFhLENBQUMsQ0FBQztBQUN0QyxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUVuQyxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUluQyxJQUFPLHFCQUFxQixXQUFXLHVCQUF1QixDQUFDLENBQUM7QUFDaEUsSUFBTyxVQUFVLFdBQVcsV0FBVyxDQUFDLENBQUM7QUFJekMsMEJBQWlDLElBQXlCO0lBQ3RELElBQUksSUFBSSxHQUFlLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDbkMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7SUFFN0MscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUxlLHdCQUFnQixtQkFLL0IsQ0FBQTtBQUVELHVCQUF1QixRQUF1QjtJQUMxQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNuQixRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdFLFFBQVEsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDdEUsT0FBTyxFQUFFLFVBQVUsSUFBdUIsRUFBRSxXQUFxQztnQkFDN0UsTUFBTSxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFD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