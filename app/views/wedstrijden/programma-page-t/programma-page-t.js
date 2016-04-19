"use strict";
var gestures = require("ui/gestures");
var frame = require("ui/frame");
function pageNavigatingTo(args) {
    var page = args.object;
}
exports.pageNavigatingTo = pageNavigatingTo;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbW1hLXBhZ2UtdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByb2dyYW1tYS1wYWdlLXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLElBQU8sUUFBUSxXQUFXLGFBQWEsQ0FBQyxDQUFDO0FBRXpDLElBQU8sS0FBSyxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBS25DLDBCQUFpQyxJQUF5QjtJQUN0RCxJQUFJLElBQUksR0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3ZDLENBQUM7QUFGZSx3QkFBZ0IsbUJBRS9CLENBQUE7QUFFRCxpQkFBd0IsSUFBK0I7SUFDbkQsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzdCLENBQUM7QUFGZSxlQUFPLFVBRXRCLENBQUE7QUFFRCxtQkFBMEIsSUFBb0M7SUFDMUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbkQsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzdCLENBQUM7QUFDTCxDQUFDO0FBSmUsaUJBQVMsWUFJeEIsQ0FBQSJ9