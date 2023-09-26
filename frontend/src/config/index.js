import StakeAbi from './StakeAbi.json';
import ERC20Abi from './ERC20Abi.json';

// real net, avalanche-c chain
var config = {
    StakeAbi: StakeAbi,
    ERC20Abi: ERC20Abi,

    active: "bsc",
    chains: {
        bsc: {
            url: "https://bsc-dataseed.binance.org",
            chainId: 56,
            chainName: "BSC Mainnet",
        },
    
        bscTestnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            chainId: 97,
            chainName: "BSC Testnet",
        },
    
        goerli: {
            url: "https://rpc.goerli.eth.gateway.fm",
            chainId: 5,
            chainName: "Goerli Testnet",
        },
    },

    StakeAddress: "0x7B3a684aB42168af3Ae645A843C1685D980C21bf", // Staking contract address
    TokenAddress: "0xc6660965869fae1776F83B56e68e32555067Ea85", // Token contract address
};

export default config; 
