import React from 'react';
// Optional: If you create AboutPage.css, import it here
// import './AboutPage.css';

// Define the functional component
const AboutPage = () => {
  return (
    // Use a React Fragment <>...</> or a single root <div>
    <>
      {/* ======================== */}
      {/*      ABOUT SECTION       */}
      {/* ======================== */}
      <h2>About <span className="project-name">NexusGiving</span></h2>

      <p>
        <span className="project-name">NexusGiving</span> aims to revolutionize charitable donations and treasury management by leveraging the power, transparency, and security of blockchain technology, specifically targeting deployment on <strong>Polkadot Asset Hub</strong>. It provides a robust and efficient platform for receiving funds and managing withdrawals through a clear, owner-controlled proposal system.
      </p>

      <h3>Addressing Key Evaluation Criteria:</h3>
      <ul>
        <li>
            <strong>Innovation and Originality:</strong>
            <span className="project-name">NexusGiving</span> introduces an <strong>innovative gas-optimization technique</strong> by decoupling descriptive metadata (like descriptions and evidence links) from expensive on-chain storage. This data is emitted via events (<code>ProposalCreated</code>), making it fully verifiable and accessible off-chain while significantly reducing transaction costs for proposal creation. This approach has the potential to <strong>significantly improve</strong> the cost-effectiveness of on-chain treasury management compared to traditional methods that store all data directly.
        </li>
        <li>
            <strong>Impact Potential & Feasibility:</strong>
            The solution is highly <strong>applicable</strong> to real-world scenarios, including non-profits, DAOs, community funds, and grant programs requiring transparent fund management. Its <strong>feasibility</strong> is enhanced by using well-audited OpenZeppelin building blocks (<code>Ownable</code>, <code>ReentrancyGuard</code>) and a clear, straightforward smart contract logic. The reduced operational costs enabled by the event-based metadata system lower the barrier to adoption, increasing its <strong>potential impact</strong> across various sectors needing accountable financial oversight. Its deployment on <strong>Polkadot Asset Hub</strong> allows interaction within the broader Polkadot ecosystem.
        </li>
        <li>
            <strong>Use of the Blockchain (Polkadot Asset Hub):</strong>
            <span className="project-name">NexusGiving</span> demonstrates an <strong>effective use of smart contracts on Polkadot Asset Hub</strong> (or its connected parachains) by utilizing the blockchain for:
            <ul>
                <li><strong>Secure Custody:</strong> Holding donated funds immutably within the contract.</li>
                <li><strong>Transparent Ledger:</strong> Recording all donations and executed withdrawals publicly via events (<code>DonationReceived</code>, <code>ProposalExecuted</code>).</li>
                <li><strong>Auditable Governance:</strong> Enforcing a two-step withdrawal process (propose, execute) controlled by a designated owner, with proposal details logged immutably via the <code>ProposalCreated</code> event.</li>
                <li><em>(If applicable)</em> Potential integration with native assets on Asset Hub for donations or withdrawals (requires specific implementation beyond this base Solidity example).</li>
            </ul>
        </li>
        <li>
            <strong>Technical Implementation & Design (Foundation):</strong>
            The underlying contract design prioritizes <strong>robustness, security, and efficiency</strong>. It incorporates:
             <ul>
                <li>Standard security patterns (<code>Ownable</code> for access control, <code>ReentrancyGuard</code> to prevent common attacks).</li>
                <li>The <strong>Checks-Effects-Interactions pattern</strong> in <code>executeWithdrawal</code>.</li>
                <li><strong>Gas efficiency</strong> through custom errors and the event-based metadata approach.</li>
                <li>Clear function separation and state management.</li>
             </ul>
            <em>(Self-Assessment Note: For the competition, ensure your specific Asset Hub contract implementation adheres to these principles and ink!/Substrate best practices).</em>
        </li>
        <li>
            <strong>Usability and Design:</strong> The system is designed for clarity. Donating is straightforward (direct transfer). The proposal system, while owner-controlled, is transparent via events. Off-chain tools can easily index event data (including descriptions/links) to provide a user-friendly interface for tracking proposals and fund usage, ensuring <strong>accessibility and ease of use</strong> for monitoring.
        </li>
      </ul>


      {/* ======================== */}
      {/*   HOW IT WORKS SECTION   */}
      {/* ======================== */}
      <h2>How <span className="project-name">NexusGiving</span> Works</h2>

      <p>
        <span className="project-name">NexusGiving</span> provides a streamlined and secure workflow for managing donated funds on the blockchain (specifically targeting <strong>Polkadot Asset Hub</strong>).
      </p>

      <ol>
        <li>
            <strong>Donations (Enhancing Usability):</strong>
            Anyone can easily donate the native network token (e.g., DOT on Asset Hub, or the native token of the parachain) by sending it directly to the <span className="project-name">NexusGiving</span> contract address. The contract's <code>receive()</code> function automatically accepts the funds. A <code>DonationReceived</code> event is emitted, logging the donor's address and the amount for transparency. This simple process ensures <strong>ease of use</strong> for donors.
        </li>
        <li>
            <strong>Proposing Withdrawals (Owner Control & Innovative Efficiency):</strong>
            The designated contract <code>owner</code> (initially the deployer, transferable) initiates a withdrawal by calling <code>proposeWithdrawal</code>. They provide essential details: recipient address, amount, category (e.g., <code>Salaries</code>, <code>Logistics</code>), and contextual information (<code>description</code>, <code>evidenceLink</code>).
            <strong>Innovation:</strong> The <code>description</code> and <code>evidenceLink</code> strings are <strong>not stored on-chain to save costs</strong>. Instead, they are passed as <code>calldata</code> and immediately <strong>emitted within the <code>ProposalCreated</code> event</strong>. The core proposal data (recipient, amount, category, status) is stored efficiently in the contract's state. This step creates a pending proposal with a unique ID.
        </li>
        <li>
            <strong>Executing Withdrawals (Security & Transparency):</strong>
            To release funds, the <code>owner</code> calls <code>executeWithdrawal</code>, referencing the <code>proposalId</code>.
            <strong>Security & Robustness:</strong> The function performs critical checks:
            <ul>
                <li>Is the <code>proposalId</code> valid? (Reverts with <code>Nexus_ProposalNotFound</code>)</li>
                <li>Has it already been executed? (Reverts with <code>Nexus_AlreadyExecuted</code>)</li>
                <li>Does the contract have sufficient balance? (Reverts with <code>Nexus_InsufficientBalance</code>)</li>
                <li>It employs the <code>nonReentrant</code> modifier to prevent reentrancy attacks during the transfer.</li>
            </ul>
            Following the <strong>Checks-Effects-Interactions pattern</strong>, the proposal state is marked as <code>executed</code> <em>before</em> the external call (Ether transfer). The specified <code>amount</code> is transferred to the <code>recipient</code>. If the transfer fails, it reverts (<code>Nexus_TransferFailed</code>). A <code>ProposalExecuted</code> event is emitted, logging the executed proposal's ID, recipient, and amount, providing a clear audit trail.
        </li>
        <li>
            <strong>Accessing Information (Usability & Design):</strong>
            Anyone can query the contract's total balance (<code>getBalance</code>) or the number of proposals (<code>getProposalsCount</code>). Details of a specific proposal (recipient, amount, category, status, timestamps) can be fetched using <code>getProposal(proposalId)</code>.
            <strong>Key Design Point:</strong> To retrieve the full proposal context (<code>description</code>, <code>evidenceLink</code>), applications or users must <strong>query the blockchain's event logs</strong> for the corresponding <code>ProposalCreated</code> event, filtering by <code>proposalId</code>. This separation ensures on-chain efficiency while maintaining data availability, contributing to a well-designed system balancing cost and <strong>usability</strong> for monitoring tools.
        </li>
        <li>
            <strong>Deployment Context (Use of Blockchain):</strong>
            This entire workflow is orchestrated by the smart contract deployed on <strong>Polkadot Asset Hub</strong> (or a connected EVM chain), leveraging its security and consensus mechanisms to ensure the integrity of the treasury operations. <em>(Ensure your submission details your specific deployment and contract on Asset Hub).</em>
        </li>
      </ol>
    </> // End of React Fragment
  );
};

// Export the component for use in other parts of your app
export default AboutPage;