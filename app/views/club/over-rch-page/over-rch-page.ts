import pages = require("ui/page");
import gestures = require("ui/gestures");
import utils = require("utils/utils");
import frame = require("ui/frame");
import observable = require("data/observable");
import imageSource = require("image-source");
import appViewModel = require("../../../shared/view-models/app-view-model");

export function pageNavigatingTo(args: pages.NavigatedData) {
    var page = <pages.Page>args.object;
}

export function backTap(args: gestures.GestureEventData) {
    frame.topmost().goBack();
}

export function backSwipe(args: gestures.SwipeGestureEventData) {
    if (args.direction === gestures.SwipeDirection.right) {
        frame.topmost().goBack();
    }
}