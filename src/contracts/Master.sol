pragma solidity ^0.5.16;
import "./GoBang.sol";
contract Master{
    GoBang gobang;
    constructor() public {
       // gobang = new GoBang(30, 1, 2);
    }
    function getGoBang() view public returns(GoBang) {
        return gobang;
    }
}
