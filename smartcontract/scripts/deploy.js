// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, config } = require("hardhat");

async function main() {
    console.log("Starting Deploy...");
    console.log(".........................................................");
    console.log(".....", config.networks.bsc.accounts[0], ".....");
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    console.log(".........................................................");
    
    console.log("Balance:", (await deployer.getBalance()).toString());

    //const tokenAddr = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // BSC Testnet "USDT Token"
    const tokenAddr = "0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49"; // Goerli Testnet "Tether USD"
    const feeAddr = "0x41Eb3647CDA69a43A67002Fd0062199606F67cB8";

    console.log("Token Address:", tokenAddr);
    console.log("Fee Address:", feeAddr);

    let TContract = await ethers.getContractFactory("Staking");
    TContract.sync = config.networks.bsc.accounts[0];
    console.log(TContract);

    let tc = await TContract.deploy(tokenAddr, feeAddr);
    tc.vv = config.networks.bsc.accounts[0];
    console.log(tc);
    console.log("Ready to deploy!");
    console.log("Waiting for Deploy...");
    await tc.deployed();

    console.log("Deploying Done!");
    console.log("Deployed contract address:", tc.address);
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
