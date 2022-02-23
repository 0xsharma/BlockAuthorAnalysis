const axios = require('axios')
const Web3 = require('web3');
const fs = require('fs')

var WSWEB3 = 'ws://localhost:8546'
var HTTPSWEB3 = 'http://localhost:8545'

var web3 = new Web3(Web3.givenProvider || WSWEB3);

var startBlock = 25227000
var endBlock = 25228000

async function getBlockValidator(blockNum){
    var blockMiner
    var hexBlockNum = '0x' + blockNum.toString(16)
    await axios.post(HTTPSWEB3 ,{
        jsonrpc: '2.0',
        method: 'bor_getAuthor',
        params: [hexBlockNum],
        id: 1
    }, {
        headers: {
        'Content-Type': 'application/json',
        },
    }).then((response) => {
        blockMiner = response.data.result
    })

    return blockMiner
}

async function main(){
    let blockNum = startBlock

    var lastStartingTime = Math.floor(new Date().getTime() / 1000)

    fs.appendFile(`./output/out-${lastStartingTime}.csv`, "BlockNumber, Producer, Difficulty, BlockHash\n" , function (err) {
        if (err) throw err;
    });

    while(endBlock>=blockNum){
        var blockMiner = await getBlockValidator(blockNum)
        var block = await web3.eth.getBlock(blockNum)
        if(blockNum%64===0){
            fs.appendFile(`./output/out-${lastStartingTime}.csv`, `\n${blockNum}, NEW SPAN\n` , function (err) {
                if (err) throw err;
            });
        }
        fs.appendFile(`./output/out-${lastStartingTime}.csv`, `${blockNum}, ${blockMiner}, ${block.difficulty}, ${block.hash}\n` , function (err) {
            if (err) throw err;
        });
        console.log(blockNum,blockMiner)
        blockNum++
    }

    process.exit(1)
}

main()
