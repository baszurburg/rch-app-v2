var observable = require("data/observable");
var dialogs = require("ui/dialogs");
import appModule = require("application");
var firebase = require("nativescript-plugin-firebase");


// MODELS

export interface Speaker {
    //Id: string;
    name: string;
    title: string;
    company: string;
    picture: string;
    twitterName: string;
}

export interface RoomInfo {
    roomId: string;
    name: string;
    url: string;
    theme: string;
}

export interface Session {
    Id: string;
    title: string;
    start: Date;
    end: Date;
    room: string;
    roomInfo: RoomInfo;
    speakers: Array<Speaker>;
    description: string;
    descriptionShort: string;
    calendarEventId: string;
    isBreak: boolean;
}



// INIT

  FirebaseModel.prototype.doInit = function () {
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

  FirebaseModel.prototype.doLoginAnonymously = function () {
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

  FirebaseModel.prototype.doCreateUser = function () {
    firebase.createUser({
      email: 'eddyverbruggen@gmail.com',
      password: 'firebase'
    }).then(
        function (result) {
          dialogs.alert({
            title: "User created",
            message: "userId: " + result.key,
            okButtonText: "Nice!"
          });
        },
        function (errorMessage) {
          dialogs.alert({
            title: "No user created",
            message: errorMessage,
            okButtonText: "OK, got it"
          });
        }
    );
  };

  FirebaseModel.prototype.doLoginByPassword = function () {
    firebase.login({
      // note that you need to enable email-password login in your firebase instance
      type: firebase.LoginType.PASSWORD,
      // note that these credentials have been configured in our firebase instance
      email: 'eddyverbruggen@gmail.com',
      password: 'firebase'
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

  FirebaseModel.prototype.doLogout = function () {
    firebase.logout().then(
        function (result) {
          dialogs.alert({
            title: "Logout OK",
            okButtonText: "OK, bye!"
          });
        },
        function (error) {
          dialogs.alert({
            title: "Logout error",
            message: error,
            okButtonText: "Hmmkay"
          });
        }
    );
  };


// EVENT LISTENERS

  FirebaseModel.prototype.doAddChildEventListenerForUsers = function () {
    var that = this;
    var onChildEvent = function(result) {
      that.set("path", '/users');
      that.set("type", result.type);
      that.set("key", result.key);
      that.set("value", JSON.stringify(result.value));
    };

    firebase.addChildEventListener(onChildEvent, "/users").then(
        function () {
          console.log("firebase.addChildEventListener added");
        },
        function (error) {
          console.log("firebase.addChildEventListener error: " + error);
        }
    );
  };

  FirebaseModel.prototype.doAddValueEventListenerForCompanies = function () {
    var path = "/companies";
    var that = this;
    var onValueEvent = function(result) {
      if (result.error) {
          dialogs.alert({
            title: "Listener error",
            message: result.error,
            okButtonText: "Darn!"
          });
      } else {
        that.set("path", path);
        that.set("type", result.type);
        that.set("key", result.key);
        that.set("value", JSON.stringify(result.value));
      }
    };

   firebase.addValueEventListener(onValueEvent, path).then(
        function () {
          console.log("firebase.addValueEventListener added");
        },
        function (error) {
          console.log("firebase.addValueEventListener error: " + error);
        }
    );
  };

// DATBASE ACTIONS

  FirebaseModel.prototype.doUserStoreByPush = function () {
    firebase.push(
        '/users',
        {
          'first': 'Eddy',
          'last': 'Verbruggen',
          'birthYear': 1977,
          'isMale': true,
          'address': {
            'street': 'foostreet',
            'number': 123
          }
        }
    ).then(
        function (result) {
          console.log("firebase.push done, created key: " + result.key);
        },
        function (error) {
          console.log("firebase.push error: " + error);
        }
    );
  };

  FirebaseModel.prototype.doStoreCompaniesBySetValue = function () {
    firebase.setValue(
        '/companies',

        // you can store a JSON object
        //{'foo':'bar'}

        // or even an array of JSON objects
        [
          {
            name: 'Telerik',
            country: 'Bulgaria'
          },
          {
            name: 'Google',
            country: 'USA'
          }
        ]
    ).then(
        function () {
          console.log("firebase.setValue done");
        },
        function (error) {
          console.log("firebase.setValue error: " + error);
        }
    );
  };

  FirebaseModel.prototype.doRemoveUsers = function () {
    firebase.remove("/users").then(
        function () {
          console.log("firebase.remove done");
        },
        function (error) {
          console.log("firebase.remove error: " + error);
        }
    );
  };

  FirebaseModel.prototype.doRemoveCompanies = function () {
    firebase.remove("/companies").then(
        function () {
          console.log("firebase.remove done");
        },
        function (error) {
          console.log("firebase.remove error: " + error);
        }
    );
  };

  FirebaseModel.prototype.doQueryBulgarianCompanies = function () {
    var path = "/companies";
    var that = this;
    var onValueEvent = function(result) {
      // note that the query returns 1 match at a time,
      // in the order specified in the query
      console.log("Query result: " + JSON.stringify(result));
      if (result.error) {
          dialogs.alert({
            title: "Listener error",
            message: result.error,
            okButtonText: "Darn!"
          });
      } else {
        that.set("path", path);
        that.set("type", result.type);
        that.set("key", result.key);
        that.set("value", JSON.stringify(result.value));
      }
    };
    firebase.query(
      onValueEvent,
      path,
      {
        // order by company.country
        orderBy: {
          type: firebase.QueryOrderByType.CHILD,
          value: 'country' // mandatory when type is 'child'
        },
        // but only companies named 'Telerik'
        // (this range relates to the orderBy clause)
        range: {
          type: firebase.QueryRangeType.EQUAL_TO,
          value: 'Bulgaria'
        },
        // only the first 2 matches (not that there's only 1 in this case anyway)
        limit: {
          type: firebase.QueryLimitType.LAST,
          value: 2
        }
      }
    ).then(
      function () {
        console.log("firebase.doQueryBulgarianCompanies done; added a listener");
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

  FirebaseModel.prototype.doQueryUsers = function () {
    var path = "/users";
    var that = this;
    var onValueEvent = function(result) {
      // note that the query returns 1 match at a time,
      // in the order specified in the query
      console.log("Query result: " + JSON.stringify(result));
      if (result.error) {
          dialogs.alert({
            title: "Listener error",
            message: result.error,
            okButtonText: "Darn!!"
          });
      } else {
        that.set("path", path);
        that.set("type", result.type);
        that.set("key", result.key);
        that.set("value", JSON.stringify(result.value));
      }
    };
    firebase.query(
      onValueEvent,
      path,
      {
        singleEvent: true,
        orderBy: {
          type: firebase.QueryOrderByType.KEY
        }
      }
    ).then(
      function () {
        console.log("firebase.doQueryUsers done; added a listener");
      },
      function (errorMessage) {
        dialogs.alert({
          title: "Login error",
          message: errorMessage,
          okButtonText: "OK, pity!"
        });
      }
    );
  };


  // FROM HERE ARE THE RCH FUNCTIONS

  FirebaseModel.prototype.doQueryPosts = function () {
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
        that.set("path", path);
        that.set("type", result.type);
        that.set("key", result.key);
        that.set("value", JSON.stringify(result.value));
        
        //
        
        that.set("path", path);
        that.set("type", result.type);
        that.set("key", result.key);
        that.set("value", JSON.stringify(result.value));
        
        console.log("path: " + path);
        console.log("type: " + result.type);
        console.log("key: " + result.key);
        console.log("value: " + JSON.stringify(result.value));
        
      }
    };
    firebase.query(
      onValueEvent,
      path,
      {
        singleEvent: true,
        orderBy: {
          type: firebase.QueryOrderByType.KEY
        }
      }
    ).then(
      function () {
        console.log("firebase.doQueryPosts done; added a listener");
      },
      function (errorMessage) {
        dialogs.alert({
          title: "Login error",
          message: errorMessage,
          okButtonText: "OK, pity!"
        });
      }
    );
  };



export var FirebaseModel = FirebaseModel;
export var firebaseViewModel = new FirebaseModel();
