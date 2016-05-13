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
import userModel = require("../../shared/models/users/user");
import settingsModel = require("../../shared/services/settings/settings");
import teamModel = require("../../shared/models/teams/teams");
import appViewModel = require("../../shared/view-models/app-view-model");

var settings = new settingsModel.SettingsModel();
// ToDo: Check the imports

export function pageNavigatingTo(args: pages.NavigatedData) {
    var page = <pages.Page>args.object;
    
    page.bindingContext = page.navigationContext;

}

////////////////////////////
// MODELS
////////////////////////////

interface TeamCategory {
    Id: string;
    title: string;
}

var teamCategories: Array<TeamCategory> = [
    { title: "Team informatie", Id: '0' },
    { title: "Programma", Id: '1' },
    { title: "Verslagen", Id: '2' }
];

//////////////////////////////////////////////////////
//  TEAM VIEWMODEL
//////////////////////////////////////////////////////

export class TeamViewModel extends observable.Observable {
    private _selectedTeamIndex;
    private _isAuthenticated: boolean;
    private _user: userModel.UserModel;

    constructor() {
        super();

        console.log("in constructor team view model");

        this.selectedTeamIndex = 0;

        this.user = settings.user;
        this._isAuthenticated = this.isAuthenticated;

    }

    get user(): userModel.UserModel {
        this.user = settings.user;
        return this._user;
    }

    get isAuthenticated(): boolean {
        try {
            console.log("Teamspage: typeof(this._user.userId) !== 'undefined' : " + (typeof(this._user.userId) !== 'undefined') + " " + typeof(this._user.userId));
            if (this._isAuthenticated !== (typeof(this._user.userId) !== "undefined")) {
                this.isAuthenticated = (typeof(this._user.userId) !== "undefined");                 
            }
            return this._isAuthenticated;
        }
        catch (error) {
            return false;
        }

    }

    get selectedTeamIndex(): number {
        return this._selectedTeamIndex;
    }    

    // SETTERS

    set user(value: userModel.UserModel) {
        this._user = value;
        this.notifyPropertyChange("user", value);
    }

    set isAuthenticated(value: boolean) {
        if (this._isAuthenticated !== value) {
            this._isAuthenticated = value;
            this.notifyPropertyChange("isAuthenticated", value);            
        }
    }
    

    // SELECT TEAM CATEGORY
    set selectedTeamIndex(value: number) {
        if (this._selectedTeamIndex !== value) {
            this._selectedTeamIndex = value;
            this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedTeamIndex", value: value });

            this.set("teamHeader", teamCategories[value].title);

        }
    }

}

export var teamViewModel = new TeamViewModel();



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

export function shareButtonTap(args) {
    var item = <teamModel.TeamModel>args.object.bindingContext
    share(item);
}

export function shareTap(args: gestures.GestureEventData) {
    var item = <teamModel.TeamModel>args.view.bindingContext;
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
