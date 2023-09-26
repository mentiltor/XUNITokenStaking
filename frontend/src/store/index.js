import { createStore } from 'redux'
import Web3 from 'web3';
import BigNumber from "bignumber.js";
import { toast } from 'react-toastify';
import config from '../config/index';

const _initialState = {
    chainId: -1,
    account: "",
    balance: 0,
    allowance: 0,
    totalStaked: 0,
    stakedTokens: 0,
    stakedItems: [],
};

const provider = Web3.providers.HttpProvider(config.chains[config.active].url);
const web3 = new Web3(Web3.givenProvider || provider);

const StakeCon = new web3.eth.Contract(config.StakeAbi, config.StakeAddress);
const ERC20Con = new web3.eth.Contract(config.ERC20Abi, config.TokenAddress);

console.log("Provider", config.chains[config.active].url);
console.log("Staking contract", config.StakeAddress);
console.log("Token contract", config.TokenAddress);

const WeiToReadable = (wei, decimals) => {
    const a = new BigNumber(wei.toString());
    const b = new BigNumber("10");
    const c = new BigNumber(decimals.toString());
    const d = a.dividedBy(b.exponentiatedBy(c)).toString();
    return parseFloat(d);
}

const ReadableToWei = (value, decimals) => {
    const a = new BigNumber(value.toString());
    const b = new BigNumber("10");
    const c = new BigNumber(decimals.toString());
    const d = a.multipliedBy(b.exponentiatedBy(c)).toString();
    return d;
}

const approve = async (state, amount) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }

    try {
        const decimals = await ERC20Con.methods.decimals().call();
        const fn = ERC20Con.methods.approve(config.StakeAddress, ReadableToWei(amount, Number(decimals)));
        const gasEst = await fn.estimateGas({ from: state.account });
        const gasPrice = await web3.eth.getGasPrice();
        await fn.send({
            from: state.account,
            gasPrice: gasPrice,
            gas: gasEst
        });

        store.dispatch({ type: "GET_ACCOUNT_INFO" });
    } catch (e) {
        console.log(e);
    }
}

const deposit = async (state, amount, option) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }

    try {
        const decimals = await ERC20Con.methods.decimals().call();
        const fn = StakeCon.methods.deposit(ReadableToWei(amount, decimals), option.toString());
        const gasEst = await fn.estimateGas({ from: state.account });
        const gasPrice = await web3.eth.getGasPrice();
        await fn.send({
            from: state.account,
            gasPrice: gasPrice,
            gas: gasEst
        });

        store.dispatch({ type: "GET_ACCOUNT_INFO" });
    } catch (e) {
        console.log(e);
    }
}

const withdraw = async (state, index) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }

    try {
        const fn = StakeCon.methods.withdraw(index);
        const gasEst = await fn.estimateGas({ from: state.account });
        const gasPrice = await web3.eth.getGasPrice();
        await fn.send({
            from: state.account,
            gasPrice: gasPrice,
            gas: gasEst
        });

        store.dispatch({ type: "GET_ACCOUNT_INFO" });
    } catch (e) {
        console.log(e);
    }
}

