"use strict";
var observable = require("data/observable");
var gestures = require("ui/gestures");
var dialogs = require("ui/dialogs");
var frame = require("ui/frame");
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
        // SELECT PROGRAMMA CATEGORY
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWl0c2xhZ2VuLXBhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1aXRzbGFnZW4tcGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxVQUFVLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUUvQyxJQUFPLFFBQVEsV0FBVyxhQUFhLENBQUMsQ0FBQztBQUd6QyxJQUFPLE9BQU8sV0FBVyxZQUFZLENBQUMsQ0FBQztBQUV2QyxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQztBQUtuQyxJQUFPLGNBQWMsV0FBVyw0Q0FBNEMsQ0FBQyxDQUFDO0FBRTlFLDhFQUE4RTtBQUM5RSxJQUFPLFFBQVEsV0FBVyw4QkFBOEIsQ0FBQyxDQUFDO0FBRTFELG9CQUEyQixJQUEwQjtJQUNqRCxJQUFJLElBQUksR0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDO0lBRW5DLHVFQUF1RTtJQUN2RSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMxQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztJQUN4RCxDQUFDO0lBRUQsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUNuQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ1gsOENBQThDO1FBQzlDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZFLFFBQVEsQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7SUFDeEMsQ0FBQztJQUVELElBQUksQ0FBQyxjQUFjLEdBQUcsa0JBQWtCLENBQUM7QUFFN0MsQ0FBQztBQWpCZSxrQkFBVSxhQWlCekIsQ0FBQTtBQUVELGlCQUF3QixJQUErQjtJQUNuRCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDN0IsQ0FBQztBQUZlLGVBQU8sVUFFdEIsQ0FBQTtBQUVELG1CQUEwQixJQUFvQztJQUMxRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNuRCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDN0IsQ0FBQztBQUNMLENBQUM7QUFKZSxpQkFBUyxZQUl4QixDQUFBO0FBV0QsSUFBSSxtQkFBbUIsR0FBNkI7SUFDaEQsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUU7SUFDbEMsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUU7Q0FDbkMsQ0FBQztBQUVGLElBQUksbUJBQW1CLEdBQXVDLElBQUksS0FBSyxFQUErQixDQUFDO0FBQ3ZHLElBQUksaUJBQWlCLEdBQXVDLElBQUksS0FBSyxFQUErQixDQUFDO0FBRXJHO0lBQXdDLHNDQUFxQjtJQUt6RDtRQUNJLGlCQUFPLENBQUM7UUFFUixJQUFJLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELHNCQUFJLDhDQUFjO2FBQWxCO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDNUIsQ0FBQzs7O09BQUE7SUFDRCxzQkFBSSw0Q0FBWTthQUFoQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzVCLENBQUM7OztPQUFBO0lBRUQsc0JBQUksc0RBQXNCO2FBQTFCO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztRQUN4QyxDQUFDO1FBRUYsNEJBQTRCO2FBQzNCLFVBQTJCLEtBQWE7WUFDcEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxLQUFLLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFLFlBQVksRUFBRSx3QkFBd0IsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFFMUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRSxDQUFDO1FBQ0wsQ0FBQzs7O09BVkE7SUFZTSx1REFBMEIsR0FBakM7UUFDSSw2Q0FBNkM7UUFDN0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsV0FBVyxHQUFHLG1CQUFtQixDQUFDO1FBRXZDLDRFQUE0RTtRQUU1RSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxZQUFZLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ3RKLENBQUM7SUFFTSxxREFBd0IsR0FBL0I7UUFDSSw2Q0FBNkM7UUFDN0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsV0FBVyxHQUFHLGlCQUFpQixDQUFDO1FBRXJDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFLFlBQVksRUFBRSxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDcEosQ0FBQztJQUNMLHlCQUFDO0FBQUQsQ0FBQyxBQWxERCxDQUF3QyxVQUFVLENBQUMsVUFBVSxHQWtENUQ7QUFsRFksMEJBQWtCLHFCQWtEOUIsQ0FBQTtBQUVELElBQUksa0JBQWtCLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQztBQUVoRCxpQ0FBaUMsaUJBQWdEO0lBRTdFLElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztJQUN0QixtQkFBbUIsR0FBRyxFQUFFLENBQUM7SUFFekIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNoRCxJQUFJLGFBQWEsR0FBRyxJQUFJLGNBQWMsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUxRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNSLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDdkMsYUFBYSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDakMsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDO2dCQUNGLGFBQWEsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixhQUFhLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNqQyxDQUFDO1FBRUQsWUFBWSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFDbkMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxrQkFBa0IsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0FBQ3BELENBQUM7QUFFRCwrQkFBK0IsaUJBQWdEO0lBRTNFLElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztJQUN0QixpQkFBaUIsR0FBRyxFQUFFLENBQUM7SUFFdkIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNoRCxJQUFJLGFBQWEsR0FBRyxJQUFJLGNBQWMsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUxRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNSLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDdkMsYUFBYSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDakMsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDO2dCQUNGLGFBQWEsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDO1FBQUEsSUFBSSxDQUFDLENBQUM7WUFDSCxhQUFhLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNqQyxDQUFDO1FBRUQsWUFBWSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFFbkMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO0FBQ2xELENBQUM7QUFFRCxtQ0FBMEMsSUFBSTtJQUUxQyxzQ0FBc0M7SUFDdEMsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUUvQixpQkFBaUIsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUU7UUFDeEMsV0FBVyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7SUFDbkMsQ0FBQyxDQUFDLENBQUM7QUFFUCxDQUFDO0FBVGUsaUNBQXlCLDRCQVN4QyxDQUFBO0FBRUQsaUNBQXdDLElBQUk7SUFFeEMsc0NBQXNDO0lBQ3RDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7SUFFL0IsaUJBQWlCLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRTtRQUN0QyxXQUFXLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztJQUNuQyxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUM7QUFUZSwrQkFBdUIsMEJBU3RDLENBQUE7QUFFRCw4REFBOEQ7QUFDOUQsa0JBQWtCO0FBQ2xCLDhEQUE4RDtBQUU5RDtJQUFBO0lBMkVBLENBQUM7SUF6RVUsK0JBQU8sR0FBZCxVQUFlLFNBQVMsRUFBRSxRQUFRO1FBRTlCLElBQUksSUFBSSxHQUFHLGFBQWEsRUFDcEIsV0FBVyxHQUFHO1lBQ04sSUFBSSxFQUFFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHO1lBQ25DLEtBQUssRUFBRSxJQUFJO1NBQ2QsQ0FBQztRQUVWLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsS0FBSyxpQkFBaUI7Z0JBQ2xCLElBQUksR0FBRyxhQUFhLENBQUM7Z0JBQ3pCLEtBQUssQ0FBQztZQUNOLEtBQUssZUFBZTtnQkFDaEIsSUFBSSxHQUFHLGFBQWEsQ0FBQztnQkFDekIsS0FBSyxDQUFDO1lBQ047Z0JBQ0ksSUFBSSxHQUFHLGFBQWEsQ0FBQztRQUM3QixDQUFDO1FBRUQsSUFBSSxZQUFZLEdBQUcsVUFBUyxNQUFNO1lBQzlCLGlEQUFpRDtZQUNqRCxzQ0FBc0M7WUFDdEMsMERBQTBEO1lBRTFELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUM7b0JBQ1YsS0FBSyxFQUFFLDJCQUEyQixHQUFHLFNBQVM7b0JBQzlDLE9BQU8sRUFBRSxNQUFNLENBQUMsS0FBSztvQkFDckIsWUFBWSxFQUFFLElBQUk7aUJBQ3JCLENBQUMsQ0FBQztZQUNQLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFFSixNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNoQixLQUFLLGlCQUFpQjt3QkFDbEIsdUJBQXVCLENBQXFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDOUUsS0FBSyxDQUFDO29CQUNOLEtBQUssZUFBZTt3QkFDaEIscUJBQXFCLENBQXFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDNUUsS0FBSyxDQUFDO29CQUNOLEtBQUssaUJBQWlCO3dCQUN0Qix1QkFBdUI7d0JBQ3ZCLEtBQUssQ0FBQztvQkFDTixLQUFLLGVBQWU7d0JBQ3BCLHVCQUF1Qjt3QkFDdkIsS0FBSyxDQUFDO29CQUNOO3dCQUNBLElBQUksQ0FBQztnQkFDVCxDQUFDO2dCQUVELFFBQVEsRUFBRSxDQUFDO1lBQ2YsQ0FBQztRQUNMLENBQUMsQ0FBQztRQUVGLFFBQVEsQ0FBQyxLQUFLLENBQ1YsWUFBWSxFQUNaLElBQUksRUFDSjtZQUNJLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLE9BQU8sRUFBRSxXQUFXO1NBQ3ZCLENBQ0osQ0FBQyxJQUFJLENBQ0Y7WUFDSSwrREFBK0Q7UUFDbkUsQ0FBQyxFQUNELFVBQVMsWUFBWTtZQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDO2dCQUNWLEtBQUssRUFBRSxzQkFBc0IsR0FBRyxTQUFTO2dCQUN6QyxPQUFPLEVBQUUsWUFBWTtnQkFDckIsWUFBWSxFQUFFLElBQUk7YUFDckIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDOztJQUVMLG9CQUFDO0FBQUQsQ0FBQyxBQTNFRCxJQTJFQztBQTNFWSxxQkFBYSxnQkEyRXpCLENBQUE7QUFFRCxJQUFJLGlCQUFpQixHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7QUFFNUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFO0lBQ3pDLElBQUksQ0FBQztBQUNULENBQUMsQ0FBQyxDQUFDO0FBQ0gsaUJBQWlCLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRTtJQUN2QyxJQUFJLENBQUM7QUFDVCxDQUFDLENBQUMsQ0FBQyJ9