import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import MemoryToken from '../abis/MemoryToken.json'
import sha256 from 'crypto-js/sha256'
//import { message, Button, Space } from 'antd';
import brain from '../brain.png'
const CARD_ARRAY = [
  {
    name: 'fries',
    img: '/images/fries.png'
  },
  {
    name: 'cheeseburger',
    img: '/images/cheeseburger.png'
  },
  {
    name: 'ice-cream',
    img: '/images/ice-cream.png'
  },
  {
    name: 'pizza',
    img: '/images/pizza.png'
  },
  {
    name: 'milkshake',
    img: '/images/milkshake.png'
  },
  {
    name: 'hotdog',
    img: '/images/hotdog.png'
  },
  {
    name: 'fries',
    img: '/images/fries.png'
  },
  {
    name: 'cheeseburger',
    img: '/images/cheeseburger.png'
  },
  {
    name: 'ice-cream',
    img: '/images/ice-cream.png'
  },
  {
    name: 'pizza',
    img: '/images/pizza.png'
  },
  {
    name: 'milkshake',
    img: '/images/milkshake.png'
  },
  {
    name: 'hotdog',
    img: '/images/hotdog.png'
  }
]
class App extends Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    this.setState({ cardArray: CARD_ARRAY.sort(() => 0.5 - Math.random()) })
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
      /*const totalSupply = await token.methods.totalSupply().call().then(console.log)
      this.setState({ totalSupply })
      //token.methods.playMoveNew().call().then(console.log)
      //await token.methods.setNonce1(sha256(2)).call()
      
      //await token.methods.startGame().call()
      //await token.methods.playMoveNew().call().then(console.log)
      console.log("wula")
    
      // Load Tokens
      let balanceOf = await token.methods.balanceOf(accounts[0]).call()
      //console.log(balanceOf)
      for (let i = 0; i < balanceOf; i++) {
        console.log("vvs")
        let id = await token.methods.tokenOfOwnerByIndex(accounts[0], i).call()
        let tokenURI = await token.methods.tokenURI(id).call()
        this.setState({
          tokenURIs: [...this.state.tokenURIs, tokenURI]
        })
      }*/
    } else {
      alert('Smart contract not deployed to detected network.')
    }
  }
  chooseImage = (cardId) => {
    cardId = cardId.toString()
    if(this.state.cardsWon.includes(cardId)) {
      return window.location.origin + '/images/white.png'
    }
    else if(this.state.cardsChosenId.includes(cardId)) {
      return CARD_ARRAY[cardId].img
    } else {
      return window.location.origin + '/images/blank.png'
    }
  }

  flipCard = async (cardId) => {
    let alreadyChosen = this.state.cardsChosen.length

    this.setState({
      cardsChosen: [...this.state.cardsChosen, this.state.cardArray[cardId].name],
      cardsChosenId: [...this.state.cardsChosenId, cardId]
    })

    if (alreadyChosen === 1) {
      setTimeout(this.checkForMatch, 100)
    }
  }
  checkForMatch = async () => {
    const optionOneId = this.state.cardsChosenId[0]
    const optionTwoId = this.state.cardsChosenId[1]

    if(optionOneId == optionTwoId) {
      alert('You have clicked the same image!')
    } else if (this.state.cardsChosen[0] === this.state.cardsChosen[1]) {
      alert('You found a match')
      this.state.token.methods.mint(
         this.state.account,
         window.location.origin + CARD_ARRAY[optionOneId].img.toString()
       )
       .send({ from: this.state.account })
       .on('transactionHash', (hash) => {
         this.setState({
           cardsWon: [...this.state.cardsWon, optionOneId, optionTwoId],
           tokenURIs: [...this.state.tokenURIs, CARD_ARRAY[optionOneId].img]
         })
       })
    } else {
      alert('Sorry, try again')
    }
    this.setState({
      cardsChosen: [],
      cardsChosenId: []
    })
    if (this.state.cardsWon.length === CARD_ARRAY.length) {
      alert('Congratulations! You found them all!')
    }
  }

  ///////////////////////////////////////////////////////////////////
  MasterSendMoneyToContract() {
    this.state.token.methods.SendMoneyToContract().send({value:80*1e18, from: this.state.account})
        .on('transactionHash', function(hash){  })
        .on('confirmation', function(confirmationNumber, receipt){  })
        .on('receipt', function(receipt){
          // receipt 相关例子
          console.log(receipt);
      })
        .on('error', function(error, receipt) { // 如果交易被网络拒绝并带有交易收据，则第二个参数将是交易收据。
  });
  }
  JoinGame() {
    this.state.token.methods.joinGame(1, this.state.account).send({value:3*1e18, from: this.state.account}).
    on('transactionHash', function(hash){  })
    .on('confirmation', function(confirmationNumber, receipt){  })
    .on('receipt', function(receipt){
    console.log(receipt);
})
.on('error', function(error, receipt) { 
});
  }
  defineWinned() {
    const name = this.state.isClick == 1 ? '黑棋胜' : '白棋胜'
     // this.state.token.methods.defineWinned(this.state.isClick - 1).
     //  send({ from: this.state.account }).then(console.log)
     console.log("sender")
     this.state.token.methods.defineWinned(this.state.isClick - 1).send({value:2, from: this.state.account})
     .on('transactionHash', function(hash){  })
      .on('confirmation', function(confirmationNumber, receipt){  })
      .on('receipt', function(receipt){
      console.log(receipt);
  })
  .on('error', function(error, receipt) { 
  });
     this.state.token.methods.defineWinned(this.state.isClick - 1).call({from: this.state.account})
     .then(console.log)
    alert(name)
  }
  handleClickNew(index, indexs) {
    let state = this.state.isClickArr.findIndex((n) => n.idx == index && n.idxs == indexs)
    if (state != -1) {
        return
    }
    this.setState({
        data: this.state.data + 1,
        idx: index,
        idxs: indexs,
        isClick: this.state.data % 2 === 0 ? 1 : 2,
        isClickArr: this.state.isClickArr.concat([{
            data: this.state.data + 1,
            idx: index,
            idxs: indexs,
            isClick: this.state.data % 2 === 0 ? 1 : 2
        }])
    }, () => {
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
        // (纵坐标，横坐标)[indexs][index]确定一个点的位置
        console.log(letArr) // 按第一行、第二行...第二十行 纵坐标
        console.log(index, 'index') // 横坐标
        console.log(indexs, 'indexs') // 纵坐标
        //列计数

        this.state.token.methods.playMove(index, indexs).estimateGas({gas: 5000000}, function(error, gasAmount){
          if(gasAmount == 5000000)
              console.log('Method ran out of gas');
      });
        
    })
  }
  handleClick(index, indexs) {
    let state = this.state.isClickArr.findIndex((n) => n.idx == index && n.idxs == indexs)
    if (state != -1) {
        return
    }
    this.setState({
        data: this.state.data + 1,
        idx: index,
        idxs: indexs,
        isClick: this.state.data % 2 === 0 ? 1 : 2,
        isClickArr: this.state.isClickArr.concat([{
            data: this.state.data + 1,
            idx: index,
            idxs: indexs,
            isClick: this.state.data % 2 === 0 ? 1 : 2
        }])
    }, () => {
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
        // (纵坐标，横坐标)[indexs][index]确定一个点的位置
        console.log(letArr) // 按第一行、第二行...第二十行 纵坐标
        console.log(index, 'index') // 横坐标
        console.log(indexs, 'indexs') // 纵坐标
        //列计数
        let columnCount = 0;
        // 向上下棋
        for (let i = indexs + 1; i < 20; i++) {
            if (letArr[i][index].isClick == this.state.isClick) {
                columnCount++;
            } else {
                break;
            }
        }
        // 向下下棋
        for (let i = indexs - 1; i >= 0; i--) {
            if (letArr[i][index].isClick == this.state.isClick) {
                columnCount++;
            } else {
                break;
            }
        }
        if (columnCount >= 4) {
            this.defineWinned()
            columnCount = 0
            return;
        }
        //行计数
        let lineCount = 0;
        // 向左下棋
        for (let i = index + 1; i < 20; i++) {
            if (letArr[indexs][i].isClick == this.state.isClick) {
                lineCount++;
            } else {
                break;
            }
        }
        // 向右下棋
        for (let i = index - 1; i >= 0; i--) {
            if (letArr[indexs][i].isClick == this.state.isClick) {
                lineCount++;
            } else {
                break;
            }
        }
        if (lineCount >= 4) {
            this.defineWinned()
            lineCount = 0
            return;
        }
        //斜行计数-左斜 \
        let obliqueLeftCount = 0;
        // 向左上下棋↖
        for (let i = index + 1, j = indexs + 1; i < 20 && j < 20; i++,j++) {
            if (letArr[i][j].isClick == this.state.isClick) {
                obliqueLeftCount++;
            } else {
                break;
            }
        }
        // 向左下下棋↘
        for (let i = index - 1, j = indexs - 1; i >= 0 && j >= 0; i--,j--) {
            if (letArr[j][i].isClick == this.state.isClick) {
                obliqueLeftCount++;
            } else {
                break;
            }
        }
        if (obliqueLeftCount >= 4) {
            this.defineWinned()
            obliqueLeftCount = 0
            return;
        }
        //斜行计数-右斜 /
        let obliqueRightCount = 0;
        // 向右上下棋↗
        for (let i = indexs + 1, j = index - 1; i < 20 && j >= 0; i++,j--) {
            if (letArr[i][j].isClick == this.state.isClick) {
                obliqueRightCount++;
            } else {
                break;
            }
        }
        // 向左右下下棋↙
        for (let i = indexs- 1, j = index + 1; i >= 0 && j < 20; i--,j++) {
            if (letArr[i][j].isClick == this.state.isClick) {
                obliqueRightCount++;
            } else {
                break;
            }
        }
        console.log(obliqueRightCount,'obliqueRightCount')
        if (obliqueRightCount >= 4) {
            this.defineWinned()
            obliqueRightCount = 0
            return;
        }
    })
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
      data: 0, // 点击黑白点的次数
      idx: 0, // 点击点的的横坐标
      idxs: 0, // 点击点的纵坐标
      isClickArr: [{
                data: null,
                idx: null,
                idxs: null,
                isClick: null
      }], // 存放点击过的点的数组
      twoArray: Array(20).fill([]), // 存放点击过的点的数组
      arrs: []
    
    }
  }

  render() {
    var self = this;
    return (
      
      <div className='main'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
             //href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
          &nbsp; GoBang
          </a>
          <button type="button" onClick={() => self.MasterSendMoneyToContract()}> import money </button>
          <button type="button" onClick={() => self.JoinGame()}> join game </button>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-muted"><span id="account">{this.state.account}</span></small>
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
                                                return <div key={indexss} className='main-cell-click' onClick={() => self.handleClick(index, indexs)}>
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
            
    
      /*
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
          <img src={brain} width="30" height="30" className="d-inline-block align-top" alt="" />
          &nbsp; Memory Tokens
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-muted"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1 className="d-4">haha</h1>

                <div className="grid mb-4" >

                { this.state.cardArray.map((card, key) => {
                    return(
                      <img
                        key={key}
                        src={this.chooseImage(key)}
                        data-id={key}
                        onClick={(event) => {
                          let cardId = event.target.getAttribute('data-id')
                          if(!this.state.cardsWon.includes(cardId.toString())) {
                            this.flipCard(cardId)
                          }
                        }}
                      />
                    )
                  })}

                </div>

                <div>
                  <h5>Tokens Collected:<span id="result">&nbsp;{this.state.tokenURIs.length}</span></h5>
                  <div className="grid mb-4" >

                  { this.state.tokenURIs.map((tokenURI, key) => {
                      return(
                        <img
                          key={key}
                          src={tokenURI}
                        />
                      )
                    })}

                  </div>

                </div>

              </div>

            </main>
          </div>
        </div>
      </div>*/
    );
  }
}

export default App;
