// A:\Nexus Giving\nexus-giving\src\components\TransferOwnership.jsx
import React, { useState } from 'react';
import { isAddress } from 'ethers'; // Import for validation

const TransferOwnership = ({ onTransfer, currentOwner, disabled }) => {
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(''); // Clear previous errors

    if (!isAddress(newOwnerAddress)) {
      setLocalError('Invalid Ethereum address format.');
      return;
    }

    if (currentOwner && newOwnerAddress.toLowerCase() === currentOwner.toLowerCase()) {
      setLocalError('New owner address cannot be the same as the current owner.');
      return;
    }

    // Call the handler function passed from App.js
    // The actual contract interaction and success/error handling happens there
    onTransfer(newOwnerAddress);
     // Optional: Clear input field immediately after trying to submit
     // setNewOwnerAddress('');
     // Let App.js clear it on success for better UX
  };

  return (
    <div className="transfer-ownership-component"> {/* Optional wrapper class */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="newOwnerInput">New Owner Address:</label> <br />
          <input
            type="text"
            id="newOwnerInput" // Use unique ID if needed
            value={newOwnerAddress}
            onChange={(e) => {
                setNewOwnerAddress(e.target.value);
                setLocalError(''); // Clear error on input change
            }}
            placeholder="0x..."
            required
            style={{ width: '90%', marginTop: '5px' }}
          />
        </div>
        {localError && <p style={{ color: '#ff8a8a', fontSize: '0.9em', marginTop: '5px' }}>{localError}</p>}
        <button
          type="submit"
          disabled={disabled || !newOwnerAddress || !!localError} // Disable if loading, no input, or local error
          style={{ marginTop: '10px' }}
        >
          {disabled ? 'Transferring...' : 'Transfer Ownership'}
        </button>
      </form>
    </div>
  );
};

export default TransferOwnership;