"use strict";
var observable = require("data/observable");
var gestures = require("ui/gestures");
var dialogs = require("ui/dialogs");
var frame = require("ui/frame");
var programmaModel = require("../../../shared/models/programma/programma");
//import appViewModel = require("../../../shared/view-models/app-view-model");
var firebase = require("nativescript-plugin-firebase");
function pageLoaded(args) {
    var page = args.object;
    // Enable platform specific feature (in this case Android page caching)
    if (frame.topmost().android) {
        frame.topmost().android.cachePagesOnNavigate = true;
    }
    var iosFrame = frame.topmost().ios;
    if (iosFrame) {
        // Fix status bar color and nav bar visibility
        iosFrame.controller.view.window.backgroundColor = UIColor.blackColor();
        iosFrame.navBarVisibility = "never";
    }
    page.bindingContext = programmaViewModel;
}
exports.pageLoaded = pageLoaded;
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
var programmaCategories = [
    { title: "R.C.H. Thuis", Id: '0' },
    { title: "R.C.H. Uit", Id: '1' },
    { title: "R.C.H. Toernooien", Id: '2' }
];
var programmaThuisItems = new Array();
var programmaUitItems = new Array();
var ProgrammaViewModel = (function (_super) {
    __extends(ProgrammaViewModel, _super);
    function ProgrammaViewModel() {
        _super.call(this);
        this.selectedProgrammaIndex = 0;
        this.set("isProgrammaLoading", true);
    }
    Object.defineProperty(ProgrammaViewModel.prototype, "programmaThuis", {
        get: function () {
            return this._programmaT;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgrammaViewModel.prototype, "programmaUit", {
        get: function () {
            return this._programmaU;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgrammaViewModel.prototype, "selectedProgrammaIndex", {
        get: function () {
            return this._selectedProgrammaIndex;
        },
        // SELECT PROGRAMMA CATEGORY
        set: function (value) {
            if (this._selectedProgrammaIndex !== value) {
                this._selectedProgrammaIndex = value;
                this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedProgrammaIndex", value: value });
                this.set("programmaHeader", programmaCategories[value].title);
            }
        },
        enumerable: true,
        configurable: true
    });
    ProgrammaViewModel.prototype.onProgrammaThuisDataLoaded = function () {
        // console.log("onProgrammaThuisDataLoaded");
        this.set("isProgrammaLoading", false);
        this._programmaT = programmaThuisItems;
        //console.log("_programmaT: " + this._programmaT.length + this._programmaT);
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "programmaThuisItems", value: this._programmaT });
    };
    ProgrammaViewModel.prototype.onProgrammaUitDataLoaded = function () {
        // console.log("onProgrammaThuisDataLoaded");
        this.set("isProgrammaLoading", false);
        this._programmaU = programmaUitItems;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "programmaUitItems", value: this._programmaU });
    };
    return ProgrammaViewModel;
}(observable.Observable));
exports.ProgrammaViewModel = ProgrammaViewModel;
var programmaViewModel = new ProgrammaViewModel;
function pushprogrammaThuisItems(itemsFromFirebase) {
    var dateMinusOne = "";
    programmaThuisItems = [];
    for (var i = 0; i < itemsFromFirebase.length; i++) {
        var programmaItem = new programmaModel.ProgrammaModel(itemsFromFirebase[i]);
        if (i > 0) {
            if (programmaItem.Datum !== dateMinusOne) {
                programmaItem.newDate = true;
            }
            else {
                programmaItem.newDate = false;
            }
        }
        else {
            programmaItem.newDate = true;
        }
        dateMinusOne = programmaItem.Datum;
        programmaThuisItems.push(programmaItem);
    }
    programmaViewModel.onProgrammaThuisDataLoaded();
}
function pushprogrammaUitItems(itemsFromFirebase) {
    var dateMinusOne = "";
    programmaUitItems = [];
    for (var i = 0; i < itemsFromFirebase.length; i++) {
        var programmaItem = new programmaModel.ProgrammaModel(itemsFromFirebase[i]);
        if (i > 0) {
            if (programmaItem.Datum !== dateMinusOne) {
                programmaItem.newDate = true;
            }
            else {
                programmaItem.newDate = false;
            }
        }
        else {
            programmaItem.newDate = true;
        }
        dateMinusOne = programmaItem.Datum;
        programmaUitItems.push(programmaItem);
    }
    programmaViewModel.onProgrammaUitDataLoaded();
}
function refreshProgrammaThuisList(args) {
    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;
    firebaseViewModel.doQuery('programma-thuis', function () {
        pullRefresh.refreshing = false;
    });
}
exports.refreshProgrammaThuisList = refreshProgrammaThuisList;
function refreshProgrammaUitList(args) {
    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;
    firebaseViewModel.doQuery('programma-uit', function () {
        pullRefresh.refreshing = false;
    });
}
exports.refreshProgrammaUitList = refreshProgrammaUitList;
// -----------------------------------------------------------
//  FIREBASE MODEL
// -----------------------------------------------------------
var FirebaseModel = (function () {
    function FirebaseModel() {
    }
    FirebaseModel.prototype.doQuery = function (typeQuery, callback) {
        var path = "/programmaT", orderByRule = {
            type: firebase.QueryOrderByType.KEY,
            value: null
        };
        switch (typeQuery) {
            case "programma-thuis":
                path = "/programmaT";
                break;
            case "programma-uit":
                path = "/programmaU";
                break;
            default:
                path = "/programmaT";
        }
        var onValueEvent = function (result) {
            // note that the query returns 1 match at a time,
            // in the order specified in the query
            // console.log("Query result: " + JSON.stringify(result));
            if (result.error) {
                dialogs.alert({
                    title: "Fout downloaden gegevens " + typeQuery,
                    message: result.error,
                    okButtonText: "OK"
                });
            }
            else {
                switch (typeQuery) {
                    case "programma-thuis":
                        pushprogrammaThuisItems(result.value);
                        break;
                    case "programma-uit":
                        pushprogrammaUitItems(result.value);
                        break;
                    case "uitslagen-thuis":
                        //path = "/uitslagenT";
                        break;
                    case "uitslagen-uit":
                        //path = "/uitslagenU";
                        break;
                    default:
                        null;
                }
                callback();
            }
        };
        firebase.query(onValueEvent, path, {
            singleEvent: true,
            orderBy: orderByRule
        }).then(function () {
            // console.log("firebase.doQueryPosts done; added a listener");
        }, function (errorMessage) {
            dialogs.alert({
                title: "Fout lezen gegevens " + typeQuery,
                message: errorMessage,
                okButtonText: "OK"
            });
        });
    };
    ;
    return FirebaseModel;
}());
exports.FirebaseModel = FirebaseModel;
var firebaseViewModel = new FirebaseModel();
firebaseViewModel.doQuery('programma-thuis', function () {
    null;
});
firebaseViewModel.doQuery('programma-uit', function () {
    null;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbW1hLXBhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwcm9ncmFtbWEtcGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxVQUFVLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUUvQyxJQUFPLFFBQVEsV0FBVyxhQUFhLENBQUMsQ0FBQztBQUd6QyxJQUFPLE9BQU8sV0FBVyxZQUFZLENBQUMsQ0FBQztBQUV2QyxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUtuQyxJQUFPLGNBQWMsV0FBVyw0Q0FBNEMsQ0FBQyxDQUFDO0FBRTlFLDhFQUE4RTtBQUM5RSxJQUFPLFFBQVEsV0FBVyw4QkFBOEIsQ0FBQyxDQUFDO0FBRTFELG9CQUEyQixJQUEwQjtJQUNqRCxJQUFJLElBQUksR0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDO0lBRW5DLHVFQUF1RTtJQUN2RSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMxQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztJQUN4RCxDQUFDO0lBRUQsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUNuQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ1gsOENBQThDO1FBQzlDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZFLFFBQVEsQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7SUFDeEMsQ0FBQztJQUVELElBQUksQ0FBQyxjQUFjLEdBQUcsa0JBQWtCLENBQUM7QUFFN0MsQ0FBQztBQWpCZSxrQkFBVSxhQWlCekIsQ0FBQTtBQUVELGlCQUF3QixJQUErQjtJQUNuRCxLQUFLLENB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