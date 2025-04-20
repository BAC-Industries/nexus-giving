// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // Keep using your target version

import "@openzeppelin/contracts/access/Ownable.sol";
// Removed: import "@openzeppelin/contracts/security/Pausable.sol"; // Already removed
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ----------- Custom Errors -----------
error Nexus_ZeroAddress();
error Nexus_ZeroAmount();
error Nexus_ProposalNotFound();
error Nexus_AlreadyExecuted();
error Nexus_InsufficientBalance();
error Nexus_TransferFailed();


/**
 * @title NexusGiving Treasury Contract (Size Optimized V2 - Strings Removed)
 * @dev Manages donations and admin-controlled withdrawals via proposals.
 * Features: Donations, Proposals (Create/Execute), Ownable, ReentrancyGuard.
 * Description/EvidenceLink data is emitted in events, not stored in struct.
 */
contract NexusGiving is Ownable, ReentrancyGuard {

    // ----------- Enums -----------
    enum Category {
        MedicalSupplies, Salaries, Logistics, Operations, ProgramX, Other
    }

    // ----------- Structs -----------
    // REMOVED description and evidenceLink strings from storage
    struct Proposal {
        address payable recipient;
        uint256 amount;
        Category category;
        // string description; // REMOVED
        // string evidenceLink; // REMOVED
        bool executed;
        uint256 timestampCreated;
        uint256 timestampExecuted;
    }

    // ----------- State Variables -----------
    // Internal array + specific getter below saves some bytecode vs public array
    Proposal[] internal proposals;

    // ----------- Events -----------
    event DonationReceived(address indexed donor, uint256 amount);
    // ADDED description and evidenceLink strings to the event ONLY
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed recipient,
        uint256 amount,
        Category category,
        string description, // ADDED TO EVENT
        string evidenceLink // ADDED TO EVENT
    );
    event ProposalExecuted(uint256 indexed proposalId, address indexed recipient, uint256 amount);
    // Note: OwnershipTransferred event is emitted by Ownable contract

    // ----------- Constructor -----------
    constructor() Ownable(msg.sender) {}

    // ----------- Receive Ether -----------
    receive() external payable {
        emit DonationReceived(msg.sender, msg.value);
    }

    // ----------- Core Functions -----------

    /**
     * @dev Allows the owner to propose a withdrawal.
     * Strings are taken as calldata but ONLY emitted in the event, not stored.
     * Changed visibility to external (slightly smaller than public).
     */
    function proposeWithdrawal(
        address payable _recipient,
        uint256 _amount,
        Category _category,
        string calldata _description, // Use calldata for input strings
        string calldata _evidenceLink // Use calldata for input strings
    ) external onlyOwner { // Changed to external
        if (_recipient == address(0)) revert Nexus_ZeroAddress();
        if (_amount == 0) revert Nexus_ZeroAmount();

        uint256 proposalId = proposals.length;

        // Push struct WITHOUT the strings
        proposals.push(Proposal({
            recipient: _recipient,
            amount: _amount,
            category: _category,
            // description: _description, // DO NOT STORE
            // evidenceLink: _evidenceLink, // DO NOT STORE
            executed: false,
            timestampCreated: block.timestamp,
            timestampExecuted: 0
        }));

        // Emit the event WITH the strings
        emit ProposalCreated(
            proposalId,
            _recipient,
            _amount,
            _category,
            _description, // Emit description
            _evidenceLink // Emit evidence link
        );
    }

    /**
     * @dev Allows the owner to execute a pending proposal.
     * Changed visibility to external.
     */
    function executeWithdrawal(uint256 _proposalId) external onlyOwner nonReentrant { // Changed to external
        if (_proposalId >= proposals.length) revert Nexus_ProposalNotFound();

        Proposal storage proposal = proposals[_proposalId]; // Access internal state

        if (proposal.executed) revert Nexus_AlreadyExecuted();
        if (address(this).balance < proposal.amount) revert Nexus_InsufficientBalance();

        // --- Actions ---
        proposal.executed = true; // State change before external call
        proposal.timestampExecuted = block.timestamp;

        (bool success, ) = proposal.recipient.call{value: proposal.amount}("");
        if (!success) revert Nexus_TransferFailed();

        emit ProposalExecuted(_proposalId, proposal.recipient, proposal.amount);
    }

    // ----------- View Functions -----------

    /**
     * @dev Returns the contract's current balance.
     */
    function getBalance() external view returns (uint256) { // Changed to external
        return address(this).balance;
    }

    /**
     * @dev Returns the total number of proposals created.
     */
    function getProposalsCount() external view returns (uint256) { // Changed to external
        return proposals.length;
    }

    /**
      * @dev Returns details of a specific proposal by its ID.
      * Now returns the smaller struct WITHOUT string fields.
      * Frontend must get strings from ProposalCreated event logs.
      */
    function getProposal(uint256 _proposalId) external view returns (Proposal memory) { // Changed to external
        if (_proposalId >= proposals.length) revert Nexus_ProposalNotFound();
        return proposals[_proposalId]; // Returns the struct without strings
    }

}