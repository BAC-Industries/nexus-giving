import React, { useState, useEffect, useCallback } from 'react';
// --- React Router Imports ---
import { Routes, Route, Link, useLocation } from 'react-router-dom'; // Import useLocation
// --- Ethers, Axios, IPFS ---
import { BrowserProvider, Contract, formatEther, parseEther, isAddress } from 'ethers';
import axios from 'axios';
import { create } from 'ipfs-http-client';
// --- CSS and Page Components ---
import './App.css';
import HomePage from './pages/HomePage'; // Import HomePage
import AboutPage from './pages/AboutPage'; // Import AboutPage
import HowItWorksPage from './pages/HowItWorksPage'; // Import HowItWorksPage

// --- Constants (ABI, Address, etc.) ---
// ▼▼▼ REPLACE WITH YOUR ACTUAL DEPLOYED ADDRESS ▼▼▼
const CONTRACT_ADDRESS = "0x3c18ce6cDf5F93B5e975507bC27Df9E00E818CB9"; // Replace!
// ▲▲▲ REPLACE WITH YOUR ACTUAL DEPLOYED ADDRESS ▲▲▲
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_proposalId",
				"type": "uint256"
			}
		],
		"name": "executeWithdrawal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "Nexus_AlreadyExecuted",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "Nexus_InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "Nexus_ProposalNotFound",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "Nexus_TransferFailed",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "Nexus_ZeroAddress",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "Nexus_ZeroAmount",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ReentrancyGuardReentrantCall",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "donor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "DonationReceived",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "enum NexusGiving.Category",
				"name": "category",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "evidenceLink",
				"type": "string"
			}
		],
		"name": "ProposalCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "ProposalExecuted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "_recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "enum NexusGiving.Category",
				"name": "_category",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_evidenceLink",
				"type": "string"
			}
		],
		"name": "proposeWithdrawal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_proposalId",
				"type": "uint256"
			}
		],
		"name": "getProposal",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address payable",
						"name": "recipient",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "enum NexusGiving.Category",
						"name": "category",
						"type": "uint8"
					},
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "timestampCreated",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestampExecuted",
						"type": "uint256"
					}
				],
				"internalType": "struct NexusGiving.Proposal",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getProposalsCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; // Replace!

const BACKEND_URL = 'http://localhost:5001';
const TARGET_CHAIN_ID = 420420421n;
const TARGET_NETWORK_NAME = "Westend Asset Hub";
// Ensure ipfs-http-client v5.0.0+ is installed for create()
// npm install ipfs-http-client
// If using older version, might need: const ipfsClient = ipfsHttpClient({ url: '...' });
const ipfsClient = create({ url: 'https://ipfs.io/api/v0' }); // Common public node, might need your own

function getCategoryName(categoryId) {
  const names = ["General", "Emergency", "Infrastructure", "Community"];
  return names[categoryId] ?? "Unknown";
}

