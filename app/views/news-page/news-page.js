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
    var contentItem = {};
    var labels = [], strings = [], spans = [], labelIndex = 0, spanIndex = 0, linkArray = [];
    console.log("complexContent");
    for (var i = 0; i < contentLength; i++) {
        // ToDo: better names for labels and strings (labelFormatted en formattedString) 
        contentItem = content[i];
        for (var key in contentItem) {
            if (contentItem.hasOwnProperty(key)) {
                // CREATE LABEL
                // Sometimes the first node is a text node, then also a break
                if (i === 0 && (key.toString() !== "break")) {
                    labels[labelIndex] = createFormattedLabel();
                    strings[labelIndex] = new formattedStringModule.FormattedString();
                    console.log('create first label');
                    console.log('i:' + i + ' - labelIndex: ' + labelIndex + ' - spanIndex: ' + spanIndex);
                }
                // BREAK
                if (key.toString() === "break") {
                    // WRITE LABEL
                    if (i > 0 && i < contentLength - 1) {
                        console.log('write label');
                        console.log('i:' + i + ' - labelIndex: ' + labelIndex + ' - spanIndex: ' + spanIndex);
                        console.log('typeof strings[labelIndex]: ' + typeof strings[labelIndex]);
                        labels[labelIndex].formattedText = strings[labelIndex];
                        layout.addChild(labels[labelIndex]);
                        labelIndex += 1;
                    }
                    // CREATE ALABVEL
                    if (i < contentLength - 1) {
                        console.log('create new label');
                        console.log('i:' + i + ' - labelIndex: ' + labelIndex + ' - spanIndex: ' + spanIndex);
                        labels[labelIndex] = createFormattedLabel();
                        strings[labelIndex] = new formattedStringModule.FormattedString();
                    }
                }
                else if (key.toString() === "text") {
                    // TEXT
                    console.log('processing text: ' + contentItem[key].toString());
                    console.log('i:' + i + ' - labelIndex: ' + labelIndex + ' - spanIndex: ' + spanIndex);
                    console.log('typeof strings[labelIndex]: ' + typeof strings[labelIndex]);
                    spans[spanIndex] = new spanModule.Span();
                    spans[spanIndex].text = contentItem[key].toString() + " ";
                    strings[labelIndex].spans.push(spans[spanIndex]);
                    spanIndex += 1;
                }
                else if (key.toString() === "strong" || key.toString() === "b") {
                    // STRONG
                    console.log('processing bold: ' + contentItem[key].toString());
                    console.log('i:' + i + ' - labelIndex: ' + labelIndex + ' - spanIndex: ' + spanIndex);
                    console.log('typeof strings[labelIndex]: ' + typeof strings[labelIndex]);
                    console.log('typeof strings[labelIndex].spans: ' + typeof strings[labelIndex].spans);
                    spans[spanIndex] = new spanModule.Span();
                    spans[spanIndex].fontAttributes = 1;
                    spans[spanIndex].text = contentItem[key].toString() + " ";
                    strings[labelIndex].spans.push(spans[spanIndex]);
                    console.log('after push - typeof strings[labelIndex]: ' + typeof strings[labelIndex]);
                    console.log('after push - typeof strings[labelIndex].spans: ' + typeof strings[labelIndex].spans);
                    console.log('after push - strings[labelIndex].spans.length: ' + strings[labelIndex].spans.length);
                    spanIndex += 1;
                }
                else if (key.toString() === "a") {
                    // LINK
                    linkArray = contentItem[key];
                    spans[spanIndex] = new spanModule.Span();
                    //spans[spanIndex].underline = 1;
                    spans[spanIndex].text = linkArray[1]["text"].toString();
                    strings[labelIndex].spans.push(spans[spanIndex]);
                    spanIndex += 1;
                }
                // WRITE LABEL
                // Write the last label to the container.
                if (i === (contentLength - 1)) {
                    console.log('write last item');
                    console.log('i:' + i + ' - labelIndex: ' + labelIndex + ' - spanIndex: ' + spanIndex);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3cy1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmV3cy1wYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxJQUFPLFFBQVEsV0FBVyxhQUFhLENBQUMsQ0FBQztBQUN6QyxJQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUN0QyxJQUFPLEtBQUssV0FBVyxhQUFhLENBQUMsQ0FBQztBQUN0QyxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUVuQyxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUluQyxJQUFPLHFCQUFxQixXQUFXLHVCQUF1QixDQUFDLENBQUM7QUFDaEUsSUFBTyxVQUFVLFdBQVcsV0FBVyxDQUFDLENBQUM7QUFHekMsMEJBQWlDLElBQXlCO0lBQ3RELElBQUksSUFBSSxHQUFlLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDbkMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7SUFFN0MscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFaEMsQ0FBQztBQU5lLHdCQUFnQixtQkFNL0IsQ0FBQTtBQUVELHVCQUF1QixRQUF1QjtJQUMxQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNuQixRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdFLFFBQVEsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDdEUsT0FBTyxFQUFFLFVBQVMsSUFBdUIsRUFBRSxXQUFxQztnQkFDNUUsTUFBTSxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzlFLENBQUM7U0FDSixDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFDRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNmLFFBQVEsQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztRQUNuQyxRQUFRLENBQUMsR0FBRyxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7SUFDekMsQ0FBQztBQUNMLENBQUM7QUFFRCxvRUFBb0U7QUFDcEUsc0VBQXNFO0FBQ3RFLDZCQUE2QjtBQUM3QixJQUFJO0FBRUosa0JBQXlCLElBQStCO0lBQ3BELElBQUksSUFBSSxHQUEyQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUU1RCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztJQUNoQyxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO0lBQ3RDLFNBQVMsSUFBSSxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQztJQUVyQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDeEQsSUFBSSxNQUFNLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1RSxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTlELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQ2hELFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pELElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUM7UUFFOUMsSUFBSSxVQUFVLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFdEYsV0FBVyxDQUFDLEdBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hHLENBQUM7QUFDTCxDQUFDO0FBdkJlLGdCQUFRLFdBdUJ2QixDQUFBO0FBRUQsaUJBQXdCLElBQStCO0lBQ25ELEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUM3QixDQUFDO0FBRmUsZUFBTyxVQUV0QixDQUFBO0FBRUQsZ0VBQWdFO0FBQ2hFLHlFQUF5RTtBQUV6RSxpQ0FBaUM7QUFDakMsaURBQWlEO0FBQ2pELDJCQUEyQjtBQUMzQixVQUFVO0FBQ1YsSUFBSTtBQUVKLG1CQUEwQixJQUFvQztJQUMxRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNuRCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDN0IsQ0FBQztBQUNMLENBQUM7QUFKZSxpQkFBUyxZQUl4QixDQUFBO0FBR0Q7Ozs7R0FJRztBQUNILCtCQUErQixJQUFJO0lBRS9CLElBQUksQ0FBQyxjQUFjLENBQUE7SUFDbkIsSUFBSSxJQUFJLEdBQTJCLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDdkQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2pELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO0lBRXBDLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVqQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQTtJQUVoQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ1QsYUFBYSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUNsQyxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDSixjQUFjLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ25DLENBQUM7QUFFTCxDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILHdCQUF3QixNQUFNLEVBQUUsT0FBTztJQUNuQyxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBRW5DLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUNyQixJQUFJLE1BQU0sR0FBRyxFQUFFLEVBQ1gsT0FBTyxHQUFHLEVBQUUsRUFDWixLQUFLLEdBQUcsRUFBRSxFQUNWLFVBQVUsR0FBRyxDQUFDLEVBQ2QsU0FBUyxHQUFHLENBQUMsRUFDYixTQUFTLEdBQUcsRUFBRSxDQUFDO0lBRW5CLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUU5QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBRXJDLGlGQUFpRjtRQUNqRixXQUFXLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXpCLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDMUIsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRWxDLGVBQWU7Z0JBQ2YsNkRBQTZEO2dCQUM3RCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLG9CQUFvQixFQUFFLENBQUM7b0JBQzVDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLHFCQUFxQixDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUNsRSxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUE7b0JBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxpQkFBaUIsR0FBRyxVQUFVLEdBQUcsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLENBQUM7Z0JBQzFGLENBQUM7Z0JBRUQsUUFBUTtnQkFDUixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsY0FBYztvQkFDZCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQzt3QkFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLGlCQUFpQixHQUFHLFVBQVUsR0FBRyxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsQ0FBQzt3QkFDdEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsR0FBRyxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUN6RSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDdkQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzt3QkFDcEMsVUFBVSxJQUFJLENBQUMsQ0FBQztvQkFDcEIsQ0FBQztvQkFDRCxpQkFBaUI7b0JBQ2pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3dCQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsaUJBQWlCLEdBQUcsVUFBVSxHQUFHLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxDQUFDO3dCQUN0RixNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQzt3QkFDNUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUkscUJBQXFCLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQ3RFLENBQUM7Z0JBQ0wsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ25DLE9BQU87b0JBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztvQkFDL0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLGlCQUFpQixHQUFHLFVBQVUsR0FBRyxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsQ0FBQztvQkFDdEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsR0FBRyxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUN6RSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ3pDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFJLEdBQUcsQ0FBQztvQkFDM0QsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pELFNBQVMsSUFBSSxDQUFDLENBQUM7Z0JBQ25CLENBQUM7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxRQUFRLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQy9ELFNBQVM7b0JBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztvQkFDL0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLGlCQUFpQixHQUFHLFVBQVUsR0FBRyxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsQ0FBQztvQkFDdEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsR0FBRyxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUN6RSxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxHQUFHLE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNyRixLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ3pDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO29CQUNwQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLENBQUM7b0JBQzFELE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUVqRCxPQUFPLENBQUMsR0FBRyxDQUFDLDJDQUEyQyxHQUFHLE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQ3RGLE9BQU8sQ0FBQyxHQUFHLENBQUMsaURBQWlELEdBQUcsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2xHLE9BQU8sQ0FBQyxHQUFHLENBQUMsaURBQWlELEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDbEcsU0FBUyxJQUFJLENBQUMsQ0FBQztnQkFDbkIsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLE9BQU87b0JBQ1AsU0FBUyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFFN0IsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUN6QyxpQ0FBaUM7b0JBQ2pDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUN4RCxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFFakQsU0FBUyxJQUFJLENBQUMsQ0FBQztnQkFDbkIsQ0FBQztnQkFFRCxjQUFjO2dCQUNkLHlDQUF5QztnQkFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO29CQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsaUJBQWlCLEdBQUcsVUFBVSxHQUFHLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxDQUFDO29CQUN0RixNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDdkQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDeEMsQ0FBQztZQUVMLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztBQUNMLENBQUM7QUFHRDtJQUNJLElBQUksY0FBYyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBRXZDLGNBQWMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQy9CLGNBQWMsQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDO0lBRTFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFDMUIsQ0FBQztBQUdEOzs7Ozs7O0dBT0c7QUFDSCx1QkFBdUIsTUFBTSxFQUFFLE9BQU87SUFDbEMsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBRTdCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFFckMsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLFdBQVcsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFekIsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUMxQixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFbEMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQzVCLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ2hELENBQUM7WUFFTCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7QUFFTCxDQUFDO0FBRUQsMkJBQTJCLFdBQVcsRUFBRSxHQUFHLEVBQUUsTUFBTTtJQUMvQyxJQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMvQixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztJQUN2QixNQUFNLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQztJQUVsQyxNQUFNLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUUxQyx1QkFBdUI7SUFDdkIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRUQsb0JBQW9CLE9BQU87SUFDdkIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBRWxCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3RDLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUNyQixXQUFXLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXpCLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDMUIsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxNQUFNLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQzFELE1BQU0sR0FBRyxLQUFLLENBQUM7b0JBQ2YsS0FBSyxDQUFDO2dCQUNWLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNWLEtBQUssQ0FBQztRQUNWLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNsQixDQUFDIn0=