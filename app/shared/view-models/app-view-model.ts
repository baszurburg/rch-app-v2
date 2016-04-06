import observable = require("data/observable");
import dialogs = require("ui/dialogs");
import view = require("ui/core/view");
import localSettings = require("application-settings");
import platform = require("platform");
import appModule = require("application");
import types = require("utils/types");
import firebase = require("nativescript-plugin-firebase");

var LOADING_ERROR = "Could not load latest news. Check your Internet connection and try again.";

interface NewsCategory {
    Id: string;
    title: string;
}

var newsCategories: Array<NewsCategory> = [
    { title: "Algemeen nieuws", Id: '56d61c723d4aaadc196caa4f' },
    { title: "Jeugd nieuws", Id: '56d61c893d4aaadc196caa50' },
    { title: "Verslagen", Id: '56d61c943d4aaadc196caa51' }
];

export class AppViewModel extends observable.Observable {
    private _selectedNewsIndex;
    private _posts: Array<PostModel>;

    public selectedViewIndex: number;

    constructor() {
        super();

        this.selectedNewsIndex = 0;
        this.selectedViewIndex = 5;
        this.set("actionBarTitle", "Thuis");
        this.set("isNewsLoading", true);
        this.set("isNewsPage", false);
        
    }

    get posts(): Array<PostModel> {
        return this._posts;
    }

    get selectedNewsIndex(): number {
        return this._selectedNewsIndex;
    }
    
    set selectedNewsIndex(value: number) {
        if (this._selectedNewsIndex !== value) {
            this._selectedNewsIndex = value;
            this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedNewsIndex", value: value });

            this.set("newsHeader", newsCategories[value].title);

            // console.log('selectedNewsIndex: ' + value);
            if (typeof posts === 'object') {
                 this.filterNews();
            }

        }
    }

    private filterNews() {
        console.log('In filterNews');
        console.log(typeof posts);
        this._posts = posts.filter(s=> {
            return s.categories[0] === newsCategories[this.selectedNewsIndex].Id;
        });

        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "posts", value: this._posts });
    }

    public onNewsDataLoaded() {
        this.set("isNewsLoading", false);
        console.log('Newsdata loaded');

        this.filterNews();
    }

    public selectView(index: number, titleText: string) {
        this.selectedViewIndex = index;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedViewIndex", value: this.selectedViewIndex });
        this.set("actionBarTitle", titleText);
        this.set("isNewsPage", this.selectedViewIndex === 10);
    }
    
}

export var appModel = new AppViewModel();

function pushPosts(postsFromFirebase: Array<Post>) {
    // console.log('postsFromFirebase.length: ' + postsFromFirebase.length);
    for (var i = 0; i < postsFromFirebase.length; i++) {
        var newPost = new PostModel(postsFromFirebase[i]);
        posts.push(newPost);
        //console.log('posts.push')
    }
}

function doQueryPosts () {
    var path = "/posts";
    var that = this;
    var onValueEvent = function(result) {
      // note that the query returns 1 match at a time,
      // in the order specified in the query
      //console.log("Query result: " + JSON.stringify(result));
      if (result.error) {
          dialogs.alert({
            title: "Listener error",
            message: result.error,
            okButtonText: "Darn!!"
          });
      } else {

        pushPosts(<Array<Post>> result.value);
        
        appModel.onNewsDataLoaded();
        
      }
    };
    firebase.query(
      onValueEvent,
      path,
      {
        singleEvent: true,
        orderBy: {
          type: firebase.QueryOrderByType.CHILD,
          value: 'publishedDate'
        }
      }
    ).then(
      function () {
        // console.log("firebase.doQueryPosts done; added a listener");
      },
      function (errorMessage) {
        dialogs.alert({
          title: "Fout lezen gegevens",
          message: errorMessage,
          okButtonText: "OK"
        });
      }
    );
  };

// -----------------------------------------------------------
//  FIREBASE MODEL
// -----------------------------------------------------------

export class FirebaseModel {


// INIT

  public doInit = function () {
    firebase.init({
      url: 'https://intense-heat-7311.firebaseio.com/'
    }).then(
        function (result) {
          dialogs.alert({
            title: "Firebase is ready",
            okButtonText: "Merci!"
          });
        },
        function (error) {
          console.log("firebase.init error: " + error);
        }
    );
  };

// LOGIN & USER AUTHENTICATION

  public doLoginAnonymously = function () {
    firebase.login({
      type: firebase.LoginType.ANONYMOUS
    }).then(
        function (result) {
          dialogs.alert({
            title: "Login OK",
            message: JSON.stringify(result),
            okButtonText: "Nice!"
          });
        },
        function (errorMessage) {
          dialogs.alert({
            title: "Login error",
            message: errorMessage,
            okButtonText: "OK, pity"
          });
        }
    );
  };

  // FROM HERE ARE THE RCH FUNCTIONS


  public doPostInit = function () {
    firebase.init({
      url: 'https://intense-heat-7311.firebaseio.com/'
    }).then(
        function (result) {
            console.log('in postInit');
            doQueryPosts();
        },
        function (error) {
          console.log("firebase.init error: " + error);
        }
    );
  };



}


////////////////////////////
// MODELS
////////////////////////////

// -----------------------------------------------------------
//  POST MODEL
// -----------------------------------------------------------



interface Image {
    format: string;
    height: number;
    imageThumb: string;
    public_id: string;
    resource_type: string;
    secure_url: string;
    siganture: string;
    url: string;
    version: number;
    width: number;
}

export interface Content {
    brief: string;
    extended: string;
}

export interface Post {
    _id: string;
    categories: Array<string>;
    content: Content;
    externalLink: string;
    externalName: string;
    image: Image;
    locked: boolean;
    name: string;
    publishedDate: Date;
    state: string;
}

var posts: Array<PostModel> = new Array<PostModel>();

export class PostModel extends observable.Observable implements Post {
    constructor(source?: Post) {
        super();

        if (source) {
            this.__id = source._id;
            this._categories = source.categories;
            this._content = source.content;
            this._externalLink = source.externalLink;
            this._externalName = source.externalName;
            this._image = source.image;
            this._locked = source.locked;
            this._name = source.name;
            this._publishedDate = source.publishedDate;
            this._state = source.state;
        }
    }

    private fixDate(date: Date): Date {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }

    private __id: string;
    private _categories: Array<string>;
    private _content: Content;
    private _externalLink: string;
    private _externalName: string;
    private _image: Image;
    private _locked: boolean;
    private _name: string;
    private _publishedDate: Date;
    private _state: string;

    get _id(): string {
        return this.__id;
    }
    
    get categories(): Array<string> {
        return this._categories;
    }
    
    get content(): Content {
        return this._content;
    }

    get externalLink(): string {
        return this._externalLink;
    }

    get externalName(): string {
        return this._externalName;
    }

    get image(): Image {
        return this._image
    }

    get locked(): boolean {
        return this._locked;
    }

    get name(): string {
        return this._name;
    }

    get publishedDate(): Date {
        return this._publishedDate;
    }

    get state(): string {
        return this._state;
    }

}

export var firebaseViewModel = new FirebaseModel();

firebaseViewModel.doPostInit();