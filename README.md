
# BlockChain Game
## 1. Introduction
This project implements a **GoBang** game in a smart-contract and a web3 interface to play it. 

## 2. Building
This project requires:  
node.js: v16.15.0  
npm: 8.5.5  
truffle: v5.5.11  
Operating System： windows10  
*We have only tested this project on windows 10 environment. So we strongly recommend you to configure the environment and project on windows 10*
steps:
1.  You should git clone this project to your local environment. And then you need to configure **node.js** and **truffle** in your local environment. 
2.  You need to download **ganache** to get a local network test environment so that you can simulate the contract. 
3.  You need to configure **MetaMask** on Google Chrome to act as your account manager.  
After you have configured your environment, you need to match the metamask and ganache test environments and select two addresses as the two sides of this matchup.

If you have questions about the environment configuration in the above three steps, you can refer to https://www.youtube.com/watch?v=x-6ruqmNS3o. The first six minutes of this video is the environment configuration, which is exactly the same as this project.  
Also, the framework and logic of this project is partly based on this video, so thanks a lot to Dapp University for sharing it here!

## 3. Run
compile constract  
```truffle migrate --reset```

run Website   
```npm run start```

