import pages = require("ui/page");
import gestures = require("ui/gestures");
import utils = require("utils/utils");
import frame = require("ui/frame");
import observable = require("data/observable");
import imageSource = require("image-source");
import appViewModel = require("../../shared/view-models/app-view-model");

export function pageNavigatingTo(args: pages.NavigatedData) {
    var page = <pages.Page>args.object;
    var roomInfo: appViewModel.RoomInfo;

    if (page && page.navigationContext) {
        roomInfo = <appViewModel.RoomInfo>page.navigationContext.roomInfo;
    }

    var vm = new observable.Observable();

    vm.set("name", "No map ifno");
    vm.set("image", imageSource.fromFile("~/images/no-map.png"));

    page.bindingContext = vm;
}

export function backTap(args: gestures.GestureEventData) {
    frame.topmost().goBack();
}

export function backSwipe(args: gestures.SwipeGestureEventData) {
    if (args.direction === gestures.SwipeDirection.right) {
        frame.topmost().goBack();
    }
}