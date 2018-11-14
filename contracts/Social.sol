pragma solidity 0.4.24;

contract Social {
    // Read/write candidate

    struct Person{
    	uint id;
    	string name;
        uint[] following;
        uint followers;
    }

    struct Tweet{
        uint id;
        uint userId;
        string text;
    }

    event signUpEvent(string personName);
    event tweetEvent();
    event followEvent(uint userId,uint senderId);
    Person[] public persons;
    Tweet[] public tweets;

    mapping(address =>uint) public users;
    uint public personcount = 0;
    uint public tweetcount = 0;

    // Constructor
    constructor () public {
        persons.push(Person(1, "Aditya", new uint[](0), 0));
        persons.push(Person(2, "Uday", new uint[](0), 0));
        tweets.push(Tweet(1, 1,"Hello World"));
        tweets.push(Tweet(2, 2,"Bonjour"));
        tweetcount = 2;
    	personcount = 2;
    }

    function addperson(string name) public{
        require(users[msg.sender] == 0, "User already exists");
    	personcount++;
        persons.push(Person(personcount, name, new uint[](0), 0));
        users[msg.sender] = personcount;
        emit signUpEvent(name);
    }
    function addtweet(string text) public{
        tweetcount++;
        tweets.push(Tweet(tweetcount,users[msg.sender],text));
        emit tweetEvent();
    }
    function followUser(uint userId) public{
        persons[userId-1].followers = persons[userId-1].followers + 1;
        persons[users[msg.sender]-1].following.push(userId);
        emit followEvent(userId,users[msg.sender]);
    }
}