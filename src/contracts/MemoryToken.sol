pragma solidity ^0.5.0;

import "./ERC721Full.sol";

contract MemoryToken{
    uint public initialBalance = 100 ether;
    address payable[2]  _playerAddress;
    uint8 _firstPlayer;
    uint32 _turnLength ;
    uint8  _p1Commitment;
    uint8 _p2Nonce;
    uint8 [] _index = new uint8[](0);
    uint8 [] _indexs = new uint8[](0);
    uint8 [] _status = new uint8[](0);
    uint8 [25][25] _board;
    uint8 _currentPlayer;
    address payable winnerAddress;
    uint256 _turnDeadline;

    bool isMatch;
    bool isStart;
    uint _fee;
    uint _bonus;
    bool isOver;
    bool isJoin;
    uint256 matchNum;
    uint cnt;
    bool isPlayer0WantDes;
    bool isPlayer1WantDes;
    bool playLock;
    bool isRoomCreate;

    uint8 tmp1;
    uint8 tmp2;
    uint8 tmp3;
    uint8 tmp4;
 

    constructor ()  public {
        winnerAddress = address(0);
        _playerAddress[0] = address(0);
        _playerAddress[1] = address(0);
        isMatch = false;
        isOver = false;
        isStart = false;
        _fee = 3 ether;
        _bonus = 5 ether;
        _turnLength = 5;
        matchNum = 0;
        _currentPlayer = 1;
        cnt = 0;
        _p1Commitment = 0;
        _p2Nonce = 0;
        _firstPlayer = 0;
        playLock = false;
        isJoin = false;
        isRoomCreate = false;
        isPlayer0WantDes = false;
        isPlayer1WantDes = false;
        tmp1 = 0;
        tmp2 = 0;
        tmp3 = 0;
        tmp4 = 0;

    }
    function stringToBytes32(string memory source) internal returns(bytes32 result){
        assembly{
            result := mload(add(source,32))
        }
    }
    function GetRoom() public returns(bool, bool, address, bool) {
        return (isRoomCreate, isJoin, _playerAddress[0], isStart);
    }
    function CreateRoom(uint8 p1Nonce, address payable player1) public payable {
        if(isRoomCreate == false) {
            isRoomCreate = true;
        } else {
            revert();
        }
        isOver = false;
        _playerAddress[0] = msg.sender;
        _p1Commitment = p1Nonce;

    }
    // Join a game as the second player .
    function joinGame(uint8 p2Nonce, address payable player2) public payable {
        require(isRoomCreate == true);
        require(isJoin == false);
        require(isOver == false);
        require(msg.value == _fee);
        if(isMatch == false){
            isMatch = true;
        } else {
            revert();
        }
        _p2Nonce = p2Nonce;
        _playerAddress[1] = msg.sender;
        isJoin = true;

    }
    
    function startGame (uint8 p1Nonce, address payable player1) public payable{
        //require(isOver == false);
        require(_playerAddress[1] != address(0));
        require(_playerAddress[0] == msg.sender);
        require(msg.value == _fee);
        require (_p1Commitment == p1Nonce);
        _currentPlayer = (p1Nonce ^ _p2Nonce) & 0x01 ;
        _firstPlayer = _currentPlayer;
        isStart = true;
    }
    function SendMoneyToContract() public payable returns(address,uint,address,uint) {
        return (address(this), address(this).balance, msg.sender, address(msg.sender).balance);
    }
    
    function destroyThisGame() public {
        require(isOver == true);
        if(msg.sender == _playerAddress[0]) {
            isPlayer0WantDes = true;
        } else if(msg.sender == _playerAddress[1]) {
            isPlayer1WantDes = true;
        } else {
            revert();
        }
        if(isPlayer0WantDes == true && isPlayer1WantDes == true) {
            _p1Commitment = 0;
            _p2Nonce = 0;
            winnerAddress = address(0);
            _playerAddress[0] = address(0);
            _playerAddress[1] = address(0);
            isMatch = false;
            isOver = false;
            isStart = false;
            _fee = 3 ether;
            _bonus = 5 ether;
            _turnLength = 5;
            matchNum = 0;
            _currentPlayer = 1;
            cnt = 0;
            _firstPlayer = 0;
            playLock = false;
            isJoin = false;
            isRoomCreate = false;
            isPlayer0WantDes = false;
            isPlayer1WantDes = false;
            delete _index;
            delete _indexs;
            delete _status;
        }
        
    }

    
    function getTmp() public view returns(uint8, uint8, uint8, uint8, uint8 [25][25] memory) {
        return (tmp1, tmp2, tmp3, tmp4, _board);
    }
    function getBalance() public returns(uint) {
        return address(this).balance;
    }
    function getWinner() public returns(bool, address) {
        return (isOver, winnerAddress);
    }
    function reserveData() public view returns(uint8 [] memory, uint8 [] memory, uint8 [] memory
    , address, bool, address, bool, address, uint8, uint8, bool) {
        require(playLock == false);
        return (_index, _indexs, _status, _playerAddress[_currentPlayer],isStart,
         _playerAddress[_currentPlayer^0x01], isJoin, _playerAddress[_firstPlayer],
         _p1Commitment, _p2Nonce,isOver);
    }
    // Submit a move
    function getIndex() public view returns(uint8 [] memory, uint8 [] memory, uint8 [] memory, address) {
        require(playLock == false);
        return (_index, _indexs, _status, _playerAddress[_currentPlayer]);
    }
    function getStart() public view returns(bool) {
        return isStart;
    }
    function getPlayer() public view returns(address, uint8, address) {
        require(playLock == false);
        return  (_playerAddress[_currentPlayer], _currentPlayer, _playerAddress[_firstPlayer]);
    }
    
    function playMove(uint8 index, uint8 indexs, uint8 status, bool isWinner) public payable returns(bool, uint){
    // make sure correct player is submitting a move
        require (msg.sender == _playerAddress[_currentPlayer]);

        // claim this square for the current player .
        require(playLock == false);
        playLock = true;
        //checkGameOver(index, indexs, status);
        if(isWinner == true) {
            require(address(this).balance >= _bonus);
            address(msg.sender).transfer(_bonus);
            isOver = true;
        }
        _index.push(index);
        _indexs.push(indexs);
        _status.push(status);
        _currentPlayer ^= 0x01 ;
       
        _turnDeadline = block.number + _turnLength ;
        playLock = false;
        return (false,  _currentPlayer);
    }


    
    

}
