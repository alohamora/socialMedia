pragma solidity 0.4.24;

contract Social {
    // Read/write candidate

    struct Person{
    	uint id;
    	string name;
    }

    mapping(uint => Person) public persons;
    uint public personcount;

    // Constructor
    constructor () public {
        persons[0] = Person(0, "Aditya");
    	personcount=1;
    }

    function addperson(string name) private{
        persons[personcount] = Person(personcount, name);
    	personcount ++;
    }
}