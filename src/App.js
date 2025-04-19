// A:\Nexus Giving\nexus-giving-frontend\src\App.js
// --- Based on YOUR original code, with AI Integration & Corrected Fetching ---

import React, { useState, useEffect, useCallback } from 'react';
// Ensure all necessary ethers imports are present
import { BrowserProvider, Contract, formatEther, parseEther, isAddress, Interface } from 'ethers';
// Import AI/IPFS related libraries
import axios from 'axios';
import { create } from 'ipfs-http-client';
import './App.css';

// --- Contract Address and ABI (FROM YOUR CODE) ---
const contractAddress = "0xA27957461693A1dEB5B54CD42Bcc636d17A1a75d"; // Your address
const contractABI = [ 
	{
		"inputs": [ { "internalType": "uint256", "name": "_proposalId", "type": "uint256" } ],
		"name": "executeWithdrawal", "outputs": [], "stateMutability": "nonpayable", "type": "function"
	},
	{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
	{ "inputs": [], "name": "Nexus_AlreadyExecuted", "type": "error" },
	{ "inputs": [], "name": "Nexus_InsufficientBalance", "type": "error" },
	{ "inputs": [], "name": "Nexus_ProposalNotFound", "type": "error" },
	{ "inputs": [], "name": "Nexus_TransferFailed", "type": "error" },
	{ "inputs": [], "name": "Nexus_ZeroAddress", "type": "error" },
	{ "inputs": [], "name": "Nexus_ZeroAmount", "type": "error" },
	{ "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" },
	{ "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" },
	{ "inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error" },
	{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "donor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "DonationReceived", "type": "event" },
	{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" },
	{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "enum NexusGiving.Category", "name": "category", "type": "uint8" }, { "indexed": false, "internalType": "string", "name": "description", "type": "string" }, { "indexed": false, "internalType": "string", "name": "evidenceLink", "type": "string" } ], "name": "ProposalCreated", "type": "event" },
	{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "ProposalExecuted", "type": "event" },
	{
		"inputs": [ { "internalType": "address payable", "name": "_recipient", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "enum NexusGiving.Category", "name": "_category", "type": "uint8" }, { "internalType": "string", "name": "_description", "type": "string" }, { "internalType": "string", "name": "_evidenceLink", "type": "string" } ],
		"name": "proposeWithdrawal", "outputs": [], "stateMutability": "nonpayable", "type": "function"
	},
	{ "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{ "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{ "stateMutability": "payable", "type": "receive" },
	{ "inputs": [], "name": "getBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
	{
		"inputs": [ { "internalType": "uint256", "name": "_proposalId", "type": "uint256" } ], "name": "getProposal", "outputs": [ { "components": [ { "internalType": "address payable", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "enum NexusGiving.Category", "name": "category", "type": "uint8" }, { "internalType": "bool", "name": "executed", "type": "bool" }, { "internalType": "uint256", "name": "timestampCreated", "type": "uint256" }, { "internalType": "uint256", "name": "timestampExecuted", "type": "uint256" } ], "internalType": "struct NexusGiving.Proposal", "name": "", "type": "tuple" } ], "stateMutability": "view", "type": "function"
	},
	{ "inputs": [], "name": "getProposalsCount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
	{ "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }
 ];

// --- AI/IPFS Constants ---
const BACKEND_URL = 'http://localhost:5001'; // Ensure this matches your backend server port
const ipfsClient = create({ url: 'https://ipfs.io/api/v0' }); // Using public gateway

function App() {
  // --- State Variables (from your original code + AI state) ---
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractOwner, setContractOwner] = useState(null);
  const [contractBalance, setContractBalance] = useState("0");
  const [proposals, setProposals] = useState([]);
  const [proposalDetails, setProposalDetails] = useState({}); // Stores description/link from events

  // --- ADDED: AI Analysis State ---
  const [proposalAnalysis, setProposalAnalysis] = useState({});
  const [loadingAnalysis, setLoadingAnalysis] = useState({});

  // --- Form State (from your original code) ---
  const [donationAmount, setDonationAmount] = useState("");
  const [proposalRecipient, setProposalRecipient] = useState("");
  const [proposalAmount, setProposalAmount] = useState("");
  const [proposalCategory, setProposalCategory] = useState(0); // Your category state
  const [proposalDescription, setProposalDescription] = useState(""); // For form input
  const [proposalEvidence, setProposalEvidence] = useState(""); // For form input (optional link)
  const [newOwnerAddress, setNewOwnerAddress] = useState("");

  // --- Loading & Feedback State (from your original code) ---
  const [isDonating, setIsDonating] = useState(false);
  const [isProposing, setIsProposing] = useState(false);
  const [isExecuting, setIsExecuting] = useState({});
  const [lastTxHash, setLastTxHash] = useState(null);
  const [connectionError, setConnectionError] = useState(null); // Added for clarity
  const [networkError, setNetworkError] = useState(null); // Added for clarity
  const [loading, setLoading] = useState(false); // General loading

  // --- Connect Wallet (using your original logic base + robustness) ---
  const connectWallet = useCallback(async () => {
    setConnectionError(null);
    setNetworkError(null);
    setLoading(true);
    if (!window.ethereum) {
      setConnectionError("MetaMask is not installed or not detected.");
      setLoading(false);
      return;
    }
    try {
      const newProvider = new BrowserProvider(window.ethereum, 'any');

      newProvider.on("network", (newNetwork, oldNetwork) => {
        if (oldNetwork) window.location.reload();
      });

      window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0 && accounts[0] !== account) { // Update only if changed
              setAccount(accounts[0].toLowerCase());
              newProvider.getSigner().then(setSigner).catch(console.error);
          } else if (accounts.length === 0) {
              setAccount(null); setSigner(null); setContract(null); // Disconnect
          }
      });

      const accounts = await newProvider.send("eth_requestAccounts", []);
      if (accounts.length === 0) {
        setConnectionError("No accounts found or permission denied.");
        setLoading(false);
        return;
      }
      const newSigner = await newProvider.getSigner();
      setProvider(newProvider);
      setSigner(newSigner);
      setAccount(accounts[0].toLowerCase()); // Ensure consistent casing
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setConnectionError(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
      setAccount(null); setSigner(null); setProvider(null); // Clear state on error
    } finally {
       setLoading(false);
    }
  }, [account]); // Re-run if account changes externally

  // --- ADDED: Upload to IPFS (for evidence CID) ---
  const uploadToIPFS = async (data) => {
    // Uploads description/link as JSON for now. Adapt for file upload later.
    const jsonData = JSON.stringify({ data });
    try {
      console.log("Uploading placeholder to IPFS:", jsonData);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const result = await ipfsClient.add(blob);
      console.log("IPFS Result:", result);
      return result.cid.toString(); // Return the CID
    } catch (err) {
      console.error("IPFS upload error:", err);
      alert(`Failed to upload evidence placeholder to IPFS: ${err.message}`);
      return null; // Return null on failure
    }
  };

  // --- Fetch Core Proposals (from your original code) ---
  const fetchProposals = useCallback(async (currentContract) => {
    if (!currentContract) return;
    console.log("Fetching core proposals...");
    try {
      const countBigInt = await currentContract.getProposalsCount();
      const count = Number(countBigInt);
      console.log("Proposal count:", count);
      const proposalsData = [];
      const startIndex = count > 20 ? count - 20 : 0;
      for (let i = startIndex; i < count; i++) {
        const p = await currentContract.getProposal(i);
        proposalsData.push({
          id: i,
          recipient: p.recipient,
          amount: p.amount,
          category: Number(p.category),
          executed: p.executed,
          timestampCreated: p.timestampCreated,
          timestampExecuted: p.timestampExecuted
          // Description and evidenceLink are NOT fetched here
        });
      }
      setProposals(proposalsData.reverse()); // Newest first
      console.log("Core proposals state updated.");
    } catch (error) {
      console.error("Failed to fetch core proposals:", error);
      setProposals([]); // Reset on error
    }
  }, []);

  // --- Fetch Proposal Details (Strings) from Events (from your original code) ---
  const fetchProposalDetailsFromEvents = useCallback(async (currentContract) => {
    if (!currentContract) return;
    console.log("Fetching proposal details from events...");
    try {
      const eventFilter = currentContract.filters.ProposalCreated();
      // Query from block 0 for simplicity, adjust if needed
      const events = await currentContract.queryFilter(eventFilter, 0, 'latest');
      console.log(`Found ${events.length} ProposalCreated events.`);
      const detailsMap = {};
      events.forEach(event => {
        if (event.args && event.args.proposalId !== undefined) {
          const proposalId = Number(event.args.proposalId);
          detailsMap[proposalId] = {
            description: event.args.description,
            evidenceLink: event.args.evidenceLink // This IS the CID/link from the event
          };
        }
      });
      setProposalDetails(detailsMap);
      console.log("Proposal details state updated:", detailsMap);
    } catch (error) {
      console.error("Failed to fetch proposal details from events:", error);
      // Don't alert here, let UI handle missing details gracefully
    }
  }, []); // No provider dependency needed here if querying from block 0

  // --- ADDED: Fetch AI Analysis ---
  const fetchProposalAnalysis = useCallback(async (proposalId) => {
    if (proposalId === undefined || proposalId === null) return;
    if (proposalAnalysis[proposalId] || loadingAnalysis[proposalId]) return; // Avoid refetch

    console.log(`Fetching analysis for proposal ${proposalId}...`);
    setLoadingAnalysis(prev => ({ ...prev, [proposalId]: true }));
    try {
      const resp = await axios.get(`${BACKEND_URL}/proposal-analysis/${proposalId}`);
      console.log(`Analysis data for ${proposalId}:`, resp.data);
      setProposalAnalysis(prev => ({ ...prev, [proposalId]: resp.data }));
    } catch (err) {
      console.error(`Error fetching analysis for ${proposalId}:`, err);
      setProposalAnalysis(prev => ({ ...prev, [proposalId]: { error: `AI analysis failed: ${err.message}` } }));
    } finally {
      setLoadingAnalysis(prev => ({ ...prev, [proposalId]: false }));
    }
  }, [proposalAnalysis, loadingAnalysis]); // Dependencies to prevent re-fetching

  // --- ADDED: Auto-fetch analysis when proposals load ---
  useEffect(() => {
    proposals.forEach(p => {
      if (p.id !== undefined) fetchProposalAnalysis(p.id);
    });
  }, [proposals, fetchProposalAnalysis]);

  // --- Init Contract & Data (adapted from your code + network check) ---
  useEffect(() => {
    const getContractData = async () => {
      if (provider && account) {
        console.log("Initializing contract...");
        setNetworkError(null); // Reset network error
        try {
            // Network Check
            const network = await provider.getNetwork();
            const targetChainId = 420420421n; // Westend Asset Hub
            if (network.chainId !== targetChainId) {
                 setNetworkError(`Please connect MetaMask to Westend Asset Hub (Chain ID ${targetChainId})`);
                 setContract(null); setProposals([]); setProposalDetails({}); return; // Stop initialization
            }

            const treasuryContract = new Contract(contractAddress, contractABI, provider);
            setContract(treasuryContract);

            const owner = await treasuryContract.owner();
            setContractOwner(owner.toLowerCase());

            const balance = await provider.getBalance(contractAddress);
            setContractBalance(formatEther(balance));

            await fetchProposals(treasuryContract);
            await fetchProposalDetailsFromEvents(treasuryContract); // Fetch details
            console.log("Contract data fetch complete.");

        } catch (contractError) {
            console.error("Error initializing contract:", contractError);
            setNetworkError(`Contract Error: ${contractError.message}`);
            setContract(null); setContractOwner(null); setContractBalance("0"); setProposals([]); setProposalDetails({});
        }
      } else {
        // Clear state if disconnected
        setContract(null); setContractOwner(null); setContractBalance("0"); setProposals([]); setProposalDetails({});
        setNetworkError(null); setConnectionError(null);
      }
    };
    getContractData();
  }, [provider, account, fetchProposals, fetchProposalDetailsFromEvents]); // Rerun if these change

  // --- Handlers (Using YOUR original functions + AI/IPFS calls in propose) ---

  // Handle Donate (Your original code)
  const handleDonate = async (e) => {
    e.preventDefault();
    if (!signer || !donationAmount) return alert("Please connect wallet and enter amount");
    setIsDonating(true);
    setLastTxHash(null);
    try {
      const amountInWei = parseEther(donationAmount);
      const tx = await signer.sendTransaction({ to: contractAddress, value: amountInWei });
      setLastTxHash(tx.hash);
      alert("Donation sending... Hash: " + tx.hash);
      await tx.wait();
      alert("Donation successful!");
      const balance = await provider.getBalance(contractAddress);
      setContractBalance(formatEther(balance));
      setDonationAmount("");
    } catch (error) {
      console.error("Donation failed:", error);
      alert(`Donation failed: ${error?.reason || error.message}`);
    } finally {
      setIsDonating(false);
    }
  };

  // --- MODIFIED: Handle Propose (Your base + IPFS + AI trigger) ---
  const handlePropose = async (e) => {
    e.preventDefault();
    // --- USE YOUR ORIGINAL ADMIN CHECK ---
    if (!contract || !signer || !account || !contractOwner || account.toLowerCase() !== contractOwner.toLowerCase()) {
         return alert("Only the contract owner can propose withdrawals.");
    }
    if (!proposalRecipient || !proposalAmount || !proposalDescription) return alert("Please fill all required proposal fields.");
    if (!isAddress(proposalRecipient)) return alert("Invalid recipient address.");

    setIsProposing(true);
    setLastTxHash(null);
    let evidenceCID = null; // Variable to hold the CID

    try {
        // 1. Upload evidence placeholder to IPFS (using description or link input)
        //    For now, use the description. Adapt later for file upload.
        //    If proposalEvidence link is provided, use that, otherwise use description.
        const dataToUpload = proposalEvidence || proposalDescription;
        if (dataToUpload) { // Only upload if there's something to upload
             evidenceCID = await uploadToIPFS(dataToUpload);
             // If you want to enforce evidence: if (!evidenceCID) throw new Error("Failed to upload evidence to IPFS.");
             console.log("Evidence CID:", evidenceCID);
        } else {
             console.log("No evidence data/link provided, skipping IPFS upload.");
             // You might want to default CID to "" or handle this case in the contract
             evidenceCID = ""; // Pass empty string if nothing uploaded
        }


        // 2. Trigger Backend Analysis (Fire and forget) - Only if CID was generated
        if (evidenceCID) { // Or maybe trigger even without CID? Depends on backend.
             console.log("Sending proposal details to backend for analysis...");
             axios.post(`${BACKEND_URL}/analyze-proposal`, {
                recipientAddress: proposalRecipient,
                description: proposalDescription, // Send the actual description
                evidenceCID: evidenceCID, // Send the generated CID
             }).then(response => {
                console.log("Backend analysis request sent:", response.data);
             }).catch(error => {
                console.error("Error sending data to backend:", error);
             });
        } else {
            console.log("Skipping backend analysis trigger as no evidence CID was generated.");
        }

        // 3. Call the contract function (using YOUR function name and args)
        const contractWithSigner = contract.connect(signer);
        const amountInWei = parseEther(proposalAmount);
        console.log("Calling proposeWithdrawal with:", proposalRecipient, amountInWei, proposalCategory, proposalDescription, evidenceCID || "");
        const tx = await contractWithSigner.proposeWithdrawal(
            proposalRecipient,
            amountInWei,
            parseInt(proposalCategory, 10), // Use the category state
            proposalDescription, // Send description
            evidenceCID || "" // Send the CID or empty string
        );

        setLastTxHash(tx.hash);
        alert("Proposal submitting... Hash: " + tx.hash);
        const receipt = await tx.wait();
        alert("Proposal created successfully!");

         // Extract proposal ID from event
         const creationEvent = receipt.logs?.find(log => {
             try { const parsedLog = contract.interface.parseLog(log); return parsedLog?.name === "ProposalCreated"; } catch { return false; }
         });
         const newProposalId = creationEvent ? Number(creationEvent.args.proposalId) : null;

        // Refresh BOTH lists
        await fetchProposals(contract);
        await fetchProposalDetailsFromEvents(contract);

        // Fetch analysis for the new proposal
        if (newProposalId !== null) {
             await fetchProposalAnalysis(newProposalId);
        }

        // Clear form
        setProposalRecipient(""); setProposalAmount(""); setProposalDescription(""); setProposalEvidence(""); setProposalCategory(0);

    } catch (error) {
        console.error("Proposal creation failed:", error);
        alert(`Proposal creation failed: ${error?.reason || error.message}`);
    } finally {
        setIsProposing(false);
    }
  };

  // Handle Execute (Your original code, renamed function)
  const handleExecute = async (proposalId) => {
    // --- USE YOUR ORIGINAL ADMIN CHECK ---
    if (!contract || !signer || !account || !contractOwner || account.toLowerCase() !== contractOwner.toLowerCase()) {
      return alert("Only the contract owner can execute withdrawals.");
    }
    // Use functional update for safety
    setIsExecuting(prev => ({ ...prev, [proposalId]: true }));
    setLastTxHash(null);
    try {
      const contractWithSigner = contract.connect(signer);
      // --- Use YOUR contract function name ---
      const tx = await contractWithSigner.executeWithdrawal(proposalId);
      setLastTxHash(tx.hash);
      alert("Execution submitting... Hash: " + tx.hash);
      await tx.wait();
      alert(`Proposal ${proposalId} executed successfully!`);
      await fetchProposals(contract); // Refresh core data
      const balance = await provider.getBalance(contractAddress); // Refresh balance
      setContractBalance(formatEther(balance));
    } catch (error) {
      console.error(`Execution failed for proposal ${proposalId}:`, error);
      alert(`Execution failed: ${error?.reason || error.message}`);
    } finally {
      setIsExecuting(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  // Handle Transfer Ownership (Your original code)
  const handleTransferOwnership = async (e) => {
    e.preventDefault();
    // --- USE YOUR ORIGINAL ADMIN CHECK ---
    if (!contract || !signer || !account || !contractOwner || account.toLowerCase() !== contractOwner.toLowerCase()) {
      return alert("Only the current contract owner can transfer ownership.");
    }
    if (!isAddress(newOwnerAddress)) { // Use ethers validation
      return alert("Please enter a valid Ethereum address for the new owner.");
    }
    setLastTxHash(null);
    try {
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.transferOwnership(newOwnerAddress);
      setLastTxHash(tx.hash);
      alert("Transfer Ownership transaction sent... Hash: " + tx.hash);
      await tx.wait();
      alert(`Ownership successfully transferred to ${newOwnerAddress}!`);
      setContractOwner(newOwnerAddress.toLowerCase()); // Update owner state
      setNewOwnerAddress("");
    } catch (error) {
      console.error("Failed to transfer ownership:", error);
      alert(`Failed to transfer ownership: ${error?.reason || error.message}`);
    }
    // Add finally block if you add an isTransferring state
  };

  // Get Category Name (Your original code)
  const getCategoryName = (index) => {
    const categoryIndex = Number(index);
    // --- Use YOUR categories ---
    const categories = ["Medical Supplies", "Salaries", "Logistics", "Operations", "ProgramX", "Other"];
    return categories[categoryIndex] || "Unknown";
  };

  // --- UI Rendering (Based on YOUR structure + AI display) ---
  return (
    <div className="App"> {/* Assuming App.css provides basic styling */}

      <h1>Nexus Giving</h1>
      <p>Contract Address: <span className="address">{contractAddress}</span></p>

      {/* Wallet Info Section */}
      <section className="card">
         <h2>Wallet Status</h2>
         {networkError && <p className="error-message">Network Error: {networkError}</p>}
         {connectionError && <p className="error-message">Connection Error: {connectionError}</p>}
         {account ? (
            <div>
              <p>Connected Account: <span className="address">{account}</span></p>
              <p>Contract Balance: {contractBalance ? parseFloat(contractBalance).toFixed(4) : 'Loading...'} WND</p>
              {contractOwner && <p>Contract Owner: <span className="address">{contractOwner}</span></p>}
              {/* --- Ensure Correct Admin Check --- */}
              {account && contractOwner && account.toLowerCase() === contractOwner.toLowerCase() &&
                <p style={{ color: 'green', fontWeight: 'bold' }}>You are the contract owner.</p>
              }
            </div>
         ) : (
            <button onClick={connectWallet} disabled={loading}>
              {loading? 'Connecting...' : 'Connect Wallet (MetaMask)'}
            </button>
         )}
      </section>

      {/* Transaction Hash Display */}
      {lastTxHash && (
        <section className="card tx-info">
          <p>Last Tx Sent: {' '}
            <a href={`https://assethub-westend.subscan.io/extrinsic/${lastTxHash}`} target="_blank" rel="noopener noreferrer">
              {lastTxHash.substring(0, 8)}...{lastTxHash.substring(lastTxHash.length - 6)}
            </a>
          </p>
        </section>
      )}

      {/* Donation Section */}
      <section className="card">
        <h2>Make a Donation</h2>
        <form onSubmit={handleDonate}>
          <input type="number" step="0.01" min="0.0001" placeholder="Amount in WND" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} required />
          <button type="submit" disabled={!signer || isDonating || !donationAmount}>
            {isDonating ? "Donating..." : "Donate"}
          </button>
        </form>
      </section>

      {/* Admin: Propose Withdrawal Section */}
      {/* --- Ensure Correct Admin Check --- */}
      {account && contractOwner && account.toLowerCase() === contractOwner.toLowerCase() && (
        <section className="card">
          <h2>Admin: Propose Withdrawal</h2>
          {/* Use your original form structure */}
          <form onSubmit={handlePropose}>
            <div><label>Recipient Address: <input type="text" value={proposalRecipient} onChange={(e) => setProposalRecipient(e.target.value)} required placeholder="0x..."/></label></div>
            <div><label>Amount (WND): <input type="number" step="0.01" min="0.0001" value={proposalAmount} onChange={(e) => setProposalAmount(e.target.value)} required placeholder="e.g., 0.5" /></label></div>
            <div>
              <label>Category:
                <select value={proposalCategory} onChange={(e) => setProposalCategory(e.target.value)}>
                  {/* Use your categories */}
                  <option value="0">Medical Supplies</option>
                  <option value="1">Salaries</option>
                  <option value="2">Logistics</option>
                  <option value="3">Operations</option>
                  <option value="4">ProgramX</option>
                  <option value="5">Other</option>
                </select>
              </label>
            </div>
            <div><label>Description: <textarea rows="3" value={proposalDescription} onChange={(e) => setProposalDescription(e.target.value)} required maxLength="100" placeholder="Reason, context..." /></label></div>
            <div><label>Evidence Link (Optional, e.g., IPFS): <input type="text" placeholder="ipfs://Qm... or https://..." value={proposalEvidence} onChange={(e) => setProposalEvidence(e.target.value)} /></label></div>
            <button type="submit" disabled={!signer || isProposing}>
              {isProposing ? "Proposing..." : "Propose Withdrawal"}
            </button>
          </form>
        </section>
      )}

      {/* Withdrawal Proposals & History Section */}
      <section className="card">
        <h2>Withdrawal Proposals & History</h2>
        {proposals.length === 0 && !loading && contract && <p>No proposals yet.</p>}
        {proposals.length === 0 && !loading && !contract && !connectionError && !networkError && <p>Connect wallet to view proposals.</p>}
        {loading && proposals.length === 0 && <p>Loading proposals...</p>}

        {/* Use your original list structure */}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {proposals.map((p) => {
            const details = proposalDetails[p.id] || {}; // Get details fetched from events
            const analysis = proposalAnalysis[p.id]; // Get AI analysis results
            const isLoadingAnalysis = loadingAnalysis[p.id]; // Check if analysis is loading
            const isExecutingThis = isExecuting[p.id]; // Check if this proposal is executing

            // --- Ensure Correct Admin Check for Execute Button ---
            const canExecute = account && contractOwner && account.toLowerCase() === contractOwner.toLowerCase() && !p.executed;

            // Construct IPFS gateway URL safely
            let evidenceDisplayLink = details.evidenceLink; // Use the link/CID from the event
            let ipfsGatewayUrl = null;
            if (evidenceDisplayLink) {
                if (evidenceDisplayLink.startsWith('ipfs://')) {
                    ipfsGatewayUrl = `https://ipfs.io/ipfs/${evidenceDisplayLink.substring(7)}`;
                } else if (evidenceDisplayLink.startsWith('Qm')) { // Handle raw CIDs
                     ipfsGatewayUrl = `https://ipfs.io/ipfs/${evidenceDisplayLink}`;
                } else {
                    // Assume it's a regular HTTPS link if not IPFS format
                    ipfsGatewayUrl = evidenceDisplayLink;
                }
            }


            return (
              <li key={p.id} className={`proposal-item ${p.executed ? 'executed' : ''}`}> {/* Use classes for styling */}
                <p><strong>Proposal ID: {p.id}</strong></p>
                <p>Recipient: <span className="address">{p.recipient}</span></p>
                <p>Amount: {formatEther(p.amount)} WND</p>
                <p>Category: {getCategoryName(p.category)}</p>
                <p>Description: {details.description || (proposalDetails[p.id] === undefined ? 'Loading...' : 'N/A')}</p>
                <p>Evidence: {
                    ipfsGatewayUrl
                        ? <a href={ipfsGatewayUrl} target="_blank" rel="noopener noreferrer">View Link/Evidence</a>
                        : (proposalDetails[p.id] === undefined ? 'Loading...' : 'N/A')
                 }</p>
                <p>Created: {p.timestampCreated && Number(p.timestampCreated) > 0 ? new Date(Number(p.timestampCreated) * 1000).toLocaleString() : 'N/A'}</p>
                <p>Status: {p.executed
                    ? <><span className="status executed">Executed</span> {p.timestampExecuted && Number(p.timestampExecuted) > 0 ? `(${new Date(Number(p.timestampExecuted) * 1000).toLocaleString()})` : ''}</>
                    : <span className="status pending">Pending</span>}
                </p>

                {/* --- ADDED: AI Analysis Display --- */}
                <div className="ai-analysis">
                  <h4>AI Analysis Results:</h4>
                  {isLoadingAnalysis ? ( <p>Loading analysis...</p> )
                   : analysis ? (
                      analysis.error ? ( <p className="error-message">{analysis.error}</p> )
                      : (
                        <div>
                           {/* Display Address Analysis */}
                           <p>Address Check:
                              {analysis.addressAnalysis?.riskScore !== undefined ? ` Risk Score ${analysis.addressAnalysis.riskScore}` : ''}
                              {analysis.addressAnalysis?.flags?.length > 0 ? ` | Flags: ${analysis.addressAnalysis.flags.join(', ')}` : ''}
                              {analysis.addressAnalysis?.riskScore === undefined && !analysis.addressAnalysis?.flags?.length ? ' N/A or OK' : ''}
                           </p>
                           {/* Display Description Analysis */}
                           {analysis.descriptionAnalysis && (
                               <p>Description:
                                  {analysis.descriptionAnalysis?.summary ? ` Summary: ${analysis.descriptionAnalysis.summary}`: ''}
                                  {analysis.descriptionAnalysis?.legitimacy_score !== undefined ? ` | Legitimacy: ${analysis.descriptionAnalysis.legitimacy_score}%` : ''}
                                  {/* Add other fields from your backend response if needed */}
                               </p>
                           )}
                           {!analysis.addressAnalysis && !analysis.descriptionAnalysis && <p>No analysis data available.</p>}
                         </div>
                      )
                   ) : <p>No analysis fetched yet.</p>}
                </div>

                {/* --- Execute Button (YOUR original structure/check) --- */}
                {/* --- STRICT Admin Check Applied Here --- */}
                {canExecute && (
                  <button onClick={() => handleExecute(p.id)} disabled={!signer || isExecutingThis}>
                    {isExecutingThis ? "Executing..." : "Execute"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Transfer Ownership Section */}
      {/* --- Ensure Correct Admin Check --- */}
      {account && contractOwner && account.toLowerCase() === contractOwner.toLowerCase() && (
        <section className="card"> {/* Use card class for consistency */}
          <h2>Transfer Ownership</h2>
          {/* Use your original form structure */}
          <form onSubmit={handleTransferOwnership}>
            <div>
              <label>New Owner Address:</label> <br />
              <input type="text" value={newOwnerAddress} onChange={(e) => setNewOwnerAddress(e.target.value)} placeholder="0x..." required style={{ width: '90%', marginTop: '5px' }} />
            </div>
            <button type="submit" disabled={!signer || !newOwnerAddress} style={{ marginTop: '10px' }}>
              Transfer Ownership
            </button>
          </form>
        </section>
      )}

    </div> // End App div
  );
}

export default App;