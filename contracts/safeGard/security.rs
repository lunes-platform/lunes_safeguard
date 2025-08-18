/// Security modules for Safeguard contract
/// Replaces OpenBrush functionality with secure, audited implementations

use ink::storage::Mapping;
use scale::{Decode, Encode};

/// Storage keys following EIP-1967 inspired pattern for upgradeable contracts
/// Using manual keys to prevent storage layout overlap (OpenZeppelin recommendation)
pub mod storage_keys {
    /// Owner storage slot - 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc
    pub const OWNER_SLOT: [u8; 32] = [
        0x36, 0x08, 0x94, 0xa1, 0x3b, 0xa1, 0xa3, 0x21, 0x06, 0x67, 0xc8, 0x28, 0x49, 0x2d,
        0xb9, 0x8d, 0xca, 0x3e, 0x20, 0x76, 0xcc, 0x37, 0x35, 0xa9, 0x20, 0xa3, 0xca, 0x50,
        0x5d, 0x38, 0x2b, 0xbc,
    ];

    /// Reentrancy guard storage slot - 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbd
    pub const REENTRANCY_SLOT: [u8; 32] = [
        0x36, 0x08, 0x94, 0xa1, 0x3b, 0xa1, 0xa3, 0x21, 0x06, 0x67, 0xc8, 0x28, 0x49, 0x2d,
        0xb9, 0x8d, 0xca, 0x3e, 0x20, 0x76, 0xcc, 0x37, 0x35, 0xa9, 0x20, 0xa3, 0xca, 0x50,
        0x5d, 0x38, 0x2b, 0xbd,
    ];

    /// Vote data storage slot - 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbe
    pub const VOTE_DATA_SLOT: [u8; 32] = [
        0x36, 0x08, 0x94, 0xa1, 0x3b, 0xa1, 0xa3, 0x21, 0x06, 0x67, 0xc8, 0x28, 0x49, 0x2d,
        0xb9, 0x8d, 0xca, 0x3e, 0x20, 0x76, 0xcc, 0x37, 0x35, 0xa9, 0x20, 0xa3, 0xca, 0x50,
        0x5d, 0x38, 0x2b, 0xbe,
    ];

    /// Withdrawal data storage slot - 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbf
    pub const WITHDRAWAL_SLOT: [u8; 32] = [
        0x36, 0x08, 0x94, 0xa1, 0x3b, 0xa1, 0xa3, 0x21, 0x06, 0x67, 0xc8, 0x28, 0x49, 0x2d,
        0xb9, 0x8d, 0xca, 0x3e, 0x20, 0x76, 0xcc, 0x37, 0x35, 0xa9, 0x20, 0xa3, 0xca, 0x50,
        0x5d, 0x38, 0x2b, 0xbf,
    ];
}

/// Custom error types replacing PSP22Error
#[derive(Debug, PartialEq, Eq, Clone, Encode, Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum SafeguardError {
    /// Access control errors
    NotOwner,
    /// Contract state errors
    ContractNotActive,
    WithdrawalNotActive,
    VotingNotActive,
    /// User errors
    InsufficientBalance,
    AlreadyVoted,
    InvalidAmount,
    InvalidAccount,
    /// Security errors
    ReentrancyDetected,
    ArithmeticOverflow,
    ArithmeticUnderflow,
    /// Input validation errors
    InvalidInput,
    ZeroAddress,
}

impl From<SafeguardError> for ink::LangError {
    fn from(error: SafeguardError) -> Self {
        match error {
            SafeguardError::NotOwner => ink::LangError::CouldNotReadInput,
            SafeguardError::ReentrancyDetected => ink::LangError::CouldNotReadInput,
            _ => ink::LangError::CouldNotReadInput,
        }
    }
}

/// Events for transparency and monitoring
#[ink::event]
pub struct OwnershipTransferred {
    #[ink(topic)]
    pub previous_owner: Option<AccountId>,
    #[ink(topic)]
    pub new_owner: AccountId,
}

#[ink::event]
pub struct VotingActivated {
    #[ink(topic)]
    pub vote_id: u64,
    pub minimum_balance: Balance,
    pub end_time: u64,
}

#[ink::event]
pub struct VoteCast {
    #[ink(topic)]
    pub voter: AccountId,
    #[ink(topic)]
    pub vote_id: u64,
    pub vote_value: bool,
}

#[ink::event]
pub struct VotingFinished {
    #[ink(topic)]
    pub vote_id: u64,
    pub yes_votes: u64,
    pub no_votes: u64,
}

#[ink::event]
pub struct WithdrawalActivated {
    #[ink(topic)]
    pub vote_id: u64,
    pub balance_per_lunes: Balance,
}

