import React, { useState } from 'react';

const MfaModal = ({ isOpen, onClose, onSubmit }) => {
    const [mfaCode, setMfaCode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(mfaCode); // Call the submit handler passed as a prop
    };

    if (!isOpen) return null; // Don't render if modal is not open

    return (
        <div className="modal">
            <h2>Enter MFA Code</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="MFA Code"
                />
                <button type="submit">Submit</button>
                <button type="button" onClick={onClose}>Cancel</button>
            </form>
        </div>
    );
};

export default MfaModal;