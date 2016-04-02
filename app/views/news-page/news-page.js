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
    console.log('simple: ' + simple);
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
                    console.log('create first item');
                }
                // BREAK
                if (key.toString() === "break") {
                    // first write any existing label to the container
                    if (i > 0 && i < contentLength - 1) {
                        console.log('write label');
                        labels[labelIndex].formattedText = strings[labelIndex];
                        layout.addChild(labels[labelIndex]);
                        labelIndex += 1;
                    }
                    // New Label
                    if (i < contentLength - 1) {
                        console.log('create new label');
                        labels[labelIndex] = createFormattedLabel();
                        strings[labelIndex] = new formattedStringModule.FormattedString();
                    }
                }
                else if (key.toString() === "text") {
                    console.log('processing text: ' + contentItem[key].toString());
                    spans[spanIndex] = new spanModule.Span();
                    spans[spanIndex].text = contentItem[key].toString();
                    
                    // ToDo: why can't we push multiple items to spans
                    
                    strings[labelIndex].spans.push(spans[spanIndex]);
                    spanIndex += 1;
                }
                else if (key.toString() === "strong" || key.toString() === "b") {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3cy1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmV3cy1wYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxJQUFPLFFBQVEsV0FBVyxhQUFhLENBQUMsQ0FBQztBQUN6QyxJQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUN0QyxJQUFPLEtBQUssV0FBVyxhQUFhLENBQUMsQ0FBQztBQUN0QyxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUVuQyxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUluQyxJQUFPLHFCQUFxQixXQUFXLHVCQUF1QixDQUFDLENBQUM7QUFDaEUsSUFBTyxVQUFVLFdBQVcsV0FBVyxDQUFDLENBQUM7QUFHekMsMEJBQWlDLElBQXlCO0lBQ3RELElBQUksSUFBSSxHQUFlLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDbkMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7SUFFN0MscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFaEMsQ0FBQztBQU5lLHdCQUFnQixtQkFNL0IsQ0FBQTtBQUVELHVCQUF1QixRQUF1QjtJQUMxQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNuQixRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdFLFFBQVEsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDdEUsT0FBTyxFQUFFLFVBQVMsSUFBdUIsRUFBRSxXQUFxQztnQkFDNUUsTUFBTSxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFD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