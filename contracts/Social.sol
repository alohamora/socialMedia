pragma solidity 0.4.24;

contract Social {
    // Read/write candidate

    struct Person{
    	uint id;
    	string name;
    }
    event signUpEvent(string personName);
    Person[] public persons;
    mapping(address =>uint) public users;
    uint public personcount;

    // Constructor
    constructor () public {
        persons.push(Person(0, "Aditya"));
        persons.push(Person(1, "Uday"));
    	personcount=2;
    }

    function addperson(string name) public{
        require(users[msg.sender] == 0, "User already exists");
        persons.push(Person(personcount, name));
    	personcount ++;
        users[msg.sender] = 1;
        emit signUpEvent(name);
    }
}