function App() {
  // --- Core State (Managed by App) ---
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractOwner, setContractOwner] = useState(null);
  const [contractBalance, setContractBalance] = useState("0");
  const [networkError, setNetworkError] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [proposalDetails, setProposalDetails] = useState({});
  const [proposalAnalysis, setProposalAnalysis] = useState({});
  const [loadingAnalysis, setLoadingAnalysis] = useState({});
  const [loading, setLoading] = useState(false); // General loading
  const [lastTxHash, setLastTxHash] = useState(null);

  // --- Form State (Managed by App and passed down - could be moved to HomePage later) ---
  const [donationAmount, setDonationAmount] = useState("");
  const [proposalRecipient, setProposalRecipient] = useState("");
  const [proposalAmount, setProposalAmount] = useState("");
  const [proposalCategory, setProposalCategory] = useState(0);
  const [proposalDescription, setProposalDescription] = useState("");
  const [proposalEvidenceFile, setProposalEvidenceFile] = useState(null);
  const [newOwnerAddress, setNewOwnerAddress] = useState("");

  // --- Loading States for Actions (Managed by App and passed down) ---
  const [isDonating, setIsDonating] = useState(false);
  const [isProposing, setIsProposing] = useState(false);
  const [isExecuting, setIsExecuting] = useState({});
  const [isTransferring, setIsTransferring] = useState(false);

  // --- Listener Handlers (defined outside useCallback to avoid dependency issues) ---
  const handleAccountsChanged = useCallback((newAccounts, currentProvider) => {
      console.log('Accounts changed:', newAccounts);
      if (newAccounts.length > 0) {
          const updatedAccount = newAccounts[0].toLowerCase();
          setAccount(updatedAccount);
          // Get new signer for the updated account
          currentProvider?.getSigner().then(setSigner).catch(err => {
              console.error("Error getting signer on account change:", err);
              setSigner(null);
              setConnectionError("Could not get signer for the new account.");
          });
      } else {
          setAccount(null); setSigner(null); setContract(null); setContractOwner(null); setContractBalance("0");
          setProposals([]); setProposalDetails({}); setProposalAnalysis({});
          setConnectionError("Wallet disconnected. Please connect again.");
      }
  }, []); // No dependencies needed as it uses args and setters


  const handleChainChanged = useCallback((chainIdHex) => {
      console.log('Network changed to:', chainIdHex);
      alert("Network changed! Reloading the page to connect to the new network.");
      window.location.reload();
  }, []); // No dependencies needed


  // --- Callback Definitions ---
  const connectWallet = useCallback(async () => {
    setConnectionError(null); setNetworkError(null); setLoading(true);
    if (!window.ethereum) { setConnectionError("MetaMask is not installed."); setLoading(false); return; }
    try {
      const newProvider = new BrowserProvider(window.ethereum, 'any');

      // Request accounts first
      const accounts = await newProvider.send("eth_requestAccounts", []);
      if (accounts.length === 0) { setConnectionError("No accounts found. Please unlock MetaMask or grant access."); setLoading(false); return; }
      const currentAccount = accounts[0].toLowerCase();

      // Now check the network *after* getting the provider
      const network = await newProvider.getNetwork();
      console.log("Connected Network:", network);
      if (network.chainId !== TARGET_CHAIN_ID) {
        setNetworkError(`Please switch MetaMask to the ${TARGET_NETWORK_NAME} network (Chain ID: ${TARGET_CHAIN_ID}). Current: ${network.name} (${network.chainId})`);
        // Don't clear provider/account yet, let user switch
        setLoading(false);
        return; // Stop if network is wrong
      }

      // Network is correct, proceed to get signer and set state
      const newSigner = await newProvider.getSigner();
      setProvider(newProvider);
      setSigner(newSigner);
      setAccount(currentAccount);
      setNetworkError(null); // Clear network error if successful

      // Setup listeners (handle existing listeners more robustly)
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
      window.ethereum.on('accountsChanged', (newAccounts) => handleAccountsChanged(newAccounts, newProvider)); // Pass provider
      window.ethereum.on('chainChanged', handleChainChanged);

    } catch (err) {
        console.error("Wallet Connection Error:", err);
        if (err.code === 4001) { // User rejected the request
            setConnectionError("Wallet connection request rejected by user.");
        } else {
            setConnectionError(`Failed to connect wallet: ${err.message}`);
        }
        // Reset state on error
        setAccount(null); setSigner(null); setProvider(null); setContract(null);
    } finally {
        setLoading(false);
    }
  }, [handleAccountsChanged, handleChainChanged]); // Include handlers in dependencies


  const uploadToIPFS = async (file) => {
    if (!file) { alert("No file selected for upload."); return null; }
    console.log(`Uploading file "${file.name}" to IPFS...`);
    try {
      const result = await ipfsClient.add(file);
      console.log("IPFS Upload Result:", result);
      // Return the CID (Content Identifier) as a string
      return result.cid.toString();
    } catch (err) {
      console.error("IPFS upload error:", err);
      alert(`IPFS upload failed: ${err.message}`);
      return null;
    }
  };

  // *** THE FIX IS HERE: Added 'async' before (proposalId) => ***
  const fetchProposalAnalysis = useCallback(async (proposalId) => {
    // Prevent fetching if ID is invalid, already loading, or already successfully fetched
    if (
      proposalId === undefined ||
      proposalId === null ||
      loadingAnalysis[proposalId] ||
      (proposalAnalysis[proposalId] && !proposalAnalysis[proposalId].error) // Check if valid data exists
    ) {
      // console.log(`Skipping analysis fetch for ${proposalId}. Loading: ${loadingAnalysis[proposalId]}, Exists: ${!!proposalAnalysis[proposalId]}`);
      return;
    }

    console.log(`🔍 Fetching analysis for proposal ID: ${proposalId}`);
    setLoadingAnalysis(prev => ({ ...prev, [proposalId]: true }));

    try {
      const response = await axios.get(`${BACKEND_URL}/proposal-analysis/${proposalId}`);
      console.log(`✅ Analysis received for ${proposalId}:`, response.data);
      setProposalAnalysis(prev => ({
        ...prev,
        [proposalId]: response.data // Store the actual analysis data
      }));
    } catch (err) {
      console.error(`❌ Fetch analysis failed for ${proposalId}:`, err);
      const is404 = err.response?.status === 404;
      const errorMessage = is404
            ? "No analysis available yet for this proposal."
            : `AI analysis fetch failed: ${err.response?.data?.error || err.message}`; // Prefer backend error message

      setProposalAnalysis(prev => ({
        ...prev,
        [proposalId]: { error: errorMessage } // Store error state
      }));
    } finally {
      setLoadingAnalysis(prev => ({ ...prev, [proposalId]: false }));
    }
  }, [loadingAnalysis, proposalAnalysis, BACKEND_URL]); // Added BACKEND_URL dependency


  // Fetch core proposal data (excluding description/evidenceLink from events)
    // Fetch core proposal data (excluding description/evidenceLink from events)
    const fetchProposals = useCallback(async (contractInstance) => {
      if (!contractInstance) return;
      console.log("Fetching core proposals...");
      setLoading(true); // Indicate general loading for proposals
      try {
          const countBigInt = await contractInstance.getProposalsCount();
          const count = Number(countBigInt);
          console.log(`Found ${count} proposals.`);
          const proposalsPromises = [];
          for (let i = 0; i < count; i++) {
              proposalsPromises.push(
                  contractInstance.getProposal(i).then(p => ({
                      id: i, // Add the ID explicitly
                      recipient: p.recipient,
                      // *** FIX: Store the raw BigInt amount from the contract ***
                      amount: p.amount,
                      category: Number(p.category), // Convert BigInt category to number
                      executed: p.executed,
                      timestampCreated: Number(p.timestampCreated) * 1000, // Convert seconds to ms
                      timestampExecuted: p.executed ? Number(p.timestampExecuted) * 1000 : null, // Convert if executed
                  }))
              );
          }
          const proposalsData = await Promise.all(proposalsPromises);
          // Sort proposals, e.g., newest first
          proposalsData.sort((a, b) => b.timestampCreated - a.timestampCreated);
          setProposals(proposalsData);
          console.log("Core proposals fetched:", proposalsData);
      } catch (err) {
          console.error("Fetch core proposals error:", err);
          setNetworkError(`Failed to fetch proposals: ${err.message}`);
          setProposals([]); // Clear proposals on error
      } finally {
          setLoading(false);
      }
  }, []); // No dependencies on state setters like setProposals


  const fetchProposalDetailsFromEvents = useCallback(async (contractInstance) => {
      if (!contractInstance) return;
      console.log("Fetching proposal details from events...");
      try {
          const filter = contractInstance.filters.ProposalCreated();
          // Query events - adjust block range if needed for performance on networks with many blocks
          const events = await contractInstance.queryFilter(filter, 0, 'latest');
          console.log(`Found ${events.length} ProposalCreated events.`);
          const detailsMap = {};
          events.forEach(evt => {
              const id = Number(evt.args.proposalId);
              detailsMap[id] = {
                  description: evt.args.description,
                  evidenceLink: evt.args.evidenceLink // This should be the IPFS CID string
              };
          });
          setProposalDetails(detailsMap);
          console.log("Proposal event details fetched:", detailsMap);
      } catch (err) {
          console.error("Fetch event details error:", err);
          // Optionally set an error state, but maybe less critical than core data failing
      }
  }, []); // No dependencies needed


  // --- Action Handler Callbacks ---
  const handleDonate = useCallback(async (event) => {
    event.preventDefault();
    if (!contract || !signer) return alert("Please connect your wallet first.");
    if (!donationAmount) return alert("Please enter a donation amount.");
    let amountParsed;
    try {
        amountParsed = parseEther(donationAmount);
        if (amountParsed <= 0n) throw new Error("Amount must be positive");
    } catch (err) {
        return alert("Invalid donation amount. Please enter a valid number.");
    }

    setIsDonating(true); setLastTxHash(null);
    try {
      console.log(`Attempting to donate ${donationAmount} ETH...`);
      // No need for contract.connect(signer) for sending ETH directly to payable address/receive function
      const tx = await signer.sendTransaction({
          to: CONTRACT_ADDRESS,
          value: amountParsed
      });
      setLastTxHash(tx.hash);
      alert(`Donation transaction sent (${tx.hash.substring(0,10)}...). Waiting for confirmation...`);
      await tx.wait(); // Wait for transaction confirmation
      alert("Donation successful! Thank you!");
      // Update balance *after* confirmation
      const newBalance = await provider.getBalance(CONTRACT_ADDRESS);
      setContractBalance(formatEther(newBalance));
      setDonationAmount(""); // Clear input field
    } catch (err) {
      console.error("Donation failed:", err);
      alert(`Donation failed: ${err?.reason || err.message}`);
    } finally {
      setIsDonating(false);
    }
  }, [contract, signer, donationAmount, provider]); // Added provider dependency

  const handleProposeWithdrawal = useCallback(async (event) => {
    event.preventDefault();
    if (!contract || !signer) return alert("Wallet not connected");
    if (!proposalRecipient || !proposalAmount || !proposalDescription) return alert("Please fill all proposal fields.");
    if (!isAddress(proposalRecipient)) return alert("Invalid recipient Ethereum address.");

    let amountInWei;
    try {
        amountInWei = parseEther(proposalAmount);
        if (amountInWei <= 0n) throw new Error("Amount must be positive");
    } catch {
        return alert("Invalid proposal amount. Please enter a valid number.");
    }
    // Optional: Check if amount > contract balance? Maybe better done in contract.

    setIsProposing(true);
    setLastTxHash(null);
    let evidenceCID = ''; // Default to empty string if no file or upload fails

    try {
        // Step 1: Upload Evidence File to IPFS (if provided)
        if (proposalEvidenceFile) {
            console.log("Uploading evidence file to IPFS...");
            evidenceCID = await uploadToIPFS(proposalEvidenceFile);
            if (!evidenceCID) {
                // If upload failed but file was selected, inform user but proceed
                alert("Warning: Evidence file upload to IPFS failed. Proceeding without evidence link.");
                evidenceCID = ''; // Ensure it's an empty string for the contract call
            } else {
                console.log("Evidence File IPFS CID:", evidenceCID);
            }
        } else {
            console.log("No evidence file selected.");
            evidenceCID = ''; // Ensure it's an empty string if no file was ever selected
        }

        // Step 2: Create Proposal Transaction on Blockchain
        console.log("Creating proposal transaction on blockchain...");
        const contractWithSigner = contract.connect(signer);

        console.log("Calling proposeWithdrawal with:", proposalRecipient, amountInWei.toString(), proposalCategory, proposalDescription, evidenceCID);

        // Ensure arguments match the contract function signature EXACTLY
        const tx = await contractWithSigner.proposeWithdrawal(
            proposalRecipient,
            amountInWei,
            proposalCategory, // Should be a number (0, 1, 2, 3...)
            proposalDescription,
            evidenceCID // Pass the CID string (or empty string)
        );
        setLastTxHash(tx.hash);
        alert(`Proposal transaction sent (${tx.hash.substring(0,10)}...). Waiting for confirmation...`);

        // Step 3: Wait for Transaction Confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        alert("Proposal created successfully on the blockchain!");

        // Step 4: Extract Proposal ID from Event Logs
        const creationEvent = receipt.logs?.map(log => {
            try { return contract.interface.parseLog(log); } catch { return null; } // Safely parse logs
        }).find(parsedLog =>
            parsedLog?.name === "ProposalCreated" &&
            parsedLog.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
        );

        const newProposalId = creationEvent ? Number(creationEvent.args.proposalId) : null;
        console.log("Detected new blockchain Proposal ID:", newProposalId);

        // Step 5: Trigger Backend Analysis (Asynchronously)
        if (newProposalId !== null && evidenceCID) { // Only trigger if we have an ID and evidence
            try {
                console.log(`Triggering backend analysis for proposal ID: ${newProposalId}`);
                // Send data backend needs to FIND or START analysis (e.g., ID, CID)
                // We don't wait for the backend response here (fire-and-forget)
                 axios.post(`${BACKEND_URL}/trigger-analysis`, {
                    proposalId: newProposalId,
                    cid: evidenceCID, // Send the CID
                    description: proposalDescription, // Send other relevant info if needed
                    recipient: proposalRecipient,
                    amount: proposalAmount, // Send original amount string if helpful
                    category: proposalCategory
                 }).then(response => {
                    console.log(`Backend analysis trigger response for ${newProposalId}:`, response.status);
                 }).catch(linkError => {
                    console.error(`Error triggering backend analysis for ID ${newProposalId}:`, linkError);
                    // Non-blocking error, maybe show a subtle warning later
                 });

            } catch (linkError) {
                 console.error(`Error in analysis trigger setup for ID ${newProposalId}:`, linkError);
                 // Handle setup error if needed
            }
        } else {
             console.warn("Could not determine proposal ID or no evidence CID, skipping backend analysis trigger.");
        }


        // Step 6: Reset Form Fields
        setProposalRecipient('');
        setProposalAmount('');
        setProposalDescription('');
        setProposalCategory(0);
        setProposalEvidenceFile(null);
        // Also reset the file input visually if possible (requires useRef usually)
        const fileInput = document.getElementById('proposal-evidence-file'); // Assuming you give your input an ID
        if (fileInput) fileInput.value = null;


        // Step 7: Refresh Frontend Data (Proposals List & Event Details)
        console.log("Refreshing proposals list and details...");
        // Await fetches to ensure data is updated before potential analysis fetch trigger
        await fetchProposals(contract);
        await fetchProposalDetailsFromEvents(contract);

        // Note: The useEffect watching 'proposals' will automatically call
        // fetchProposalAnalysis for the newProposalId once it appears in the 'proposals' state.
        // If you want instant feedback (even if potentially 404), you could call it here:
        // if (newProposalId !== null) { fetchProposalAnalysis(newProposalId); }

    } catch (error) {
        // Catch errors from IPFS upload or Blockchain transaction
        console.error("Proposal creation process failed:", error);
        alert(`Proposal creation failed: ${error?.reason || error?.data?.message || error.message}`);
    } finally {
        // Step 8: Reset Loading State regardless of success or failure
        setIsProposing(false);
    }
}, [
    contract, signer, proposalRecipient, proposalAmount, proposalCategory,
    proposalDescription, proposalEvidenceFile, fetchProposals,
    fetchProposalDetailsFromEvents, uploadToIPFS, BACKEND_URL, fetchProposalAnalysis // Added fetchProposalAnalysis just in case needed directly
]);


  const handleExecuteProposal = useCallback(async (proposalId) => {
    if (!contract || !signer) return alert("Wallet not connected");
    if (proposalId === undefined || proposalId === null) return alert("Invalid proposal ID provided.");

    // Find proposal to check if already executed (client-side check)
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal?.executed) {
        alert(`Proposal ${proposalId} has already been executed.`);
        return;
    }

    setIsExecuting(prev => ({ ...prev, [proposalId]: true }));
    setLastTxHash(null);
    try {
      console.log(`Attempting to execute proposal ID: ${proposalId}`);
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.executeWithdrawal(proposalId);
      setLastTxHash(tx.hash);
      alert(`Executing proposal ${proposalId} (${tx.hash.substring(0,10)}...). Waiting for confirmation...`);
      await tx.wait(); // Wait for confirmation
      alert(`Proposal ${proposalId} executed successfully!`);

      // Refresh data after execution
      await fetchProposals(contract); // Refreshes proposal status (executed = true)
      const newBalance = await provider.getBalance(CONTRACT_ADDRESS); // Refreshes balance
      setContractBalance(formatEther(newBalance));

    } catch (error) {
      console.error(`Execute proposal ${proposalId} failed:`, error);
      alert(`Execution failed: ${error?.reason || error?.data?.message || error.message}`);
    } finally {
      setIsExecuting(prev => ({ ...prev, [proposalId]: false }));
    }
  }, [contract, signer, provider, fetchProposals, proposals]); // Added provider, fetchProposals, proposals dependency


  const handleTransferOwnership = useCallback(async (event) => {
    event.preventDefault();
    if (!contract || !signer) return alert("Wallet not connected");
    if (!newOwnerAddress) return alert("Please enter the new owner's address.");
    if (!isAddress(newOwnerAddress)) return alert("Invalid Ethereum address provided for the new owner.");
    // Ensure comparison is case-insensitive
    if (account?.toLowerCase() !== contractOwner?.toLowerCase()) {
        return alert("Only the current contract owner can transfer ownership.");
    }
    if (newOwnerAddress.toLowerCase() === account?.toLowerCase()) {
        return alert("You are already the owner.");
    }

    setIsTransferring(true);
    setLastTxHash(null);
    try {
      console.log(`Attempting to transfer ownership to: ${newOwnerAddress}`);
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.transferOwnership(newOwnerAddress);
      setLastTxHash(tx.hash);
      alert(`Transferring ownership (${tx.hash.substring(0,10)}...). Waiting for confirmation...`);
      await tx.wait(); // Wait for confirmation
      alert("Ownership transferred successfully!");

      // Update owner state locally immediately after confirmation
      setContractOwner(newOwnerAddress.toLowerCase());
      setNewOwnerAddress(""); // Clear input field

    } catch (error) {
      console.error("Transfer ownership failed:", error);
      alert(`Transfer failed: ${error?.reason || error?.data?.message || error.message}`);
    } finally {
      setIsTransferring(false);
    }
  }, [contract, signer, account, contractOwner, newOwnerAddress]);

  // --- Effect Hooks ---

  // Cleanup effect for listeners
  useEffect(() => {
    const currentEthereum = window.ethereum; // Capture current instance
    // Define temporary handlers that call the useCallback versions
    const accountHandler = (accounts) => handleAccountsChanged(accounts, provider);
    const chainHandler = handleChainChanged;

    if (currentEthereum?.removeListener) {
        // Clean up listeners attached by previous renders or other components
        currentEthereum.removeListener('accountsChanged', accountHandler);
        currentEthereum.removeListener('chainChanged', chainHandler);
    }

    // Add listeners if provider exists (meaning wallet is likely connected)
    if (provider && currentEthereum?.on) {
        currentEthereum.on('accountsChanged', accountHandler);
        currentEthereum.on('chainChanged', chainHandler);
    }

    // Return cleanup function
    return () => {
      if (currentEthereum?.removeListener) {
        currentEthereum.removeListener('accountsChanged', accountHandler);
        currentEthereum.removeListener('chainChanged', chainHandler);
      }
    };
  }, [provider, handleAccountsChanged, handleChainChanged]); // Rerun when provider or handlers change


  // Initialization and data fetching effect when provider/account changes
  useEffect(() => {
    const initializeContractAndData = async (currentProvider, currentAccount) => {
      if (!currentProvider || !currentAccount) return; // Should not happen if effect runs, but good check

      setNetworkError(null); // Reset network error at start of init
      setContract(null); // Reset contract state
      setProposals([]); // Clear old proposals
      setProposalDetails({});
      setProposalAnalysis({});
      setLoadingAnalysis({});
      setContractOwner(null);
      setContractBalance("0");
      setLoading(true); // Start general loading indicator

      try {
        // Double-check network on init/change
        const network = await currentProvider.getNetwork();
        console.log("Initializing on Network:", network);
        if (network.chainId !== TARGET_CHAIN_ID) {
          setNetworkError(`Please switch MetaMask to ${TARGET_NETWORK_NAME} (Chain ID ${TARGET_CHAIN_ID}). Current: ${network.name} (${network.chainId})`);
          setLoading(false); // Stop loading
          return; // Don't proceed with contract setup
        }

        // Network is correct, setup contract and fetch initial data
        const contractInstance = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, currentProvider);
        setContract(contractInstance); // Set contract state

        // Fetch owner and balance in parallel
        console.log("Fetching owner and balance...");
        const [ownerResult, balanceResult] = await Promise.allSettled([
            contractInstance.owner(),
            currentProvider.getBalance(CONTRACT_ADDRESS)
        ]);

        if (ownerResult.status === 'fulfilled') {
            setContractOwner(ownerResult.value.toLowerCase());
            console.log("Owner fetched:", ownerResult.value);
        } else {
            console.error("Failed to fetch owner:", ownerResult.reason);
            setNetworkError("Failed to fetch contract owner."); // Show specific error
        }

        if (balanceResult.status === 'fulfilled') {
            setContractBalance(formatEther(balanceResult.value));
            console.log("Balance fetched:", formatEther(balanceResult.value));
        } else {
            console.error("Failed to fetch balance:", balanceResult.reason);
            setNetworkError("Failed to fetch contract balance."); // Show specific error
        }

        // Fetch proposals and event details in parallel *after* contract is set
        console.log("Fetching proposals and event details...");
        await Promise.allSettled([
            fetchProposals(contractInstance),
            fetchProposalDetailsFromEvents(contractInstance)
        ]).then(results => {
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`Failed to fetch ${index === 0 ? 'proposals' : 'details'}:`, result.reason);
                    // Set network error, maybe more specific?
                    setNetworkError(`Failed to load initial ${index === 0 ? 'proposals' : 'details'}.`);
                }
            });
        });

      } catch (err) {
        console.error("Initialization Error:", err);
        // Handle potential errors during provider.getNetwork() or Contract instantiation
        if (err.code === 'NETWORK_ERROR') {
             setNetworkError(`Network error during initialization. Check RPC connection. (${err.message})`);
        } else if (err.message.includes("invalid address") || err.code === 'INVALID_ARGUMENT') {
             setNetworkError(`Contract address (${CONTRACT_ADDRESS}) might be invalid.`);
        } else {
             setNetworkError(`Initialization failed: ${err.message}. Check console.`);
        }
        // Reset state completely on major init error
        setContract(null); setContractOwner(null); setContractBalance("0"); setProposals([]); setProposalDetails({});
      } finally {
        setLoading(false); // Stop general loading indicator
      }
    };

    // Trigger initialization only if provider and account are set
    if (provider && account) {
      initializeContractAndData(provider, account);
    } else {
      // Reset state if provider/account becomes null (e.g., disconnect)
      setContract(null); setProposals([]); setProposalDetails({}); setProposalAnalysis({});
      setContractOwner(null); setContractBalance("0"); setNetworkError(null);
      // Keep connection error if it exists
    }
    // Include fetch functions as dependencies since they are defined outside and used inside
  }, [provider, account, fetchProposals, fetchProposalDetailsFromEvents]);


  // Effect to fetch AI analysis when proposals list changes
  useEffect(() => {
    if (proposals.length > 0) {
        console.log("Proposal list updated. Checking for analyses to fetch...");
        proposals.forEach(p => {
            // Check if ID is valid before attempting fetch
            if (p.id !== undefined && p.id !== null) {
                // fetchProposalAnalysis internally checks if fetch is needed
                fetchProposalAnalysis(p.id);
            } else {
                console.warn("Proposal found with invalid ID:", p);
            }
        });
    }
  }, [proposals, fetchProposalAnalysis]); // Run when proposals array or fetch function changes


  // --- Render Layout and Routes ---
  const location = useLocation(); // Get current location for active link styling

  return (
    <div className="App">
      <nav className="app-navbar">
        <div className="navbar-brand">
          {/* Ensure Link wraps the clickable part */}
          <Link to="/" className="navbar-title-link">
            <span className="navbar-title">NEXUS GIVING | </span>
            <span className="navbar-tagline">TRANSPARENCY AND CHARITY</span>
          </Link>
        </div>
        <div className="navbar-links">
            {/* Add active class based on current path */}
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
            <Link to="/how-it-works" className={location.pathname === '/how-it-works' ? 'active' : ''}>How It Works</Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
        </div>
      </nav>

      <main className="app-content">
        {/* Display Errors Prominently */}
        {networkError && <p className="error-message network-error">Network Error: {networkError}</p>}
        {connectionError && <p className="error-message connection-error">Connection Error: {connectionError}</p>}

         {/* Wallet Status Display (Only show connect button if no account) */}
         <section className="card wallet-status-card">
            <h2>Wallet Status</h2>
            {!account ? (
              <button onClick={connectWallet} disabled={loading}>{loading ? 'Connecting...' : 'Connect Wallet'}</button>
            ) : (
              <div>
                <p>Account: <span className="address">{account}</span></p>
                {contractOwner ? (<p>Owner: <span className="address">{contractOwner}</span> {account.toLowerCase() === contractOwner.toLowerCase() && <strong>(You)</strong>}</p>) : (contract && <p>Loading owner...</p>)}
                <p>Balance: <strong>{contractBalance}</strong> WND</p> {/* Adjust currency symbol if needed */}
              </div>
            )}
         </section>

         {/* General Loading Indicator */}
         {loading && !account && <p>Loading wallet connection...</p>}
         {loading && account && <p>Loading contract data...</p>}

        {/* Only render routes/content if connected and on correct network */}
        {account && !networkError && contract && (
          <>
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    // Pass down ALL needed props explicitly
                    account={account}
                    contract={contract}
                    contractOwner={contractOwner}
                    proposals={proposals}
                    proposalDetails={proposalDetails}
                    proposalAnalysis={proposalAnalysis}
                    loadingAnalysis={loadingAnalysis}
                    // Donation Form
                    donationAmount={donationAmount}
                    setDonationAmount={setDonationAmount}
                    handleDonate={handleDonate}
                    isDonating={isDonating}
                    // Proposal Form
                    proposalRecipient={proposalRecipient}
                    setProposalRecipient={setProposalRecipient}
                    proposalAmount={proposalAmount}
                    setProposalAmount={setProposalAmount}
                    proposalCategory={proposalCategory}
                    setProposalCategory={setProposalCategory}
                    proposalDescription={proposalDescription}
                    setProposalDescription={setProposalDescription}
                    proposalEvidenceFile={proposalEvidenceFile} // Pass the file state
                    setProposalEvidenceFile={setProposalEvidenceFile} // Pass the setter
                    handleProposeWithdrawal={handleProposeWithdrawal}
                    isProposing={isProposing}
                    // Proposal List Actions
                    handleExecuteProposal={handleExecuteProposal}
                    isExecuting={isExecuting}
                    // Utility
                    getCategoryName={getCategoryName}
                    formatEther={formatEther} // Pass ethers utils if needed in component
                  />
                }
              />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/about" element={<AboutPage />} />
              {/* Optional 404 for unmatched routes within the app */}
              <Route path="*" element={<h2>404 Page Not Found</h2>} />
            </Routes>

            {/* Owner Section (Only shown if owner is connected and matches contract owner) */}
            {account.toLowerCase() === contractOwner?.toLowerCase() && (
              <section className="card owner-actions-card">
                    <h2>Owner Actions</h2>
                    <form onSubmit={handleTransferOwnership} className="transfer-form">
                         <div>
                            <label htmlFor="newOwner">Transfer Ownership To:</label>
                            <input
                                type="text"
                                id="newOwner"
                                value={newOwnerAddress}
                                onChange={(e) => setNewOwnerAddress(e.target.value)}
                                required
                                placeholder="0x..."
                                className="input-field"
                            />
                         </div>
                         <button
                            type="submit"
                            disabled={isTransferring || !newOwnerAddress || !isAddress(newOwnerAddress)}
                            className="button" // Consistent button styling
                         >
                            {isTransferring ? 'Transferring...' : 'Transfer Ownership'}
                         </button>
                    </form>
              </section>
            )}

            {/* Last Tx Link (Global within connected state) */}
            {lastTxHash && (
              <p className="tx-link">
                Last Tx: <a href={`https://westend-asset-hub.subscan.io/tx/${lastTxHash}`} target="_blank" rel="noopener noreferrer">{lastTxHash.substring(0,10)}...{lastTxHash.substring(lastTxHash.length - 8)}</a>
              </p>
            )}
          </>
        )}

        {/* Show message if wallet connected but network is wrong */}
        {account && networkError && !contract && (
            <p className="info-message">Please switch your wallet's network to continue.</p>
        )}

        {/* Show message if wallet not connected */}
        {!account && !loading && !connectionError && (
             <p className="info-message">Please connect your wallet using the button above to use the dashboard.</p>
        )}

      </main>

      <footer className="app-footer">
          <div className="footer-content">
            <p>© {new Date().getFullYear()} Nexus Giving. All rights reserved.</p>
            {/* Placeholder logos - replace src with actual paths or imports */}
            <div className="footer-logos">
                 <p>Powered by:</p>
                 {/* <a href="https://polkadot.network/" target="_blank" rel="noopener noreferrer"><img src="/path/to/polkadot-logo.png" alt="Polkadot Logo" className="footer-logo" /></a> */}
                 {/* <a href="https://www.easya.io/" target="_blank" rel="noopener noreferrer"><img src="/path/to/easya-logo.png" alt="EasyA Logo" className="footer-logo" /></a> */}
            </div>
          </div>
      </footer>
    </div>
  );
}

export default App;