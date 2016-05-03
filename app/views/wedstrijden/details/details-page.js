"use strict";
var gestures = require("ui/gestures");
var platform = require("platform");
var utils = require("utils/utils");
var frame = require("ui/frame");
function pageNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = page.navigationContext;
    console.log('wedstrijden details - page.navigationContext: ' + page.navigationContext);
}
exports.pageNavigatingTo = pageNavigatingTo;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0YWlscy1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGV0YWlscy1wYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxJQUFPLFFBQVEsV0FBVyxhQUFhLENBQUMsQ0FBQztBQUN6QyxJQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUN0QyxJQUFPLEtBQUssV0FBVyxhQUFhLENBQUMsQ0FBQztBQUN0QyxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQWVuQywwQkFBaUMsSUFBeUI7SUFDdEQsSUFBSSxJQUFJLEdBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUVuQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztJQUU3QyxPQUFPLENBQUMsR0FBRyxDQUFDLGdEQUFnRCxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRTNGLENBQUM7QUFQZSx3QkFBZ0IsbUJBTy9CLENBQUE7QUFFRCxvREFBb0Q7QUFDcEQsOEJBQThCO0FBQzlCLHdGQUF3RjtBQUN4RixzRkFBc0Y7QUFDdEYsbUdBQW1HO0FBQ25HLDZGQUE2RjtBQUM3RixnQkFBZ0I7QUFDaEIsZUFBZTtBQUNmLFFBQVE7QUFDUiwwQkFBMEI7QUFDMUIsOENBQThDO0FBQzlDLGdEQUFnRDtBQUNoRCxRQUFRO0FBQ1IsSUFBSTtBQUVKLHdCQUErQixJQUFJO0lBQy9CLElBQUksSUFBSSxHQUFrQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQTtJQUNwRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEIsQ0FBQztBQUhlLHNCQUFjLGlCQUc3QixDQUFBO0FBRUQsa0JBQXlCLElBQStCO0lBQ3BELElBQUksSUFBSSxHQUE2QixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM5RCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEIsQ0FBQztBQUhlLGdCQUFRLFdBR3ZCLENBQUE7QUFFRCxlQUFlLElBQUk7SUFDZixtQ0FBbUM7SUFDbkMseUNBQXlDO0lBQ3pDLHdDQUF3QztJQUV4QyxJQUFJLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQztJQUVqQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDeEQsSUFBSSxNQUFNLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1RSxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTlELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQ2hELFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pELElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUM7UUFFOUMsSUFBSSxVQUFVLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFdEYsV0FBVyxDQUFDLEdBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hHLENBQUM7QUFDTCxDQUFDO0FBRUQsaUJBQXdCLElBQStCO0lBQ25ELEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUM3QixDQUFDO0FBRmUsZUFBTyxVQUV0QixDQUFBO0FBR0QsbUJBQTBCLElBQW9DO0lBQzFELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ25ELEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM3QixDQUFDO0FBQ0wsQ0FBQztBQUplLGlCQUFTLFlBSXhCLENBQUEifQ==