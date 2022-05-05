pragma solidity ^0.5.0;

import "./ERC721Full.sol";

contract MemoryToken{
    // constructor() ERC721Full("Memory Token", "MEMORY") public {
    // }
    // //_tokenURI is png url

    // function mint(address _to, string memory _tokenURI) public returns(bool) {
    //    uint _tokenId = totalSupply().add(1);
    //    _mint(_to, _tokenId);
    //    _setTokenURI(_tokenId, _tokenURI);
    //    return true;
    // }
    uint public initialBalance = 100 ether;
    address payable[2]  _playerAddress ;
    uint32 _turnLength ;
    bytes32 _p1Commitment;
    uint8 _p2Nonce;
    uint8 [] _index = new uint8[](0);
    uint8 [] _indexs = new uint8[](0);
    uint8 [] _status = new uint8[](0);
    //uint8 [20][20] _board;
    uint8 _currentPlayer;
    uint256 _turnDeadline;

    bool isMatch;
    bool isStart;
    uint _fee;
    uint _bonus;
    bool isOver;
    uint256 matchNum;
    uint cnt;
    bool playLock;
    /*
    function mint(address _to, string memory _tokenURI) public returns(bool) {
       //require(_to != address(0));
       uint _tokenId = totalSupply().add(1);
       _mint(_to, _tokenId);
       _setTokenURI(_tokenId, _tokenURI);
       return true;
    }*/

    constructor ()  public {
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
        playLock = false;
    }
    function setNonce1(bytes32 p1Commitment) public {
        require(msg.sender == _playerAddress[0]);
        _p1Commitment = p1Commitment;

    }
    // Join a game as the second player .
    function joinGame (uint8 p2Nonce, address payable player2) public payable {
        require(isOver == false);
        require(msg.value == _fee);
        //require(isMatch == false);
        if(isMatch == false){
            isMatch = true;
        } else {
            revert();
        }
        _p2Nonce = p2Nonce;
        _playerAddress[1] = player2;

    }
    

    // Revealing player 1’s nonce to choose who goes first .
    //function startGame (uint8 p1Nonce, bytes32 p1Commitment) public payable{
    function startGame (uint8 p2Nonce, address payable player1) public payable{
        //require(isOver == false);
        require(_playerAddress[1] != address(0));
        // require (p1Commitment == _p1Commitment);
        // _currentPlayer = (p1Nonce ^ _p2Nonce) & 0x01 ;
         _p2Nonce = p2Nonce;
         isStart = true;
        _playerAddress[0] = player1;
        _currentPlayer = 0;
        _turnDeadline = block.number + _turnLength ;
    }
    function SendMoneyToContract() public payable returns(address,uint,address,uint) {
        //mint(_playerAddress[winner], "1");
        //safeTransferFrom(address(this), _playerAddress[winner], matchNum);
        return (address(this), address(this).balance, msg.sender, address(msg.sender).balance);
    }
    function defineWinned(uint8 winner) public payable returns(address,uint,address,uint) {
        //mint(_playerAddress[winner], "1");
        //safeTransferFrom(address(this), _playerAddress[winner], matchNum);
        require(address(this).balance >= _bonus);
        address(msg.sender).transfer(_bonus);
        isMatch = false;
        if(address(this).balance == 0) {
            isOver = true;
        }
        return (address(this), address(this).balance / 1e18, msg.sender, address(msg.sender).balance/ 1e18);
    }
    function getBalance() public returns(uint) {
        return address(this).balance;
    }
    /*
    function checkGameOver(uint8 index, uint8 indexs) public returns(bool) {
        uint currentPlayerRes = _currentPlayer + 1;
        uint8 columnCount = 0;
        
        for (uint8 i = indexs + 1; i < 20; i++) {
            if (_board[i][index] == currentPlayerRes) {
                columnCount++;
            } else {
                break;
            }
        }
        for (uint8 i = indexs - 1; i >= 0; i--) {
            if (_board[i][index] == currentPlayerRes) {
                columnCount++;
            } else {
                break;
            }
        }
        
        // 向下下棋
        
        if (columnCount >= 4) {
           // this.defineWinned(_currentPlayer);
            columnCount = 0;
            return true;
        }
        return false;
        //行计数
        /*
        uint8 lineCount = 0;
        // 向左下棋
        for (uint8 i = index + 1; i < 20; i++) {
            if (_board[indexs][i] == currentPlayerRes) {
                lineCount++;
            } else {
                break;
            }
        }
        // 向右下棋
        for (uint8 i = index - 1; i >= 0; i--) {
            if (_board[indexs][i] == currentPlayerRes) {
                lineCount++;
            } else {
                break;
            }
        }
        if (lineCount >= 4) {
           // this.defineWinned(_currentPlayer);
            lineCount = 0;
            return true;
        }
        //斜行计数-左斜 \
        uint8 obliqueLeftCount = 0;
        // 向左上下棋↖
        uint8 i = index + 1;
        uint8 j = indexs + 1;
        while(i < 20 && j < 20) {
             if (_board[i][j] == currentPlayerRes) {
                obliqueLeftCount++;
            } else {
                break;
            }
            i ++;
            j ++;
        }
        // 向左下下棋↘
        i = index - 1;
        j = indexs - 1;
        while(i >= 0 && j >= 0) {
             if (_board[j][i] == currentPlayerRes) {
                obliqueLeftCount++;
            } else {
                break;
            }
            i --;
            j --;
        }
        if (obliqueLeftCount >= 4) {
           // this.defineWinned(_currentPlayer);
            obliqueLeftCount = 0;
            return true;
        }
        //斜行计数-右斜 /
        uint8 obliqueRightCount = 0;
        // 向右上下棋↗
        i = indexs + 1;
        j = index - 1;
        while(i < 20 && j >= 0) {
            if (_board[i][j] == currentPlayerRes) {
                obliqueRightCount++;
            } else {
                break;
            }
            i++;
            j--;
        }
        i = indexs- 1;
        j = index + 1;
        while(i >= 0 && j < 20) {
            if (_board[i][j] == currentPlayerRes) {
                obliqueRightCount++;
            } else {
                break;
            }
            i--;
            j++;
        }
        if (obliqueRightCount >= 4) {
           // this.defineWinned(_currentPlayer);
            obliqueRightCount = 0;
            return true;
        }
        return false;
    }*/

    
    // Submit a move
    function getIndex() public view returns(uint8 [] memory, uint8 [] memory, uint8 [] memory, address) {
        require(playLock == false);
        return (_index, _indexs, _status, _playerAddress[_currentPlayer]);
    }
    function getStart() public view returns(bool) {
        return isStart;
    }
    function getPlayer() public view returns(address, uint8) {
        require(playLock == false);
        return  (_playerAddress[_currentPlayer], _currentPlayer);
    }
    
    function playMove(uint8 index, uint8 indexs, uint8 status) public returns(bool, uint){
    // make sure correct player is submitting a move
        //require (msg.sender == _playerAddress[_currentPlayer^0x01]) ;

        // claim this square for the current player .
        require(playLock == false);
        playLock = true;
        _currentPlayer ^= 0x01 ;
        _index.push(index);
        _indexs.push(indexs);
        _status.push(status);
        // If the game is won , send the pot to the winner
        
        // if (this.checkGameOver(index, indexs)) {
        //     return (true,  _board [index][indexs]);
        //  }
        // Flip the current player
       // _currentPlayer = _currentPlayer == 0? 1:0;

        // start the clock for the next move
        _turnDeadline = block.number + _turnLength ;
        playLock = false;
        return (false,  _currentPlayer);
    }
    function playMoveNew() public returns(string memory){
        return "Hello!%";
    }

    // Default the game if a player takes too long to submit a move
    function defaultGame () public {
        if (block.number + _turnLength > _turnDeadline)
            defineWinned(_currentPlayer^0x01);
    }

    

}
