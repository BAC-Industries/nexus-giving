import React from 'react';
import { formatEther, isAddress } from 'ethers'; // Import necessary functions
import '../App.css'; // Import shared CSS

// Import helper functions if they were defined outside App.js
// function getCategoryName(categoryId) { /* ... */ }

// Accept props passed down from App.js
function HomePage({
  account,
  contract,
  contractOwner,
  contractBalance,
  proposals,
  proposalDetails,
  proposalAnalysis,
  loadingAnalysis,
  donationAmount, setDonationAmount, handleDonate, isDonating,
  proposalRecipient, setProposalRecipient,
  proposalAmount, setProposalAmount,
  proposalCategory, setProposalCategory,
  proposalDescription, setProposalDescription,
  proposalEvidenceFile, setProposalEvidenceFile, // Make sure App.js passes these down
  handleProposeWithdrawal, isProposing,
  handleExecuteProposal, isExecuting,
  getCategoryName // Pass down if needed
}) {

  return (
    <> {/* Use Fragment to avoid extra div */}
        {/* --- Wallet Connection Section (Display Logic remains) --- */}
        {/* This section might be better kept in App.js layout */}
        {/* Or passed down account/owner/balance to display here */}

        {/* --- Donate Section --- */}
       {account && contract && (
         <section className="card">
            <h2>Donate Funds to Contract</h2>
            <form onSubmit={handleDonate}>
              <div><label htmlFor="donationAmount">Amount (WND):</label><input type="number" id="donationAmount" step="any" min="0" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} required placeholder="e.g., 1.5" className="input-field"/></div>
              <button type="submit" disabled={isDonating || !donationAmount}>{isDonating ? 'Processing...' : 'Donate'}</button>
            </form>
         </section>
        )}

        {/* --- Propose Withdrawal Section --- */}
        {account && contract && account === contractOwner && (
          <section className="card">
            <h2>Propose a Withdrawal</h2>
            <form onSubmit={handleProposeWithdrawal}>
              <div><label htmlFor="proposalRecipient">Recipient Address:</label><input type="text" id="proposalRecipient" value={proposalRecipient} onChange={(e) => setProposalRecipient(e.target.value)} required placeholder="0x..." className="input-field"/></div>
              <div><label htmlFor="proposalAmount">Amount (WND):</label><input type="number" id="proposalAmount" step="any" min="0" value={proposalAmount} onChange={(e) => setProposalAmount(e.target.value)} required placeholder="e.g., 0.1" className="input-field"/></div>
              <div><label htmlFor="proposalCategory">Category:</label><select id="proposalCategory" value={proposalCategory} onChange={(e) => setProposalCategory(Number(e.target.value))} className="input-field"><option value="0">General</option><option value="1">Emergency</option><option value="2">Infrastructure</option><option value="3">Community</option></select></div>
              <div><label htmlFor="proposalDescription">Description/Justification:</label><textarea id="proposalDescription" rows="3" value={proposalDescription} onChange={(e) => setProposalDescription(e.target.value)} required placeholder="Reason..." className="input-field"/></div>
              <div><label htmlFor="proposalEvidenceFile">Evidence File:</label><input type="file" id="proposalEvidenceFile"   className="input-field"/></div>
              <button type="submit" disabled={isProposing || !proposalRecipient || !proposalAmount || !proposalDescription}>{isProposing ? 'Submitting...' : 'Submit Proposal'}</button>
            </form>
          </section>
        )}

        {/* --- Proposals List Section --- */}
        <section className="card">
            <h2>Withdrawal Proposals & History</h2>
            {/* Conditional rendering based on props */}
             {proposals.length === 0 && contract && <p>No proposals created yet.</p>}
             {!contract && account && <p>Initializing contract...</p> }
             {!account && <p>Connect wallet to view proposals.</p>}

             {proposals.map(proposal => {
               const details = proposalDetails[proposal.id] || {};
               const analysis = proposalAnalysis[proposal.id];
               const isLoadingAnalysis = loadingAnalysis[proposal.id];
               const isExecutingThis = isExecuting[proposal.id];
               const canExecute = account === contractOwner && !proposal.executed;
               const ipfsGatewayUrl = details.evidenceLink ? `https://ipfs.io/ipfs/${details.evidenceLink}` : null;

               return (
                 <div key={proposal.id} className={`proposal-card ${proposal.executed ? 'executed' : 'pending'}`}>
                    <p><strong>ID:</strong> {proposal.id}</p>
                    <p><strong>Recipient:</strong> <span className="address">{proposal.recipient}</span></p>
                    <p><strong>Amount:</strong> {formatEther(proposal.amount)} WND</p>
                    <p><strong>Category:</strong> {getCategoryName(proposal.category)}</p>
                    <p><strong>Created:</strong> {new Date(Number(proposal.timestampCreated) * 1000).toLocaleString()}</p>
                    <p><strong>Status:</strong> {proposal.executed ? `Executed (${new Date(Number(proposal.timestampExecuted) * 1000).toLocaleString()})` : 'Pending'}</p>
                    <p><strong>Description:</strong> {details.description || (proposalDetails[proposal.id] === undefined ? 'Loading...' : 'N/A')}</p>
                    <p><strong>Evidence:</strong>{' '}{ipfsGatewayUrl ? (<a href={ipfsGatewayUrl} target="_blank" rel="noopener noreferrer">View on IPFS</a>) : (proposalDetails[proposal.id] === undefined ? 'Loading...' : 'N/A')}</p>
                    <div className="ai-analysis">
  <h4>AI Analysis Results:</h4>
  {isLoadingAnalysis ? (
    <p>Loading analysis...</p>
  ) : analysis ? (
    analysis.error ? (
      <p className="error-message">{analysis.error}</p>
    ) : (
      <div>
        <p><strong>Summary:</strong> {analysis.descriptionAnalysis?.summary}</p>
        <p><strong>Clarity Score:</strong> {analysis.descriptionAnalysis?.clarity_score}</p>
        <p><strong>Legitimacy Score:</strong> {analysis.descriptionAnalysis?.legitimacy_score}</p>
        <p><strong>Sentiment:</strong> {analysis.descriptionAnalysis?.sentiment}</p>
        <p><strong>Flags:</strong> {analysis.descriptionAnalysis?.flags.join(', ')}</p>
        <p><strong>Wallet Risk Score:</strong> {analysis.addressAnalysis?.riskScore}</p>
        <p><strong>Wallet Flags:</strong> {analysis.addressAnalysis?.flags.join(', ') || 'None'}</p>
      </div>
    )
  ) : (
    <p>No analysis data available.</p>
  )}
</div>


                   {canExecute && ( /* Execute Button */
                     <button onClick={() => handleExecuteProposal(proposal.id)} disabled={isExecutingThis} className="execute-button">{isExecutingThis ? 'Executing...' : 'Execute Withdrawal'}</button>
                   )}
                 </div>
               );
             })}
        </section>

         {/* Note: Transfer Ownership might also stay in App.js or be passed down */}
    </>
  );
}

export default HomePage;