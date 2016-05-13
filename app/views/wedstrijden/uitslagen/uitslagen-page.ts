import observable = require("data/observable");
import pages = require("ui/page");
import gestures = require("ui/gestures");
import label = require("ui/label");
import listView = require("ui/list-view");
import dialogs = require("ui/dialogs");
import utils = require("utils/utils");
import frame = require("ui/frame");
import view = require("ui/core/view");
import platform = require("platform");
import scrollView = require("ui/scroll-view");
import imageSource = require("image-source");
import uitslagenModel = require("../../../shared/models/uitslagen/uitslagen");

//import appViewModel = require("../../../shared/view-models/app-view-model");
import firebase = require("nativescript-plugin-firebase");

export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    
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

export function backTap(args: gestures.GestureEventData) {
    frame.topmost().goBack();
}

export function backSwipe(args: gestures.SwipeGestureEventData) {
    if (args.direction === gestures.SwipeDirection.right) {
        frame.topmost().goBack();
    }
}

export function selectUitslagenDetails(args: listView.ItemEventData) {
    var uitslagenItem = <uitslagenModel.UitslagModel>args.view.bindingContext;
    var page = view.getAncestor(<view.View>args.object, "Page")

    console.log("In selectUitslagenDetails: " + uitslagenItem);

    frame.topmost().navigate({
        moduleName: "views/wedstrijden/details/details-page",
        context: uitslagenItem
    });

}


////////////////////////////
// MODELS
////////////////////////////
interface UitslagenCategory {
    Id: string;
    title: string;
}

var uitslagenCategories: Array<UitslagenCategory> = [
    { title: "R.C.H. Thuis", Id: '0' },
    { title: "R.C.H. Uit", Id: '1' }
];

var uitslagenThuisItems: Array<uitslagenModel.UitslagModel> = new Array<uitslagenModel.UitslagModel>();
var uitslagenUitItems: Array<uitslagenModel.UitslagModel> = new Array<uitslagenModel.UitslagModel>();

export class UitslagenViewModel extends observable.Observable {
    private _selectedUitslagenIndex;
    private _uitslagenT: Array<uitslagenModel.UitslagModel>;
    private _uitslagenU: Array<uitslagenModel.UitslagModel>;

    constructor() {
        super();

        this.selectedUitslagenIndex = 0;
        this.set("isUitslagenLoading", true);
    }
    
    get uitslagenThuis(): Array<uitslagenModel.UitslagModel> {
        return this._uitslagenT;
    }
    get uitslagenUit(): Array<uitslagenModel.UitslagModel> {
        return this._uitslagenU;
    }

    get selectedUitslagenIndex(): number {
        return this._selectedUitslagenIndex;
    }
    
   // SELECT uitslagen CATEGORY
    set selectedUitslagenIndex(value: number) {
        if (this._selectedUitslagenIndex !== value) {
            this._selectedUitslagenIndex = value;
            this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedUitslagenIndex", value: value });

            this.set("uitslagenHeader", uitslagenCategories[value].title);
        }
    }
    
    public onUitslagenThuisDataLoaded() {
        // console.log("onUitslagenThuisDataLoaded");
        this.set("isUitslagenLoading", false);
        this._uitslagenT = uitslagenThuisItems;
        
        //console.log("_uitslagenT: " + this._uitslagenT.length + this._uitslagenT);
        
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "uitslagenThuisItems", value: this._uitslagenT });
    }
     
    public onUitslagenUitDataLoaded() {
        // console.log("onUitslagenThuisDataLoaded");
        this.set("isUitslagenLoading", false);
        this._uitslagenU = uitslagenUitItems;
        
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "uitslagenUitItems", value: this._uitslagenU });
    }   
}

var uitslagenViewModel = new UitslagenViewModel;

function pushuitslagenThuisItems(itemsFromFirebase: Array<uitslagenModel.Uitslag>) {

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
        } else {
            uitslagenItem.newDate = true;
        }

        dateMinusOne = uitslagenItem.Datum;
        uitslagenThuisItems.push(uitslagenItem);
    }

    uitslagenViewModel.onUitslagenThuisDataLoaded();
}

function pushuitslagenUitItems(itemsFromFirebase: Array<uitslagenModel.Uitslag>) {

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
        }else {
            uitslagenItem.newDate = true;
        }

        dateMinusOne = uitslagenItem.Datum;
        
        uitslagenUitItems.push(uitslagenItem);
    }

    uitslagenViewModel.onUitslagenUitDataLoaded();
}

export function refreshUitslagenThuisList(args) {

    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;
    
   firebaseViewModel.doQuery('uitslagen-thuis', function() {
        pullRefresh.refreshing = false;
    });
        
}

export function refreshUitslagenUitList(args) {

    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;
    
   firebaseViewModel.doQuery('uitslagen-uit', function() {
        pullRefresh.refreshing = false;
    });
        
}

// -----------------------------------------------------------
//  FIREBASE MODEL
// -----------------------------------------------------------

export class FirebaseModel {

    public doQuery(typeQuery, callback) {
    
        var path = "/uitslagenT",
            orderByRule = {
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
        
        var onValueEvent = function(result) {
            // note that the query returns 1 match at a time,
            // in the order specified in the query
            // console.log("Query result: " + JSON.stringify(result));

            if (result.error) {
                dialogs.alert({
                    title: "Fout downloaden gegevens " + typeQuery,
                    message: result.error,
                    okButtonText: "OK"
                });
            } else {
                
                switch (typeQuery) {
                    case "uitslagen-thuis":
                        pushuitslagenThuisItems(<Array<uitslagenModel.UitslagModel>>result.value);
                    break;
                    case "uitslagen-uit":
                        pushuitslagenUitItems(<Array<uitslagenModel.UitslagModel>>result.value);
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

        firebase.query(
            onValueEvent,
            path,
            {
                singleEvent: true,
                orderBy: orderByRule
            }
        ).then(
            function() {
                // console.log("firebase.doQueryPosts done; added a listener");
            },
            function(errorMessage) {
                dialogs.alert({
                    title: "Fout lezen gegevens " + typeQuery,
                    message: errorMessage,
                    okButtonText: "OK"
                });
            });
    };

}

var firebaseViewModel = new FirebaseModel();

firebaseViewModel.doQuery('uitslagen-thuis', function() {
    null;
});
firebaseViewModel.doQuery('uitslagen-uit', function() {
    null;
});