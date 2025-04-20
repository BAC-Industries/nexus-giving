import React from 'react';
import '../App.css'; // Import shared CSS

function HowItWorksPage() {
  return (
    <div className="page-content"> {/* Wrapper for page content */}
      <section className="card"> {/* Card styling for the section */}
        {/* Updated Title */}
        <h2>How Nexus Giving Works (on Polkadot Asset Hub)</h2>
        <p style={{ marginBottom: '20px' }}>
          Nexus Giving streamlines charity donations using a secure and transparent smart contract deployed on Polkadot's efficient **Asset Hub** parachain. This allows for verifiable transactions and integration within the broader Polkadot ecosystem. Here’s the step-by-step process:
        </p>
        {/* Using an ordered list for the steps */}
        <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>
            <strong>Connect Wallet:</strong>
            <br />
            Begin by connecting your Polkadot-compatible wallet (e.g., Talisman, Polkadot.js extension). Ensure your wallet is set to interact with the specific **Asset Hub network** where this DApp is deployed (e.g., Westend Asset Hub for testing, Polkadot Asset Hub for mainnet). Your unique address links your identity for secure transactions.
          </li>

          <li>
            <strong>Donate Funds (Optional):</strong>
            <br />
            Anyone can contribute funds (like WND for Westend Asset Hub, or potentially DOT/USDT on the main Asset Hub) directly to the Nexus Giving smart contract address. Every donation is an immutable transaction recorded on the **Polkadot Asset Hub blockchain**, ensuring full traceability.
          </li>

          <li>
            <strong>Propose Withdrawal (Owner Only):</strong>
            <br />
            The designated contract owner creates a withdrawal proposal by submitting a transaction to the smart contract on **Asset Hub**. This proposal outlines the intended use, recipient address, and amount requested.
          </li>

          <li>
            <strong>Evidence Upload & Storage:</strong>
            <br />
            Evidence supporting the proposal (invoices, receipts, etc.) is uploaded. This file is stored decentrally using IPFS. The unique content identifier (CID) linking to this evidence *is then stored within the proposal data* on the **Asset Hub blockchain**. Potential details include:
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '5px', marginBottom: '5px' }}>
              <li>Payment references or invoice numbers</li>
              <li>Unique transaction IDs</li>
              <li>Official logos or stamps</li>
              <li>Timestamps</li>
            </ul>
          </li>

          <li>
            <strong>AI Analysis (Informational):</strong>
            <br />
            When a proposal's details (description, evidence CID) are finalized on-chain, the backend can trigger an automated analysis using AI. The AI assesses:
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '5px', marginBottom: '5px' }}>
              <li>Document characteristics against known patterns.</li>
              <li>Consistency and potential signs of alteration.</li>
              <li>Clarity, sentiment, and flags in the description text.</li>
            </ul>
            <strong>Important:</strong> This AI analysis, viewable in the DApp, provides supplementary insights. It aids evaluation but doesn't replace due diligence. It is *not* part of the core on-chain contract logic.
          </li>

          <li>
            <strong>Review Proposal (Transparency on Asset Hub):</strong>
            <br />
            All users can transparently review submitted proposals within the DApp. Crucially, all core proposal data (recipient, amount, status, evidence CID) is publicly verifiable by querying the smart contract directly on **Asset Hub** or using a block explorer (like Subscan) connected to the relevant Asset Hub instance. Review includes:
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '5px', marginBottom: '5px' }}>
              <li>Proposed recipient and amount.</li>
              <li>Description of intent.</li>
              <li>Link to IPFS evidence.</li>
              <li>AI analysis results (via the DApp's backend).</li>
            </ul>
          </li>

          <li>
            <strong>Execute Withdrawal (Owner Only):</strong>
            <br />
            Following review, the contract owner executes an approved proposal by sending another transaction to the smart contract on **Asset Hub**. This transfers funds and updates the proposal's status on the blockchain, ensuring accountable fund disbursement.
          </li>

          <li>
            <strong>Transfer Ownership (Owner Only):</strong>
            <br />
            The current contract owner can securely transfer ownership rights to another **Asset Hub** wallet address. This is also a transparent blockchain transaction, ensuring clear control succession if needed.
          </li>
        </ol>
         <p style={{ marginTop: '20px', fontSize: '0.9em', fontStyle: 'italic' }}>
           By utilizing Polkadot Asset Hub, Nexus Giving benefits from the shared security of the Polkadot network and the ability to interact with various assets within the ecosystem, all while maintaining a transparent ledger of charitable activities.
         </p>
      </section>
    </div>
  );
}

export default HowItWorksPage;