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

      return App.render();
    });
  },

  render: function() {
    var socialInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

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

      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
