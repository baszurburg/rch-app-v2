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
        // console.log("_programmaT: " + this._programmaT.length + this._programmaT);
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "programmaThuisItems", value: this._programmaT });
    };
    return ProgrammaViewModel;
}(observable.Observable));
exports.ProgrammaViewModel = ProgrammaViewModel;
var programmaViewModel = new ProgrammaViewModel;
function pushprogrammaThuisItems(itemsFromFirebase) {
    programmaThuisItems = [];
    for (var i = 0; i < itemsFromFirebase.length; i++) {
        var programmaItem = new programmaModel.ProgrammaModel(itemsFromFirebase[i]);
        programmaThuisItems.push(programmaItem);
    }
    programmaViewModel.onProgrammaThuisDataLoaded();
}
function refreshProgrammaList(args) {
    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;
    firebaseViewModel.doQuery('programma-thuis', function () {
        pullRefresh.refreshing = false;
    });
}
exports.refreshProgrammaList = refreshProgrammaList;
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
                        //path = "/programmaT";\
                        pushprogrammaThuisItems(result.value);
                        break;
                    case "programma-uit":
                        //path = "/programmaU";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbW1hLXBhZ2UtdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByb2dyYW1tYS1wYWdlLXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQU8sVUFBVSxXQUFXLGlCQUFpQixDQUFDLENBQUM7QUFFL0MsSUFBTyxRQUFRLFdBQVcsYUFBYSxDQUFDLENBQUM7QUFHekMsSUFBTyxPQUFPLFdBQVcsWUFBWSxDQUFDLENBQUM7QUFFdkMsSUFBTyxLQUFLLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFJbkMsSUFBTyxjQUFjLFdBQVcsNENBQTRDLENBQUMsQ0FBQztBQUU5RSw4RUFBOEU7QUFDOUUsSUFBTyxRQUFRLFdBQVcsOEJBQThCLENBQUMsQ0FBQztBQUUxRCxvQkFBMkIsSUFBMEI7SUFDakQsSUFBSSxJQUFJLEdBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUVuQyxJQUFJLENBQUMsY0FBYyxHQUFHLGtCQUFrQixDQUFDO0FBRTdDLENBQUM7QUFMZSxrQkFBVSxhQUt6QixDQUFBO0FBRUQsaUJBQXdCLElBQStCO0lBQ25ELEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUM3QixDQUFDO0FBRmUsZUFBTyxVQUV0QixDQUFBO0FBRUQsbUJBQTBCLElBQW9DO0lBQzFELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ25ELEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM3QixDQUFDO0FBQ0wsQ0FBQztBQUplLGlCQUFTLFlBSXhCLENBQUE7QUFXRCxJQUFJLG1CQUFtQixHQUE2QjtJQUNoRCxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRTtJQUNsQyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRTtJQUNoQyxFQUFF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