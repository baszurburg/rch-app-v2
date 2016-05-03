﻿import observable = require("data/observable");
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
import programmaModel = require("../../../shared/models/programma/programma");
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
    
    page.bindingContext = programmaViewModel;
    
}

export function backTap(args: gestures.GestureEventData) {
    frame.topmost().goBack();
}

export function backSwipe(args: gestures.SwipeGestureEventData) {
    if (args.direction === gestures.SwipeDirection.right) {
        frame.topmost().goBack();
    }
}

export function selectProgrammaDetails(args: listView.ItemEventData) {
    var programmaItem = <programmaModel.ProgrammaModel>args.view.bindingContext;
    var page = view.getAncestor(<view.View>args.object, "Page")

    console.log("In selectProgrammaDetails: " + programmaItem);

    frame.topmost().navigate({
        moduleName: "views/wedstrijden/details/details-page",
        context: programmaItem
    });

}

////////////////////////////
// MODELS
////////////////////////////
interface ProgrammaCategory {
    Id: string;
    title: string;
}

var programmaCategories: Array<ProgrammaCategory> = [
    { title: "R.C.H. Thuis", Id: '0' },
    { title: "R.C.H. Uit", Id: '1' },
    { title: "R.C.H. Toernooien", Id: '2' }
];

var programmaThuisItems: Array<programmaModel.ProgrammaModel> = new Array<programmaModel.ProgrammaModel>();
var programmaUitItems: Array<programmaModel.ProgrammaModel> = new Array<programmaModel.ProgrammaModel>();

export class ProgrammaViewModel extends observable.Observable {
    private _selectedProgrammaIndex;
    private _programmaT: Array<programmaModel.ProgrammaModel>;
    private _programmaU: Array<programmaModel.ProgrammaModel>;

    constructor() {
        super();

        this.selectedProgrammaIndex = 0;
        this.set("isProgrammaLoading", true);
    }
    
    get programmaThuis(): Array<programmaModel.ProgrammaModel> {
        return this._programmaT;
    }
    get programmaUit(): Array<programmaModel.ProgrammaModel> {
        return this._programmaU;
    }

    get selectedProgrammaIndex(): number {
        return this._selectedProgrammaIndex;
    }
    
   // SELECT PROGRAMMA CATEGORY
    set selectedProgrammaIndex(value: number) {
        if (this._selectedProgrammaIndex !== value) {
            this._selectedProgrammaIndex = value;
            this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedProgrammaIndex", value: value });

            this.set("programmaHeader", programmaCategories[value].title);
        }
    }
    
    public onProgrammaThuisDataLoaded() {
        // console.log("onProgrammaThuisDataLoaded");
        this.set("isProgrammaLoading", false);
        this._programmaT = programmaThuisItems;
        
        //console.log("_programmaT: " + this._programmaT.length + this._programmaT);
        
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "programmaThuisItems", value: this._programmaT });
    }
     
    public onProgrammaUitDataLoaded() {
        // console.log("onProgrammaThuisDataLoaded");
        this.set("isProgrammaLoading", false);
        this._programmaU = programmaUitItems;
        
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "programmaUitItems", value: this._programmaU });
    }   
}

var programmaViewModel = new ProgrammaViewModel;

function pushprogrammaThuisItems(itemsFromFirebase: Array<programmaModel.Programma>) {

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
        } else {
            programmaItem.newDate = true;
        }

        dateMinusOne = programmaItem.Datum;
        programmaThuisItems.push(programmaItem);
    }

    programmaViewModel.onProgrammaThuisDataLoaded();
}

function pushprogrammaUitItems(itemsFromFirebase: Array<programmaModel.Programma>) {

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
        }else {
            programmaItem.newDate = true;
        }

        dateMinusOne = programmaItem.Datum;
        
        programmaUitItems.push(programmaItem);
    }

    programmaViewModel.onProgrammaUitDataLoaded();
}

export function refreshProgrammaThuisList(args) {

    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;
    
   firebaseViewModel.doQuery('programma-thuis', function() {
        pullRefresh.refreshing = false;
    });
        
}

export function refreshProgrammaUitList(args) {

    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;
    
   firebaseViewModel.doQuery('programma-uit', function() {
        pullRefresh.refreshing = false;
    });
        
}

// -----------------------------------------------------------
//  FIREBASE MODEL
// -----------------------------------------------------------

export class FirebaseModel {

    public doQuery(typeQuery, callback) {
    
        var path = "/programmaT",
            orderByRule = {
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
                    case "programma-thuis":
                        pushprogrammaThuisItems(<Array<programmaModel.ProgrammaModel>>result.value);
                    break;
                    case "programma-uit":
                        pushprogrammaUitItems(<Array<programmaModel.ProgrammaModel>>result.value);
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

firebaseViewModel.doQuery('programma-thuis', function() {
    null;
});
firebaseViewModel.doQuery('programma-uit', function() {
    null;
});