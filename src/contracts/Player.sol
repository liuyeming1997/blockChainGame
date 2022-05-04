pragma solidity ^0.5.16;
import "./GoBang.sol";
contract Player {
    GoBang gobang;
    address playerAddress;
    constructor (address _playerAddress, GoBang _gobang) public {
        setGoBang(_gobang);
        playerAddress = _playerAddress;
    }
    function setGoBang(GoBang _gobang) public {
        gobang = _gobang;
    }
   

    //wrapped call
    function callWithdraw() public returns (bool success)  {
        (success, ) = address(gobang).call.gas(200000)(abi.encodeWithSignature("withdraw()"));
    }
    function join(uint fee) public returns (bool success){
        (success, ) = address(gobang).call.value(fee).gas(200000)(abi.encodeWithSignature("join()"));
    }
    //receive() external payable {}

}