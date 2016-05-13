"use strict";
var observable = require("data/observable");
var gestures = require("ui/gestures");
var dialogs = require("ui/dialogs");
var frame = require("ui/frame");
var view = require("ui/core/view");
var uitslagenModel = require("../../../shared/models/uitslagen/uitslagen");
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
    page.bindingContext = uitslagenViewModel;
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
function selectUitslagenDetails(args) {
    var uitslagenItem = args.view.bindingContext;
    var page = view.getAncestor(args.object, "Page");
    console.log("In selectUitslagenDetails: " + uitslagenItem);
    frame.topmost().navigate({
        moduleName: "views/wedstrijden/details/details-page",
        context: uitslagenItem
    });
}
exports.selectUitslagenDetails = selectUitslagenDetails;
var uitslagenCategories = [
    { title: "R.C.H. Thuis", Id: '0' },
    { title: "R.C.H. Uit", Id: '1' }
];
var uitslagenThuisItems = new Array();
var uitslagenUitItems = new Array();
var UitslagenViewModel = (function (_super) {
    __extends(UitslagenViewModel, _super);
    function UitslagenViewModel() {
        _super.call(this);
        this.selectedUitslagenIndex = 0;
        this.set("isUitslagenLoading", true);
    }
    Object.defineProperty(UitslagenViewModel.prototype, "uitslagenThuis", {
        get: function () {
            return this._uitslagenT;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UitslagenViewModel.prototype, "uitslagenUit", {
        get: function () {
            return this._uitslagenU;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UitslagenViewModel.prototype, "selectedUitslagenIndex", {
        get: function () {
            return this._selectedUitslagenIndex;
        },
        // SELECT uitslagen CATEGORY
        set: function (value) {
            if (this._selectedUitslagenIndex !== value) {
                this._selectedUitslagenIndex = value;
                this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedUitslagenIndex", value: value });
                this.set("uitslagenHeader", uitslagenCategories[value].title);
            }
        },
        enumerable: true,
        configurable: true
    });
    UitslagenViewModel.prototype.onUitslagenThuisDataLoaded = function () {
        // console.log("onUitslagenThuisDataLoaded");
        this.set("isUitslagenLoading", false);
        this._uitslagenT = uitslagenThuisItems;
        //console.log("_uitslagenT: " + this._uitslagenT.length + this._uitslagenT);
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "uitslagenThuisItems", value: this._uitslagenT });
    };
    UitslagenViewModel.prototype.onUitslagenUitDataLoaded = function () {
        // console.log("onUitslagenThuisDataLoaded");
        this.set("isUitslagenLoading", false);
        this._uitslagenU = uitslagenUitItems;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "uitslagenUitItems", value: this._uitslagenU });
    };
    return UitslagenViewModel;
}(observable.Observable));
exports.UitslagenViewModel = UitslagenViewModel;
var uitslagenViewModel = new UitslagenViewModel;
function pushuitslagenThuisItems(itemsFromFirebase) {
    var dateMinusOne = "";
    uitslagenThuisItems = [];
    for (var i = 0; i < itemsFromFirebase.length; i++) {
        var uitslagenItem = new uitslagenModel.UitslagModel(itemsFromFirebase[i]);
        if (i > 0) {
            if (uitslagenItem.Datum !== dateMinusOne) {
                uitslagenItem.newDate = true;
            }
            else {
                uitslagenItem.newDate = false;
            }
        }
        else {
            uitslagenItem.newDate = true;
        }
        dateMinusOne = uitslagenItem.Datum;
        uitslagenThuisItems.push(uitslagenItem);
    }
    uitslagenViewModel.onUitslagenThuisDataLoaded();
}
function pushuitslagenUitItems(itemsFromFirebase) {
    var dateMinusOne = "";
    uitslagenUitItems = [];
    for (var i = 0; i < itemsFromFirebase.length; i++) {
        var uitslagenItem = new uitslagenModel.UitslagModel(itemsFromFirebase[i]);
        if (i > 0) {
            if (uitslagenItem.Datum !== dateMinusOne) {
                uitslagenItem.newDate = true;
            }
            else {
                uitslagenItem.newDate = false;
            }
        }
        else {
            uitslagenItem.newDate = true;
        }
        dateMinusOne = uitslagenItem.Datum;
        uitslagenUitItems.push(uitslagenItem);
    }
    uitslagenViewModel.onUitslagenUitDataLoaded();
}
function refreshUitslagenThuisList(args) {
    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;
    firebaseViewModel.doQuery('uitslagen-thuis', function () {
        pullRefresh.refreshing = false;
    });
}
exports.refreshUitslagenThuisList = refreshUitslagenThuisList;
function refreshUitslagenUitList(args) {
    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;
    firebaseViewModel.doQuery('uitslagen-uit', function () {
        pullRefresh.refreshing = false;
    });
}
exports.refreshUitslagenUitList = refreshUitslagenUitList;
// -----------------------------------------------------------
//  FIREBASE MODEL
// -----------------------------------------------------------
var FirebaseModel = (function () {
    function FirebaseModel() {
    }
    FirebaseModel.prototype.doQuery = function (typeQuery, callback) {
        var path = "/uitslagenT", orderByRule = {
            type: firebase.QueryOrderByType.KEY,
            value: null
        };
        switch (typeQuery) {
            case "uitslagen-thuis":
                path = "/uitslagenT";
                break;
            case "uitslagen-uit":
                path = "/uitslagenU";
                break;
            default:
                path = "/uitslagenT";
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
                    case "uitslagen-thuis":
                        pushuitslagenThuisItems(result.value);
                        break;
                    case "uitslagen-uit":
                        pushuitslagenUitItems(result.value);
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
firebaseViewModel.doQuery('uitslagen-thuis', function () {
    null;
});
firebaseViewModel.doQuery('uitslagen-uit', function () {
    null;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWl0c2xhZ2VuLXBhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1aXRzbGFnZW4tcGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxVQUFVLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUUvQyxJQUFPLFFBQVEsV0FBVyxhQUFhLENBQUMsQ0FBQztBQUd6QyxJQUFPLE9BQU8sV0FBVyxZQUFZLENBQUMsQ0FBQztBQUV2QyxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUNuQyxJQUFPLElBQUksV0FBVyxjQUFjLENBQUMsQ0FBQztBQUl0QyxJQUFPLGNBQWMsV0FBVyw0Q0FBNEMsQ0FBQyxDQUFDO0FBRTlFLDhFQUE4RTtBQUM5RSxJQUFPLFFBQVEsV0FBVyw4QkFBOEIsQ0FBQyxDQUFDO0FBRTFELG9CQUEyQixJQUEwQjtJQUNqRCxJQUFJLElBQUksR0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDO0lBRW5DLHVFQUF1RTtJQUN2RSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMxQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztJQUN4RCxDQUFDO0lBRUQsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUNuQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ1gsOENBQThDO1FBQzlDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZFLFFBQVEsQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7SUFDeEMsQ0FBQztJQUVELElBQUksQ0FBQyxjQUFjLEdBQUcsa0JBQWtCLENBQUM7QUFFN0MsQ0FBQztBQWpCZSxrQkFBVSxhQWlCekIs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