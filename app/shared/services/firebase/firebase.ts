import firebase = require("nativescript-plugin-firebase");

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
          console.log("Firebase is ready");
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
          console.log(JSON.stringify(result));
        },
        function (errorMessage) {
          console.log("Login error");
        }
    );
  };

  public doCreateUser = function () {
    firebase.createUser({
      email: 'eddyverbruggen@gmail.com',
      password: 'firebase'
    }).then(
        function (result) {
          console.log("User created");
        },
        function (errorMessage) {
          console.log("No user created");
        }
    );
  };

  public doLoginByPassword = function () {
    firebase.login({
      // note that you need to enable email-password login in your firebase instance
      type: firebase.LoginType.PASSWORD,
      // note that these credentials have been configured in our firebase instance
      email: 'eddyverbruggen@gmail.com',
      password: 'firebase'
    }).then(
        function (result) {
          console.log("Login OK");
        },
        function (errorMessage) {
          console.log("Login error");
        }
    );
  };

  public doLogout = function () {
    firebase.logout().then(
        function (result) {
          console.log("Logout OK");
        },
        function (error) {
          console.log("Logout error: " + error);
        }
    );
  };


// EVENT LISTENERS

  public doAddChildEventListenerForUsers = function () {
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

  public doAddValueEventListenerForCompanies = function () {
    var path = "/companies";
    var that = this;
    var onValueEvent = function(result) {
      if (result.error) {
          console.log("Listener error: " + result.error);
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

  public doUserStoreByPush = function () {
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

  public doStoreCompaniesBySetValue = function () {
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

  public doRemoveUsers = function () {
    firebase.remove("/users").then(
        function () {
          console.log("firebase.remove done");
        },
        function (error) {
          console.log("firebase.remove error: " + error);
        }
    );
  };

  public doRemoveCompanies = function () {
    firebase.remove("/companies").then(
        function () {
          console.log("firebase.remove done");
        },
        function (error) {
          console.log("firebase.remove error: " + error);
        }
    );
  };

  public doQueryBulgarianCompanies = function () {
    var path = "/companies";
    var that = this;
    var onValueEvent = function(result) {
      // note that the query returns 1 match at a time,
      // in the order specified in the query
      console.log("Query result: " + JSON.stringify(result));
      if (result.error) {
          console.log("Listener error: " + result.error);
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
        console.log("Login error: " + errorMessage);
      }
    );
  };

  public doQueryUsers = function () {
    var path = "/users";
    var that = this;
    var onValueEvent = function(result) {
      // note that the query returns 1 match at a time,
      // in the order specified in the query
      console.log("Query result: " + JSON.stringify(result));
      if (result.error) {
          console.log("Listener error: " + result.error);
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
        console.log("Login error: " + errorMessage);
      }
    );
  };

  // FROM HERE ARE THE RCH FIREBASE FUNCTIONS

public doQueryPosts = function () {
    var path = "/posts";
    var that = this;
    var onValueEvent = function(result) {
      // note that the query returns 1 match at a time,
      // in the order specified in the query
      //console.log("Query result: " + JSON.stringify(result));
      if (result.error) {
          console.log("Listener error: " + result.error);
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
        // orderBy: {
        //   type: firebase.QueryOrderByType.KEY
        // }
        orderBy: {
          type: firebase.QueryOrderByType.VALUE,
          value: 'publishedDate' // mandatory when type is 'child'
        },
      }
    ).then(
      function () {
        // console.log("firebase.doQueryPosts done; added a listener");
      },
      function (errorMessage) {
        console.log("Fout lezen gegevens: " + errorMessage);
      }
    );
  };


  public doPostInit = function () {
    firebase.init({
      url: 'https://intense-heat-7311.firebaseio.com/'
    }).then(
        function (result) {
            console.log('in postInit');
            this.doQueryPosts()
        },
        function (error) {
          console.log("firebase.init error: " + error);
        }
    );
  };

}