#[ink::event]
pub struct WithdrawalExecuted {
    #[ink(topic)]
    pub account: AccountId,
    pub amount: Balance,
}

/// Custom Ownable implementation with manual storage
#[derive(Default, Encode, Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub struct OwnableData {
    pub owner: Option<AccountId>,
}

impl OwnableData {
    /// Initialize with owner
    pub fn init_with_owner(&mut self, owner: AccountId) {
        self.owner = Some(owner);
    }

    /// Get current owner
    pub fn owner(&self) -> Option<AccountId> {
        self.owner
    }

    /// Transfer ownership (only current owner can call)
    pub fn transfer_ownership(&mut self, caller: AccountId, new_owner: AccountId) -> Result<(), SafeguardError> {
        // Validate caller is current owner
        if self.owner != Some(caller) {
            return Err(SafeguardError::NotOwner);
        }

        // Validate new owner is not zero address
        if new_owner == AccountId::from([0u8; 32]) {
            return Err(SafeguardError::ZeroAddress);
        }

        let previous_owner = self.owner;
        self.owner = Some(new_owner);

        // Emit event (would be done in contract implementation)
        Ok(())
    }

    /// Modifier equivalent - check if caller is owner
    pub fn ensure_owner(&self, caller: AccountId) -> Result<(), SafeguardError> {
        if self.owner != Some(caller) {
            return Err(SafeguardError::NotOwner);
        }
        Ok(())
    }
}

/// Custom ReentrancyGuard implementation
#[derive(Default, Encode, Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub struct ReentrancyGuard {
    pub entered: bool,
}

impl ReentrancyGuard {
    /// Start reentrancy protection
    pub fn start(&mut self) -> Result<(), SafeguardError> {
        if self.entered {
            return Err(SafeguardError::ReentrancyDetected);
        }
        self.entered = true;
        Ok(())
    }

    /// End reentrancy protection
    pub fn end(&mut self) {
        self.entered = false;
    }

    /// Check if currently entered
    pub fn is_entered(&self) -> bool {
        self.entered
    }
}

/// Macro for reentrancy protection
#[macro_export]
macro_rules! non_reentrant {
    ($guard:expr, $body:block) => {{
        $guard.start()?;
        let result = $body;
        $guard.end();
        result
    }};
}

/// Arithmetic operations with overflow protection
pub mod safe_math {
    use super::SafeguardError;

    /// Safe addition with overflow check
    pub fn safe_add(a: u64, b: u64) -> Result<u64, SafeguardError> {
        a.checked_add(b).ok_or(SafeguardError::ArithmeticOverflow)
    }

    /// Safe subtraction with underflow check
    pub fn safe_sub(a: u64, b: u64) -> Result<u64, SafeguardError> {
        a.checked_sub(b).ok_or(SafeguardError::ArithmeticUnderflow)
    }

    /// Safe multiplication with overflow check
    pub fn safe_mul(a: u64, b: u64) -> Result<u64, SafeguardError> {
        a.checked_mul(b).ok_or(SafeguardError::ArithmeticOverflow)
    }

    /// Safe division with zero check
    pub fn safe_div(a: u64, b: u64) -> Result<u64, SafeguardError> {
        if b == 0 {
            return Err(SafeguardError::ArithmeticOverflow);
        }
        Ok(a / b)
    }

    /// Safe addition for Balance type
    pub fn safe_add_balance(a: Balance, b: Balance) -> Result<Balance, SafeguardError> {
        a.checked_add(b).ok_or(SafeguardError::ArithmeticOverflow)
    }

    /// Safe subtraction for Balance type
    pub fn safe_sub_balance(a: Balance, b: Balance) -> Result<Balance, SafeguardError> {
        a.checked_sub(b).ok_or(SafeguardError::ArithmeticUnderflow)
    }
}

/// Input validation utilities
pub mod validation {
    use super::SafeguardError;

    /// Validate account is not zero address
    pub fn validate_account(account: AccountId) -> Result<(), SafeguardError> {
        if account == AccountId::from([0u8; 32]) {
            return Err(SafeguardError::ZeroAddress);
        }
        Ok(())
    }

    /// Validate amount is not zero
    pub fn validate_amount(amount: Balance) -> Result<(), SafeguardError> {
        if amount == 0 {
            return Err(SafeguardError::InvalidAmount);
        }
        Ok(())
    }

    /// Validate timestamp is in future
    pub fn validate_future_timestamp(timestamp: u64, current: u64) -> Result<(), SafeguardError> {
        if timestamp <= current {
            return Err(SafeguardError::InvalidInput);
        }
        Ok(())
    }
}
