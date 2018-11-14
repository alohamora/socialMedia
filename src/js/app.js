App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Social.json", function(social) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Social = TruffleContract(social);
      // Connect provider to interact with contract
      App.contracts.Social.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    });
  },
  listenForEvents: function() {
    App.contracts.Social.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.signUpEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when user signs up
        App.addUser(instance);
      });
      
      instance.tweetEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new tweet is posted
        App.addTweet(instance);
      });
      instance.followEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new tweet is posted
        // App.addTweet(instance);
        App.hideFollowButton(event.args.userId.c[0],event.args.senderId);
      });
    });
  },

  render: function() {
    var socialInstance;
    App.switchViews(2);
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Social.deployed().then(function(instance) {
      socialInstance = instance;
      return socialInstance.personcount();
    }).then(function(personcount) {
      App.showUsers(socialInstance,personcount);
      return socialInstance.tweetcount();
    }).then(function(tweetcount) {
      // console.log("Aa",tweetcount)
      App.showTweets(socialInstance,tweetcount);
      return socialInstance.users(App.account);
    }).then(function(hasSignedUp) {
      if(!hasSignedUp.c[0]) App.switchViews(0);
      else  App.switchViews(1);
    }).catch(function(error) {
      console.warn(error);
    });
  },
  showUsers: function(socialInstance,personcount){
    var userNames = $("#userNames");
    userNames.empty();
    console.log(userNames);
    for (var i = 0; i < personcount; i++) {
      socialInstance.persons(i).then(function(candidate) {
        var id = candidate[0];
        var name = candidate[1];
        var candidateTemplate = "<tr><td>" + id + "</td><td>" + name + "</td>" + "<td id=row"+id+ ">" + candidate[2] + "</td>" + "<td><form id = " + id +  " onSubmit='App.follow(" + id + "); return false;'><input type='submit' value='Follow'></form></td></tr>";
        userNames.append(candidateTemplate);
        console.log("addfd")
      });
    }
  },
  addUser: function(socialInstance){
    var userTbody = document.getElementById('userNames');
    var personcount;
    console.log(userTbody.childNodes.length)
    console.log(userTbody.childNodes)
    socialInstance.personcount().then(function(pcount){
      personcount = pcount;
      return socialInstance.persons(pcount-1)
    }).then(function(candidate){
      if(userTbody.childNodes.length < personcount ){
        var id = candidate[0];
        var name = candidate[1];
        var candidateTemplate = "<tr><td>" + id + "</td><td>" + name + "</td>" + "<td>" + candidate[2] + "</td>" + "<td><form id = " + id +  " onSubmit='App.follow(" + id + "); return false;'><input type='submit' value='Follow'></form></td></tr>";
        $('#userNames').append(candidateTemplate);
      }
      return 1
    }).then(function(flag){
      App.switchViews(flag);
    });
  },
  showTweets: function(socialInstance,tweetcount){
    var userTweets = $("#userTweets");
    userTweets.empty();

    for (var i = 0; i < tweetcount; i++) {
      socialInstance.tweets(i).then(function(tweet) {
        var id = tweet[0];
        var name = tweet[2];
        var tweetTemplate = "<tr><td>" + id + "</td><td>" + name + "</td></tr>";
        userTweets.append(tweetTemplate);
      });
    }
  },
  addTweet: function(socialInstance){
    var userTweets = document.getElementById('userTweets');
    var tcount;
    console.log(userTweets.childNodes)
    socialInstance.tweetcount().then(function(tweetcount){
      tcount = tweetcount.c[0];
      console.log(tcount);
      return socialInstance.tweets(tweetcount-1)
    }).then(function(tweet){
      if(userTweets.childNodes.length < tcount){
        var id = tweet[0];
        var name = tweet[2];
        var tweetTemplate = "<tr><td>" + id + "</td><td>" + name + "</td></tr>";
        $('#userTweets').append(tweetTemplate);
      }
      return 1;
    }).then(function(flag){
      App.switchViews(flag);
    });
  },
  signUp: function() {
    var username = $('#name').val();
    App.contracts.Social.deployed().then(function(instance) {
      return instance.addperson(username, { from: App.account });
    }).then(function(result) {
      // Wait for user to signup
      App.switchViews(2);
    }).catch(function(err) {
      console.log(err);
    });
  },
  tweet: function(){
    var text = $('#tweet').val();
    App.contracts.Social.deployed().then(function(instance) {
      return instance.addtweet(text, { from: App.account });
    }).then(function(result) {
      App.switchViews(2);
    }).catch(function(err){
      console.log(err);
    });
  },
  follow: function(userId){
    App.contracts.Social.deployed().then(function(instance) {
      console.log('aadfd',userId)
      return instance.followUser(parseInt(userId), { from: App.account });
    }).then(function(result) {
      App.switchViews(2);
    }).catch(function(err){
      console.log(err);
    });
  },
  hideFollowButton: function(id,id2){
    var idstring = "row" + id;
    App.contracts.Social.deployed().then(function(instance) {
      return instance.persons(parseInt(id)-1,{ from: App.account });
    }).then(function(result) {
      console.log(document.getElementById(idstring))
      document.getElementById(idstring).innerHTML = result[2];
      idstring = "#"+id;
      console.log(id2)
      if(id2==App.account){
        $(idstring).hide();
      }
      App.switchViews(1);
    }).catch(function(err){
      console.log(err);
    });
  },
  switchViews: function(flag){
    var loader = $("#loader");
    var content = $("#content");
    var signUpForm = $("#signUpForm");
    var tweetForm = $("#tweetForm");
    loader.show();
    content.hide();
    signUpForm.hide();
    tweetForm.hide();
    if(flag==1){
      loader.hide();
      content.show();
      tweetForm.show();
    }     
    else if(flag==0){
      loader.hide();
      signUpForm.show();
      content.hide();
    }
  }
};
$(function() {
  $(window).load(function() {
    App.init();
  });
});