const getAccountInfo = async (state) => {
    if (!state.account || state.account === "") {
        alertMsg("Please connect metamask!");
        return;
    }
    
    try {
        const decimals = await ERC20Con.methods.decimals().call();
        const totalStaked = await StakeCon.methods.totalStaked().call();
        const balance = await ERC20Con.methods.balanceOf(state.account).call();
        const allowance = await ERC20Con.methods.allowance(state.account, config.StakeAddress).call();
        const stakedTokens = await StakeCon.methods.getStakedTokens(state.account).call();

        var stakedItems = [];
        const itemLength = await StakeCon.methods.getStakedItemLength(state.account).call();
        for (let i = 0; i < Number(itemLength); i++) {
            const apy = await StakeCon.methods.getStakedItemAPY(state.account, i).call();
            const duration = await StakeCon.methods.getStakedItemDuration(state.account, i).call();
            const amount = await StakeCon.methods.getStakedItemAmount(state.account, i).call();
            const reward = await StakeCon.methods.getStakedItemReward(state.account, i).call();
            const elapsed = await StakeCon.methods.getStakedItemElapsed(state.account, i).call();
            //console.log("APY:", apy, "Duration:", duration, "Amount:", amount, "Reward:", reward, "Elapsed:", elapsed);
            stakedItems = [
                ...stakedItems,
                {
                    apy: Number(apy),
                    duration: Number(duration),
                    amount: WeiToReadable(amount, decimals),
                    reward: WeiToReadable(reward, decimals),
                    elapsed: Number(elapsed),
                }
            ]
        }

        store.dispatch({
            type: "RETURN_DATA",
            payload: {
                balance: WeiToReadable(balance, decimals),
                allowance: allowance,
                totalStaked: WeiToReadable(totalStaked, decimals),
                stakedTokens: WeiToReadable(stakedTokens, decimals),
                stakedItems: stakedItems
            }
        });
    } catch (e) {
        console.log(e);
    }
}

const getContractInfo = async (state) => {
    if (!StakeCon) {
        alertMsg("Please install metamask!");
        return;
    }

    try {
        const decimals = await ERC20Con.methods.decimals().call();
        const totalStaked = await StakeCon.methods.totalStaked().call();
        store.dispatch({
            type: "RETURN_DATA",
            payload: {
                totalStaked: WeiToReadable(totalStaked, decimals)
            }
        })
    } catch (e) {
        console.log(e);
    }
}

const reducer = (state = _initialState, action) => {
    switch (action.type) {
        case "GET_CONTRACT_INFO":
            getContractInfo(state);
            break;

        case "GET_ACCOUNT_INFO":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            getAccountInfo(state);
            break;
        
        case "APPROVE_TOKEN": {
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            approve(state, action.payload);
            break;
        }

        case "DEPOSIT_TOKEN":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            deposit(state, action.payload.amount, action.payload.option);
            break;

        case "WITHDRAW_TOKEN":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            withdraw(state, action.payload);
            break;
        
        case 'CONNECT_WALLET':
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }

            web3.eth.getAccounts((err, accounts) => {
                if (accounts.length > 0) {
                    store.dispatch({
                        type: 'RETURN_DATA',
                        payload: { account: accounts[0] }
                    });

                    store.dispatch({ type: "GET_ACCOUNT_INFO" });
                }
            });
            break;

        case 'RETURN_DATA':
            return Object.assign({}, state, action.payload);

        default:
            break;
    }
    return state;
}

const alertMsg = (msg) => {
    toast.info(msg, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
}

const checkNetwork = (chainId) => {
    if (chainId !== config.chains[config.active].chainId) {
        alertMsg(`Change network to ${config.chains[config.active].chainName}!`);
        return false;
    } else {
        return true;
    }
}

const changeNetwork = async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: config.chains[config.active].chainId }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: config.chains[config.active].chainId,
                            chainName: 'Avalanche',
                            rpcUrls: [config.chains[config.active].url],
                        },
                    ],
                });
            } catch (addError) {
            }
        }
    }
}

if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
        console.log("Account changed: ", accounts);
        if (accounts.length > 0) {
            store.dispatch({
                type: "RETURN_DATA",
                payload: {
                    account: accounts[0]
                }
            });
            store.dispatch({ type: "GET_ACCOUNT_INFO" });
        }
        else {
            store.dispatch({
                type: "RETURN_DATA",
                payload: {
                    account: "",
                    balance: 0,
                    stakedTokens: 0,
                }
            });
        }
    });

    window.ethereum.on('chainChanged', function (chainId) {
        chainId = parseInt(chainId, 16);
        checkNetwork(chainId);
        store.dispatch({
            type: "RETURN_DATA",
            payload: { chainId: chainId }
        });
    });

    web3.eth.getChainId().then((chainId) => {
        checkNetwork(chainId);
        store.dispatch({
            type: "RETURN_DATA",
            payload: { chainId: chainId }
        });
    })
}

const store = createStore(reducer);
export default store