import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import MemoryToken from '../abis/MemoryToken.json'

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }
  componentDidMount() {
    this.func();
  }
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }
  func=() => {
    setInterval(() => {
      this.updateClickArr()
    }, 5000);
  }
  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
   
    this.setState({account: accounts[0]})
    //this.setState({ account2: '0xabeFC1ca4EA200a3847fB21B8AB0F4c83B2A5303'})
    const networkId = await web3.eth.net.getId()
    const networkData = MemoryToken.networks[networkId]
    if(networkData) {
      const abi = MemoryToken.abi
      const address = networkData.address
      //const address = "0x08425a1B69d7Bd7De5b857EafAA74466d89284af"
      const token = await new web3.eth.Contract(abi, address)
      this.setState({ token })
      this.initData();
    } else {
      alert('Smart contract not deployed to detected network.')
    }
  }

  ///////////////////////////////////////////////////////////////////
  StartGame() {
    this.state.token.methods.GetRoom().call().then((result) => {
      if(result[3] == true) {
        alert("Game already begin! you can not start game again")
        return
      }
      if(result[0] == false) {
        alert("there is no room, you can not start game")
        return
      }
      if(result[2] != this.state.account) {
        alert("you are not the room creator. You can not start this game")
        return;
      }
      if(result[1] == false) {
        alert("nobody join the room, you can not start game")
        return
      }
      console.log("this nonce", this.state.nonce)
      this.state.token.methods.startGame(this.state.nonce, this.state.account)
      .send({value:3*1e18, from: this.state.account})
          .on('transactionHash', function(hash){  })
          .on('confirmation', function(confirmationNumber, receipt){  })
          .on('receipt', function(receipt){
        })
          .on('error', function(error, receipt) { 
    });
        
      
    })
    
  }
  initDataNew() {
    this.setState({
      isWinner:false,
      isOver:false
    })
  }
  JoinGame() {
    this.state.token.methods.GetRoom().call().then((result) => {
      if(result[1] == true) {
        alert("someone already join the room, you can not join")
        return
      }
      if(result[2] == this.state.account) {
        alert("you have already create room, can not join")
        return
      }
      if(result[0] == false) {
        alert("there is no room, you can not join")
      } else {
        this.initDataNew()
        const id = Math.floor((Math.random()*100)+1);
        this.state.token.methods.joinGame(id, this.state.account).send({value:3*1e18, from: this.state.account})
        .on('transactionHash', (hash) => {
          this.setState({nonce: id})
          console.log("p2nonce: ", id)
          alert("join room successfully")
          })
        .on('confirmation', function(confirmationNumber, receipt){  })
        .on('receipt', function(receipt){
            //console.log(receipt);
        })
        .on('error', function(error, receipt) { 
        });
      }
    })
    
  }
  CreateRoom() {
    this.state.token.methods.GetRoom().call().then((result) => {
      if(result[0] == false) {
        const id = Math.floor((Math.random()*100)+1); 
        //console.log("id", id)
     
        this.state.token.methods.CreateRoom(id, this.state.account).send({from: this.state.account})
        .on('transactionHash', (hash) => {
        this.setState({nonce: id}) 
        this.initDataNew()
        console.log("p1nonce: ", id)
        //console.log("nonce", this.state.nonce)
        alert("create room successfully") })
        
      } else {
        alert("already have a room, can not create")
      }
    })
    
  }
  DeleteRoom = () => {
    if(this.state.isOver == false) {
      alert("you can not delete room now")
      return
    } 
    this.state.token.methods.destroyThisGame().send({from: this.state.account})
        .on('transactionHash', (hash) => {
        alert("Thank you to play this game! bye.") })
  }
  getTmp = () => {
    this.state.token.methods.getTmp().call().then((result) => {
      console.log(result)
    })
  }
  defineWinned = () => {
     this.setState({isWinner: true})
     return true;
  }

  checkGameOver(index, indexs) {
      this.state.token.methods.checkGameOver(index, indexs).call().then(console.log)
  }
  initData = () => {
    this.state.token.methods.reserveData().call().then((result) => {
      console.log(result[8], result[9])
      if(this.state.account == result[3]) {
        this.initDataNew()
        this.setState({
          isMyTurn: true,
          doubleTurn:true,
          nonce: result[9]})
       
      } else if(this.state.account == result[5]) {
        this.initDataNew()
        this.setState({
          isMyTurn: false,
          doubleTurn: false,
          nonce: result[8]})
      } else {
        if(result[4] == true || result[6] == true) {
           alert("There are ongoing competitions, please wait for the end of the competition")
           return
        }
      }
      console.log("isOver", result[10])
      this.setState({isOver: result[10]})
      //console.log("local address: ", this.state.account)
      //console.log("init first address: ", result[7])
      
      if(result[7] == this.state.account) {
        //console.log("lym1")
        this.setState({
          isClick:1
        })
      } else {
        //console.log("lym2")
        this.setState({
          isClick:2
        })
      }


      if(result[0].length != this.state.isClickArr.length - 1) {
        //console.log("init res.length", result[0].length)
        //console.log("init local length", this.state.isClickArr.length)
        this.setState({isClickArr:[]})
          result[0].map((ele, index1) => {
            this.setState({
              data: this.state.data + 1,
              isClickArr: this.state.isClickArr.concat([{
                  data: this.state.data + 1,
                  idx: result[0][index1],
                  idxs: result[1][index1],
                  isClick: result[2][index1]
              }]),
              isStart:result[4]
          }
          )
        })
        
      }
     
  })
  }
  updateClickArr= ()=> {
   if(this.state.isOver == true) {
     return
   }
    if(this.state.isClock == true) {
      this.setState({clockTime: this.state.clockTime - 5})
    }
     if(this.state.isStart == false) {
      this.state.token.methods.getStart().call().then((result) => {
        if(result == true) {
          //console.log("kaishi")
          this.state.isStart = true;
          this.state.token.methods.getPlayer().call().then((result) => {
            // //console.log(result)
            // //console.log(this.state.account)
            if(result[0] == this.state.account) {
              this.state.isMyTurn = true;
            } else {
              this.state.isMyTurn = false;
            }

            if(result[2] == this.state.account) {
              this.setState({isClick: 1})
              alert("Game Begin!Your first move. ")
            } else {
              this.setState({isClick: 2})
              alert("Game Begin!Your backhand move.")
            }
            //console.log(this.state.isClick)
            //console.log("now turn state", this.state.isMyTurn)
          })

          if(this.state.isMyTurn == true) {
            this.state.token.methods.getIndex().call().then((result) => {
              this.setState({ isClickArr: [{
                idx: null,
                idxs: null,
                isClick: null
                }]})
              //console.log("result1", result)
              if(result[0].length != 0) {
                result[0].map((ele, index1) => {
                  this.setState({
                    //data: this.state.data + 1,
                    isClickArr: this.state.isClickArr.concat([{
                        idx: result[0][index1],
                        idxs: result[1][index1],
                        isClick: result[2][index1]
                    }])
                })
              })
              }
              //console.log("end")
          })
          //console.log("end1")
          }
        }
      })
      
     }
    if(this.state.doubleTurn == false) {
      if(this.state.isStart == false) {
        return
      }
      this.state.token.methods.getPlayer().call().then((result) => {
        // //console.log("update res.length", result[0].length)
        //console.log(result)
        // //console.log("update local length", this.state.isClickArr.length)
        if(result[0] == this.state.account) {
          alert("It's your turn.")
          this.setState({isClockOn:true,
                          clockTime: 20})
          this.state.token.methods.getIndex().call().then((result) => {
            //console.log("res.length", result[0].length)
            //console.log("local length", this.state.isClickArr.length)
            this.setState({ isClickArr: [{
              idx: null,
              idxs: null,
              isClick: null
              }]})
            result[0].map((ele, index1) => {
              this.setState({
                //data: this.state.data + 1,
                isClickArr: this.state.isClickArr.concat([{
                    idx: result[0][index1],
                    idxs: result[1][index1],
                    isClick: result[2][index1]
                }])
            })
          })
         
      })
      this.state.token.methods.getWinner().call().then((result) => {
        if(result[0] == true) {
          if(this.state.account != result[1]) {
            alert("sorry! you lose")
            //destroy
            this.setState({isOver: true})
            return
          }
        }
      })
      this.state.isMyTurn = true;
      this.state.doubleTurn = true;
        } 
      })
      
    }
    if(this.state.isMyTurn == false) {
      this.state.doubleTurn = false;
    }
    
  }
  handleClickNew = (index, indexs)=> {
    if(this.state.isOver == true) {
      alert("The competition is over")
      return
    }
    if(this.state.isStart == false) {
      alert("The game hasn't even started yet.")
      return
   }
   if(this.state.isMyTurn == false) {
    alert("This is not your turn")
    return
    }
    if(this.state.isButton == false) {
      alert("You must finish processing this transaction")
      return
    }
    let state = this.state.isClickArr.findIndex((n) => n.idx == index && n.idxs == indexs)
    if (state != -1) {
        alert("There is already a piece in this position, please replay this move")
        return
    }

    this.state.isButton = false;
    this.setState({
        idx: index,
        idxs: indexs,
        isClickArr: this.state.isClickArr.concat([{
            data: 0,
            idx: index,
            idxs: indexs,
            isClick: this.state.isClick
        }])
    }, () => {
        //console.log("index", index)
        //console.log("indexs", indexs)
        //console.log("state", this.state.isClick)
        const flagWinner = this.checkForWin(index, indexs)
        this.state.token.methods.playMove(index, indexs, this.state.isClick, flagWinner).send({from: this.state.account}).
        on('transactionHash', (hash) => {
          this.setState({
            isClockOn: false,
            isMyTurn: false,
            isButton: true
          })
          if(this.state.isWinner == true) {
            alert("Congratulations! You win.")
            this.setState({
              isOver: true
            })
          }
         })
        .on('confirmation', function(confirmationNumber, receipt){  })
        .on('receipt', function(receipt){
        })



        
        
    })
  }
  checkForWin = (index, indexs)=>{
    const winlen = 4;
    let letArr = this.state.twoArray.map((ele, index1) => {
      let arr = Array(20).fill([])
      let arrr=arr.map((item,row) => {
          arr[this.state.idx] = this.state.isClickArr.filter((eles, index2) => {
              return index1 == eles.idxs && eles.idx == row
          })
          let arrData = arr[this.state.idx].length > 0 ? arr[this.state.idx][0] : ''
          return arrData
      })
      let arrs = Array(20).fill([])
      arrs[indexs][index] = arrr
      return arrs[indexs][index]
  })
  let columnCount = 0;
  console.log(letArr)
  console.log("test:", letArr[17][1])
  console.log(index, indexs)
  //////////////////////////////////////////////


  
  //////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  for (let i = indexs + 1; i < 20; i++) {
      if (letArr[i][index].isClick == this.state.isClick) {
          columnCount++;
      } else {
          break;
      }
  }
  for (let i = indexs - 1; i >= 0; i--) {
      if (letArr[i][index].isClick == this.state.isClick) {
          columnCount++;
      } else {
          break;
      }
  }
  //console.log("isClick", this.state.isClick)
  //console.log("columnCount ", columnCount)
  console.log("columnCount", columnCount)
  if (columnCount >= winlen) {
      return this.defineWinned()
      columnCount = 0
      return;
  }
  let lineCount = 0;
  for (let i = index + 1; i < 20; i++) {
      if (letArr[indexs][i].isClick == this.state.isClick) {
          lineCount++;
      } else {
          break;
      }
  }
  for (let i = index - 1; i >= 0; i--) {
      if (letArr[indexs][i].isClick == this.state.isClick) {
          lineCount++;
      } else {
          break;
      }
  }
  console.log("lineCount", lineCount)
  if (lineCount >= winlen) {
      return this.defineWinned()
      lineCount = 0
      return;
  }
  let obliqueLeftCount = 0;
  for (let i = index + 1, j = indexs + 1; i < 20 && j < 20; i++,j++) {
      if (letArr[j][i].isClick == this.state.isClick) {
          obliqueLeftCount++;
      } else {
          break;
      }
  }
  for (let i = index - 1, j = indexs - 1; i >= 0 && j >= 0; i--,j--) {
      if (letArr[j][i].isClick == this.state.isClick) {
          obliqueLeftCount++;
      } else {
          break;
      }
  }
  console.log("obliqueLeftCount", obliqueLeftCount)
  if (obliqueLeftCount >= winlen) {
      obliqueLeftCount = 0
      return this.defineWinned()
  }
  let obliqueRightCount = 0;
  for (let i = indexs + 1, j = index - 1; i < 20 && j >= 0; i++,j--) {
      if (letArr[i][j].isClick == this.state.isClick) {
          obliqueRightCount++;
      } else {
          break;
      }
  }
  for (let i = indexs- 1, j = index + 1; i >= 0 && j < 20; i--,j++) {
      if (letArr[i][j].isClick == this.state.isClick) {
          obliqueRightCount++;
      } else {
          break;
      }
  }
  console.log("obliqueRightCount", obliqueRightCount)
  if (obliqueRightCount >= winlen) {
      return this.defineWinned()
      obliqueRightCount = 0
      return;
  }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      account2: '0x0',
      token: null,
      totalSupply: 0,
      tokenURIs: [],
      cardArray: [],
      cardsChosen: [],
      cardsChosenId: [],
      cardsWon: [],

      ///////////////////////
      arr: Array(20).fill(null),
      isClick: null,
      idx: 0, 
      idxs: 0, 
      isClickArr: [{
                idx: null,
                idxs: null,
                isClick: null
      }], 
      twoArray: Array(20).fill([]), 
      arrs: [],
      isMyTurn: true,
      isStart: false,
      isButton: true,
      isWinner: false,
      isOver: false,
      doubleTurn: true,
      nonce: 0,
      clockTime: 0,
      isClockOn: false
    
    }
  }

  render() {
    var self = this;
    return (
      
      <div className='main'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            target="_blank"
            rel="noopener noreferrer"
          >
          &nbsp; GoBang
          </a>
          <button type="button" onClick={() => self.StartGame()}> start game </button>
          <button type="button" onClick={() => self.JoinGame()}> join game </button>
          <button type="button" onClick={() => self.CreateRoom()}> create room </button>
          <button type="button" onClick={() => self.DeleteRoom()}> delete room </button>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <big className="text-muted"><span id="account">{this.state.account}</span></big>
            </li>
          </ul>
        </nav>
                {
                    this.state.arr.map((item, index) => {
                        return <div className='main-cell' key={index}>
                            {
                                this.state.arr.map((ele, indexs) => {
                                    return <div className='main-cell-single' key={indexs}>
                                        {
                                            this.state.isClickArr.map((items, indexss) => {
                                                return <div key={indexss} className='main-cell-click' onClick={() => self.handleClickNew(index, indexs)}>
                                                    {
                                                        items.isClick == 1 && items.idx == index && items.idxs == indexs
                                                            ? <div className='main-cell-black'></div>
                                                            : items.isClick == 2 && items.idx == index && items.idxs == indexs ? <div className='main-cell-white'></div>
                                                                : ''
                                                    }
                                                </div>
                                            })
                                        }
                                    </div>
                                })
                            }
                        </div>
                    })
                }
            </div>
    );
  }
}

export default App;
