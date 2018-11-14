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
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },
  render: function() {
    var socialInstance;
    var loader = $("#loader");
    var content = $("#content");
    var signUpForm = $("#signUpForm");
    loader.show();
    content.hide();
    signUpForm.hide();

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
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      for (var i = 0; i < personcount; i++) {
        socialInstance.persons(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          //var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>";
          candidatesResults.append(candidateTemplate);
        });
      }
      return socialInstance.users(App.account);
    }).then(function(hasSignedUp) {
      console.log(hasSignedUp);
      console.log("aaa");
      if(!hasSignedUp.c[0]){
        signUpForm.show();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },
  castVote: function() {
    var candidateId = $('#name').val();
    console.log("Castvote")
    App.contracts.Social.deployed().then(function(instance) {
      return instance.addperson(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      console.log("sucess");
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.log(err);
    });
  }
};
$(function() {
  $(window).load(function() {
    App.init();
  });
});
