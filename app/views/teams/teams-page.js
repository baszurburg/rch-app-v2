"use strict";
var observable = require("data/observable");
var gestures = require("ui/gestures");
var platform = require("platform");
var utils = require("utils/utils");
var frame = require("ui/frame");
var settingsModel = require("../../shared/services/settings/settings");
// ToDo: Check the imports
var settings = new settingsModel.SettingsModel();
var page;
function pageNavigatingTo(args) {
    page = args.object;
    var teamViewModel = new TeamViewModel();
    page.bindingContext = teamViewModel;
}
exports.pageNavigatingTo = pageNavigatingTo;
var teamCategories = [
    { title: "Team informatie", Id: '0' },
    { title: "Programma", Id: '1' },
    { title: "Verslagen", Id: '2' }
];
//////////////////////////////////////////////////////
//  TEAM VIEWMODEL
//////////////////////////////////////////////////////
var TeamViewModel = (function (_super) {
    __extends(TeamViewModel, _super);
    function TeamViewModel() {
        _super.call(this);
        console.log("in constructor team view model");
        this.selectedTeamIndex = 0;
        this.team = page.navigationContext;
        this.user = settings.user;
        this._isAuthenticated = this.isAuthenticated;
    }
    Object.defineProperty(TeamViewModel.prototype, "user", {
        get: function () {
            this.user = settings.user;
            return this._user;
        },
        // SETTERS
        set: function (value) {
            this._user = value;
            this.notifyPropertyChange("user", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamViewModel.prototype, "team", {
        get: function () {
            return this._team;
        },
        set: function (value) {
            this._team = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamViewModel.prototype, "isAuthenticated", {
        get: function () {
            try {
                console.log("Teamspage: typeof(this._user.userId) !== 'undefined' : " + (typeof (this._user.userId) !== 'undefined') + " " + typeof (this._user.userId));
                if (this._isAuthenticated !== (typeof (this._user.userId) !== "undefined")) {
                    this.isAuthenticated = (typeof (this._user.userId) !== "undefined");
                }
                return this._isAuthenticated;
            }
            catch (error) {
                return false;
            }
        },
        set: function (value) {
            if (this._isAuthenticated !== value) {
                this._isAuthenticated = value;
                this.notifyPropertyChange("isAuthenticated", value);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TeamViewModel.prototype, "selectedTeamIndex", {
        get: function () {
            return this._selectedTeamIndex;
        },
        // SELECT TEAM CATEGORY
        set: function (value) {
            console.log("teamspage - set selected index: " + this._selectedTeamIndex + " - " + value);
            if (this._selectedTeamIndex !== value) {
                this._selectedTeamIndex = value;
                this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedTeamIndex", value: value });
                this.set("teamHeader", teamCategories[value].title);
            }
        },
        enumerable: true,
        configurable: true
    });
    return TeamViewModel;
}(observable.Observable));
exports.TeamViewModel = TeamViewModel;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVhbXMtcGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlYW1zLXBhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQU8sVUFBVSxXQUFXLGlCQUFpQixDQUFDLENBQUM7QUFFL0MsSUFBTyxRQUFRLFdBQVcsYUFBYSxDQUFDLENBQUM7QUFDekMsSUFBTyxRQUFRLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFDdEMsSUFBTyxLQUFLLFdBQVcsYUFBYSxDQUFDLENBQUM7QUFDdEMsSUFBTyxLQUFLLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFTbkMsSUFBTyxhQUFhLFdBQVcseUNBQXlDLENBQUMsQ0FBQztBQUkxRSwwQkFBMEI7QUFFMUIsSUFBSSxRQUFRLEdBQUcsSUFBSSxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDakQsSUFBSSxJQUFJLENBQUM7QUFFVCwwQkFBaUMsSUFBeUI7SUFDdEQsSUFBSSxHQUFlLElBQUksQ0FBQyxNQUFNLENBQUM7SUFFL0IsSUFBSSxhQUFhLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztJQUd4QyxJQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQztBQUV4QyxDQUFDO0FBUmUsd0JBQWdCLG1CQVEvQixDQUFBO0FBV0QsSUFBSSxjQUFjLEdBQXdCO0lBQ3RDLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUU7SUFDckMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUU7SUFDL0IsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUU7Q0FDbEMsQ0FBQztBQUVGLHNEQUFzRDtBQUN0RCxrQkFBa0I7QUFDbEIsc0RBQXNEO0FBRXREO0lBQW1DLGlDQUFxQjtJQU1wRDtRQUNJLGlCQUFPLENBQUM7UUFFUixPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFFOUMsSUFBSSxDQUFDLGlC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