pragma solidity ^0.5.16;
import "./ERC721Full.sol";
contract GoBang  is ERC721Full{
    address payable[2]  _playerAddress ;
    uint32 _turnLength ;
    bytes32 _p1Commitment;
    uint8 _p2Nonce;
    uint8 [20][20] _board;
    uint8 _currentPlayer;
    uint256 _turnDeadline;

    bool isMatch;
    uint _fee;
    uint _bonus;
    bool isOver;
    int matchNum;

    constructor (address payable master, uint32 turnLength, uint fee, uint bonus) 
    ERC721Full("Memory Token", "MEMORY") public {
        _playerAddress[0] = master;
        _playerAddress[1] = address(0);
        isMatch = false;
        isOver = false;
        _turnLength = turnLength;
        _fee = fee;
        _bonus = bonus;
        matchNum = 0;
    }
    function mint(address _to, string memory _tokenURI) public returns(bool) {
       uint _tokenId = totalSupply().add(1);
       _mint(_to, _tokenId);
       _setTokenURI(_tokenId, _tokenURI);
       return true;
    }
    function setNonce1(bytes32 p1Commitment) public {
        require(msg.sender == _playerAddress[0]);
        _p1Commitment = p1Commitment;

    }
    // Join a game as the second player .
    function joinGame (uint8 p2Nonce, address payable player) public payable {
        require(isOver == false);
        require(msg.value == _fee);
        //require(isMatch == false);
        if(isMatch == false){
            isMatch = true;
        } else {
            revert();
        }
        _p2Nonce = p2Nonce;
        _playerAddress[1] = player;
    }
    

    // Revealing player 1’s nonce to choose who goes first .
    function startGame (uint8 p1Nonce, bytes32 p1Commitment) public payable{
        require(isOver == false);
    // must open the original commitment
        require (p1Commitment == _p1Commitment);
        // XOR both nonces and take the last bit to pick the first player
        _currentPlayer = (p1Nonce ^ _p2Nonce) & 0x01 ;

        // start the clock for the next move
        _turnDeadline = block.number + _turnLength ;
    }
    function defineWinned(uint8 winner) public payable{
        require(mint(_playerAddress[winner], "1") == true);
        matchNum ++;
        isMatch = false;
        if(address(this).balance == 0) {
            isOver = true;
        }
    }
    function checkGameOver(uint8 index, uint8 indexs) public returns(bool) {
        uint8 columnCount = 0;
        for (uint8 i = indexs + 1; i < 20; i++) {
            if (_board[i][index] == _currentPlayer) {
                columnCount++;
            } else {
                break;
            }
        }
        // 向下下棋
        for (uint8 i = indexs - 1; i >= 0; i--) {
            if (_board[i][index] == _currentPlayer) {
                columnCount++;
            } else {
                break;
            }
        }
        if (columnCount >= 4) {
            this.defineWinned(_currentPlayer);
            columnCount = 0;
            return true;
        }
        //行计数
        uint8 lineCount = 0;
        // 向左下棋
        for (uint8 i = index + 1; i < 20; i++) {
            if (_board[indexs][i] == _currentPlayer) {
                lineCount++;
            } else {
                break;
            }
        }
        // 向右下棋
        for (uint8 i = index - 1; i >= 0; i--) {
            if (_board[indexs][i] == _currentPlayer) {
                lineCount++;
            } else {
                break;
            }
        }
        if (lineCount >= 4) {
            this.defineWinned(_currentPlayer);
            lineCount = 0;
            return true;
        }
        //斜行计数-左斜 \
        uint8 obliqueLeftCount = 0;
        // 向左上下棋↖
        uint8 i = index + 1;
        uint8 j = indexs + 1;
        while(i < 20 && j < 20) {
             if (_board[i][j] == _currentPlayer) {
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
             if (_board[j][i] == _currentPlayer) {
                obliqueLeftCount++;
            } else {
                break;
            }
            i --;
            j --;
        }
        if (obliqueLeftCount >= 4) {
            this.defineWinned(_currentPlayer);
            obliqueLeftCount = 0;
            return true;
        }
        //斜行计数-右斜 /
        uint8 obliqueRightCount = 0;
        // 向右上下棋↗
        i = indexs + 1;
        j = index - 1;
        while(i < 20 && j >= 0) {
            if (_board[i][j] == _currentPlayer) {
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
            if (_board[i][j] == _currentPlayer) {
                obliqueRightCount++;
            } else {
                break;
            }
            i--;
            j++;
        }
        if (obliqueRightCount >= 4) {
            this.defineWinned(_currentPlayer);
            obliqueRightCount = 0;
            return true;
        }
        return false;
    }

    
    // Submit a move
    function playMove(uint8 index, uint8 indexs) public returns(bool){
    // make sure correct player is submitting a move
        require (msg.sender == _playerAddress[_currentPlayer^0x01]) ;

        // claim this square for the current player .
        _board [index][indexs] = _currentPlayer ;

        // If the game is won , send the pot to the winner
        if (this.checkGameOver(index, indexs)) {
            return true;
        }

        // Flip the current player
        _currentPlayer ^= 0x01 ;

        // start the clock for the next move
        _turnDeadline = block.number + _turnLength ;
        return false;
    }

    // Default the game if a player takes too long to submit a move
    function defaultGame () public {
        if (block.number + _turnLength > _turnDeadline)
            defineWinned(_currentPlayer^0x01);
    }
}
