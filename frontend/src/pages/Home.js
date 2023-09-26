import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

function Home() {
    const dispatch = useDispatch();
    const { balance, allowance, account, totalStaked, stakedItems, stakedTokens } = useSelector(state => state);
    const [ amount, setAmount ] = useState(0);
    const [ option, setOption ] = useState("option_30d");
    let reward = 0;
    for (let i = 0; i < stakedItems?.length; i++)
        reward += stakedItems[i].reward;

    useEffect(() => {
        dispatch({
            type: "GET_CONTRACT_INFO"
        });
    }, [dispatch]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            dispatch({
                type: "GET_ACCOUNT_INFO"
            });
        }, 60000);
        return () => clearInterval(intervalId); //This is important
    });

    const onConnectWallet = async () => {
        if (window.ethereum) {
            await window.ethereum.enable();
            dispatch({
                type: 'CONNECT_WALLET',
            });
        }
        else {
            toast.info('Please install metamask on your device', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    const onChangeAmount = (e) => {
        e.preventDefault();
        setAmount(e.target.value);
    }

    const onChangeOption = (e) => {
        e.preventDefault();
        setOption(e.target.value);
    }

    const onStake = () => {
        if (allowance <= 0) {
            dispatch({
                type: "APPROVE_TOKEN",
                payload: Number(amount),
            });
        }
        else {
            if (Number(amount) > 0 || Number(amount) < allowance) {
                dispatch({
                    type: "DEPOSIT_TOKEN",
                    payload: {
                        amount: Number(amount),
                        option: (option === "option_30d") ? 1 : (option === "option_60d") ? 2 : 3,
                    }
                });
            }
            else {
                toast.info('Please input amount correctly to stake', {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
            setAmount(0);
        }
    };

    const onWithdraw = (index) => {
        dispatch({
            type: "WITHDRAW_TOKEN",
            payload: index,
        });
    };

    return (
        <div className="w-full overflow-scroll-vertical">
            <div className="title-container">
                <div className="logo-container">
                    <img src="/logo512.png" width={40} height={40} alt="" />
                    <span className="logo-title">bXUNI Staking</span>
                </div>
                <div className="connect-balance-container">
                    {
                        (account !== "") &&
                        (<div className="balance">
                            <span>Balance:&nbsp;&nbsp;{balance?.toFixed(2)} bXUNI&nbsp;&nbsp;</span>
                        </div>)
                    }
                    <button onClick={onConnectWallet} className="connect-button">{account !== "" ? account.slice(0, 6) + "..." + account.slice(38) : "CONNECT WALLET"}</button>
                </div>
            </div>
            
            <div className="form-container mx-auto">
                <div className="form-item-container">
                    <p className="item-key">Total Staked</p>
                    <p className="item-value">{Number(totalStaked).toFixed(2)} bXUNI</p>
                </div>
                <div className="form-item-container">
                    <p className="item-key">Your Pending Rewards</p>
                    <p className="item-value">{Number(reward).toFixed(2)} bXUNI</p>
                </div>
                <div className="form-item-container">
                    <p className="item-key">Your Staked Tokens</p>
                    <p className="item-value">{Number(stakedTokens).toFixed(2)} bXUNI</p>
                </div>
                <div className="form-item-container">
                    <p className="item-key">Lock Duration</p>
                    <select onChange={onChangeOption} className="item-select">
                        <option value="option_30d">30 Days</option>
                        <option value="option_60d">60 Days</option>
                        <option value="option_120d">120 Days</option>
                    </select>
                </div>
                <input onChange={onChangeAmount} className="w-full item-edit" value={`${amount}`} />
                <div className="w-full flex">
                    <button onClick={onStake} className="item-button w-full">
                        {allowance > 0 ? "STAKE NOW" : "APPROVE"}
                    </button>
                </div>
                <br />
                {/* {<div className="w-full flex">
                    <button onClick={onWithdraw} className="item-button w-full mr-1">
                        WITHDRAW
                    </button>
                    <button className="item-button w-full ml-1">
                        CLAIM REWARDS
                    </button>
                </div>} */}
            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="table-head-cell">No</th>
                            <th className="table-head-cell">Amount</th>
                            <th className="table-head-cell">APY</th>
                            <th className="table-head-cell">Lock Status</th>
                            <th className="table-head-cell">Reward</th>
                            <th className="table-head-cell">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            (stakedItems && stakedItems.length > 0) ?
                            (
                                stakedItems.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className="table-body-cell">{index + 1}</td>
                                            <td className="table-body-cell">{item.amount}</td>
                                            <td className="table-body-cell">{item.apy}%</td>
                                            <td className="table-body-cell">{Math.floor(item.elapsed / 86400)}/{Math.floor(item.duration / 86400)} Days</td>
                                            <td className="table-body-cell">{item.reward}</td>
                                            <td className="table-body-cell">
                                                <button onClick={() => onWithdraw(index)} className="table-body-cell-button">Withdraw</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) :
                            (
                                <tr>
                                    <td className="table-body-none">No Staked Items</td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Home;
