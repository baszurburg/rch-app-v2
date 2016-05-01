"use strict";
var observable = require("data/observable");
var gestures = require("ui/gestures");
var dialogs = require("ui/dialogs");
var frame = require("ui/frame");
var programmaModel = require("../../../shared/models/programma/programma");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbW1hLXBhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwcm9ncmFtbWEtcGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxVQUFVLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUUvQyxJQUFPLFFBQVEsV0FBVyxhQUFhLENBQUMsQ0FBQztBQUd6QyxJQUFPLE9BQU8sV0FBVyxZQUFZLENBQUMsQ0FBQztBQUV2QyxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUtuQyxJQUFPLGNBQWMsV0FBVyw0Q0FBNEMsQ0FBQyxDQUFDO0FBQzlFLElBQU8sUUFBUSxXQUFXLDhCQUE4QixDQUFDLENBQUM7QUFFMUQsb0JBQTJCLElBQTBCO0lBQ2pELElBQUksSUFBSSxHQUFlLElBQUksQ0FBQyxNQUFNLENBQUM7SUFFbkMsdUVBQXVFO0lBQ3ZFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzFCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO0lBQ3hELENBQUM7SUFFRCxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO0lBQ25DLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDWCw4Q0FBOEM7UUFDOUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdkUsUUFBUSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztJQUN4QyxDQUFDO0lBRUQsSUFBSSxDQUFDLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQztBQUU3QyxDQUFDO0FBakJlLGtCQUFVLGFBaUJ6QixDQUFBO0FBRUQsaUJBQXdCLElBQStCO0lBQ25ELEtBQUssQ0FBQyxPQUFPLEVBQUUs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