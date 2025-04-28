import React, { useEffect, useState } from "react";
import { ethers } from "ethers";


const CONTRACT_ADDRESS = "0x36e9e219113a8c401fcbd33ef7e24865eb1e6ad1";

//(Application Binary Interface)
const CONTRACT_ABI = [
    "function totalPrize() view returns (uint)",
    "function getAllWinners() view returns (address[])",
    "function distributePrizes(address[] calldata winners, uint[] calldata prizes) external",
    "function withdrawUnclaimedFunds() external",
    "function resetDistribution() external",
    "function distributeRemainingBalance() external",
    "function forcePayout(address winner) external",
    "function transferOwnership(address newOwner) external",
    "function destroyContract() external",
    "function getContractBalance() view returns (uint)",
    "function prizesDistributed() view returns (bool)",
    "function owner() view returns (address)",
];

function App() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [totalPrize, setTotalPrize] = useState(0);
    const [winners, setWinners] = useState([]);
    const [newOwner, setNewOwner] = useState("");
    const [forceWinner, setForceWinner] = useState("");

    useEffect(() => {
        const loadProvider = async () => {
            if (window.ethereum) {
                const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(tempProvider);

                const tempSigner = tempProvider.getSigner();
                setSigner(tempSigner);

                const tempContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, tempSigner);
                setContract(tempContract);

                const accounts = await tempProvider.send("eth_requestAccounts", []);
                setAccount(accounts[0]);
            }
        };
        loadProvider();
    }, []);

    useEffect(() => {
        if (contract) {
            fetchData();
        }
    }, [contract]);

    const fetchData = async () => {
        const prize = await contract.totalPrize();
        setTotalPrize(ethers.utils.formatEther(prize));

        const winnerList = await contract.getAllWinners();
        setWinners(winnerList);
    };

    const withdrawFunds = async () => {
        const tx = await contract.withdrawUnclaimedFunds();
        await tx.wait();
        fetchData();
    };

    const resetDistribution = async () => {
        const tx = await contract.resetDistribution();
        await tx.wait();
        fetchData();
    };

    const distributeRemaining = async () => {
        const tx = await contract.distributeRemainingBalance();
        await tx.wait();
        fetchData();
    };

    const payoutWinner = async () => {
        if (!forceWinner) return;
        const tx = await contract.forcePayout(forceWinner);
        await tx.wait();
        fetchData();
    };

    const changeOwner = async () => {
        if (!newOwner) return;
        const tx = await contract.transferOwnership(newOwner);
        await tx.wait();
        setNewOwner("");
    };

    const destroyContract = async () => {
        const tx = await contract.destroyContract();
        await tx.wait();
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Tournament Prize Distribution</h1>
            <p><strong>Connected Account:</strong> {account}</p>
            <p><strong>Total Prize Pool:</strong> {totalPrize} ETH</p>

            <h2>Winners</h2>
            <ul>
                {winners.map((winner, idx) => (
                    <li key={idx}>{winner}</li>
                ))}
            </ul>

            <hr />

            <h2>Admin Actions</h2>
            <button onClick={withdrawFunds}>Withdraw Unclaimed Funds</button>
            <br /><br />
            <button onClick={resetDistribution}>Reset Distribution</button>
            <br /><br />
            <button onClick={distributeRemaining}>Distribute Remaining Balance</button>
            <br /><br />

            <h3>Force Payout Winner</h3>
            <input
                type="text"
                placeholder="Winner Address"
                value={forceWinner}
                onChange={(e) => setForceWinner(e.target.value)}
            />
            <button onClick={payoutWinner}>Force Payout</button>

            <h3>Transfer Ownership</h3>
            <input
                type="text"
                placeholder="New Owner Address"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
            />
            <button onClick={changeOwner}>Transfer Ownership</button>

            <h3>Danger Zone</h3>
            <button onClick={destroyContract} style={{ backgroundColor: "red", color: "white" }}>
                Destroy Contract
            </button>
        </div>
    );
}

export default App;
