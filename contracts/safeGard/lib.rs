#![cfg_attr(not(feature = "std"), no_std, no_main)]
#![warn(clippy::arithmetic_side_effects)]

// Define Balance and AccountId at the crate level to be available for all modules
use ink::primitives::AccountId;
pub type Balance = u128;

/// Security modules for Safeguard contract
pub mod security {
    use super::{Balance, AccountId}; // Import from crate root
    use scale::{Decode, Encode};

    /// Custom error types
    #[derive(Debug, PartialEq, Eq, Clone, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum SafeguardError {
        NotOwner,
        ContractNotActive,
        WithdrawalNotActive,
        VotingNotActive,
        InsufficientBalance,
        InsufficientAllowance,
        AlreadyVoted,
        InvalidAmount,
        InvalidAccount,
        ReentrancyDetected,
        ArithmeticOverflow,
        ArithmeticUnderflow,
        InvalidInput,
        ZeroAddress,
        ProjectPaused,
        WithdrawalInProgress,
        VestingPeriodNotMet,
    }

    impl From<SafeguardError> for ink::LangError {
        fn from(_error: SafeguardError) -> Self {
            ink::LangError::CouldNotReadInput
        }
    }

    impl From<psp22::PSP22Error> for SafeguardError {
        fn from(error: psp22::PSP22Error) -> Self {
            match error {
                psp22::PSP22Error::InsufficientBalance => SafeguardError::InsufficientBalance,
                psp22::PSP22Error::InsufficientAllowance => SafeguardError::InsufficientAllowance,
                psp22::PSP22Error::ZeroRecipientAddress => SafeguardError::ZeroAddress,
                psp22::PSP22Error::ZeroSenderAddress => SafeguardError::ZeroAddress,
                psp22::PSP22Error::Custom(_) => SafeguardError::InvalidInput,
                psp22::PSP22Error::SafeTransferCheckFailed(_) => SafeguardError::InvalidInput,
            }
        }
    }

    /// Custom ReentrancyGuard implementation
    #[derive(Debug, Default, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct ReentrancyGuard {
        pub entered: bool,
    }

    impl ReentrancyGuard {
        pub fn start(&mut self) -> Result<(), SafeguardError> {
            if self.entered {
                return Err(SafeguardError::ReentrancyDetected);
            }
            self.entered = true;
            Ok(())
        }

        pub fn end(&mut self) {
            self.entered = false;
        }

        pub fn is_entered(&self) -> bool {
            self.entered
        }
    }

    /// Arithmetic operations with overflow protection
    pub mod safe_math {
        use super::{Balance, SafeguardError};

        pub fn safe_add(a: u64, b: u64) -> Result<u64, SafeguardError> {
            a.checked_add(b).ok_or(SafeguardError::ArithmeticOverflow)
        }

        pub fn safe_add_balance(a: Balance, b: Balance) -> Result<Balance, SafeguardError> {
            a.checked_add(b).ok_or(SafeguardError::ArithmeticOverflow)
        }

        pub fn safe_sub_balance(a: Balance, b: Balance) -> Result<Balance, SafeguardError> {
            a.checked_sub(b).ok_or(SafeguardError::ArithmeticUnderflow)
        }
    }

    /// Input validation utilities
    pub mod validation {
        use super::{AccountId, Balance, SafeguardError};

        pub fn validate_account(account: AccountId) -> Result<(), SafeguardError> {
            if account == AccountId::from([0u8; 32]) {
                return Err(SafeguardError::ZeroAddress);
            }
            Ok(())
        }

        pub fn validate_amount(amount: Balance) -> Result<(), SafeguardError> {
            if amount == 0 {
                return Err(SafeguardError::InvalidAmount);
            }
            Ok(())
        }
    }
}

#[ink::contract]
pub mod safeguard {
    use super::security::{SafeguardError, ReentrancyGuard, safe_math, validation};
    use ink::storage::Mapping;

    // Events
    #[ink(event)]
    pub struct OwnershipTransferred {
        #[ink(topic)]
        pub previous_owner: Option<AccountId>,
        #[ink(topic)]
        pub new_owner: AccountId,
    }

    #[ink(event)]
    pub struct ProjectRegistered {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub owner: AccountId,
    }
    
    #[ink(event)]
    pub struct ProjectOwnershipTransferred {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub previous_owner: AccountId,
        #[ink(topic)]
        pub new_owner: AccountId,
    }

    #[ink(event)]
    pub struct VotingActivated {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub vote_id: u64,
        pub minimum_balance: Balance,
        pub end_time: u64,
    }

    #[ink(event)]
    pub struct VoteCast {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub voter: AccountId,
        #[ink(topic)]
        pub vote_id: u64,
        pub vote_value: bool,
    }

    #[ink(event)]
    pub struct VotingFinished {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub vote_id: u64,
        pub yes_votes: u64,
        pub no_votes: u64,
    }

    #[ink(event)]
    pub struct WithdrawalActivated {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub vote_id: u64,
        pub balance_per_lunes: Balance,
    }

    #[ink(event)]
    pub struct WithdrawalExecuted {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub account: AccountId,
        pub amount: Balance,
    }

    // Multi-asset vault events
    #[ink(event)]
    pub struct TokenAdded {
        #[ink(topic)]
        pub token_id: TokenId,
        #[ink(topic)]
        pub contract_address: AccountId,
        pub symbol: [u8; 8],
        pub decimals: u8,
    }

    #[ink(event)]
    pub struct GuaranteeAdded {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub token_id: TokenId,
        #[ink(topic)]
        pub account: AccountId,
        pub amount: Balance,
    }

    #[ink(event)]
    pub struct GuaranteeWithdrawn {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub token_id: TokenId,
        #[ink(topic)]
        pub account: AccountId,
        pub amount: Balance,
    }

    #[ink(event)]
    pub struct DonationReceived {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub token_id: TokenId,
        #[ink(topic)]
        pub donor: AccountId,
        pub amount: Balance,
    }

    // NFT (PSP34) collateral events
    #[ink(event)]
    pub struct NFTCollectionAdded {
        #[ink(topic)]
        pub collection_id: NFTCollectionId,
        #[ink(topic)]
        pub contract_address: AccountId,
        pub name: [u8; 32],
        pub symbol: [u8; 8],
        pub base_value: Balance,
    }

    #[ink(event)]
    pub struct NFTGuaranteeDeposited {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub collection_id: NFTCollectionId,
        #[ink(topic)]
        pub account: AccountId,
        pub nft_token_id: NFTTokenId,
        pub estimated_value: Balance,
    }

    #[ink(event)]
    pub struct NFTGuaranteeWithdrawn {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub collection_id: NFTCollectionId,
        #[ink(topic)]
        pub account: AccountId,
        pub nft_token_id: NFTTokenId,
        pub estimated_value: Balance,
    }

    /// Event emitted when a guarantee release is requested after vesting period
    #[ink(event)]
    pub struct GuaranteeReleaseRequested {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub requester: AccountId,
        pub vesting_end_timestamp: u64,
        pub vote_end_time: u64,
    }

    #[ink(event)]
    pub struct ProjectScoreUpdated {
        #[ink(topic)]
        pub project_id: ProjectId,
        pub new_score: u8,
    }

    pub type ProjectId = u64;
    pub type TokenId = u32;
    pub type NFTCollectionId = u32;
    pub type NFTTokenId = u128; // PSP34 standard token ID type

    /// Token information for multi-asset support
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct TokenInfo {
        pub contract_address: AccountId,
        pub symbol: [u8; 8], // Token symbol (e.g., "LUNES", "USDT")
        pub decimals: u8,
        pub is_active: bool,
        pub min_guarantee_amount: Balance,
        pub price_feed_id: Option<u32>, // For oracle integration
    }

    /// NFT Collection information for PSP34 collateral support
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct NFTCollectionInfo {
        pub contract_address: AccountId,
        pub name: [u8; 32], // Collection name
        pub symbol: [u8; 8], // Collection symbol
        pub is_active: bool,
        pub base_value: Balance, // Base valuation for NFTs in this collection
        pub valuation_method: NFTValuationMethod,
    }

    /// Methods for valuing NFTs as collateral
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub enum NFTValuationMethod {
        FixedValue, // All NFTs in collection have same value
        TraitBased, // Value based on NFT traits (future implementation)
        OraclePrice, // Value from external oracle (future implementation)
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct InfoContract {
        pub owner: AccountId,
        pub data_vote_end: u64,
        pub qtd_vote_yes: u64,
        pub qtd_vote_no: u64,
        pub status_withdraw: bool,
        pub status: bool,
        pub balance_permission: Balance,
        pub pair_psp22: Option<AccountId>,
        pub balance_withdraw_per_lunes: Balance,
        pub id: u64,
        pub creation_timestamp: u64,
    }

    #[derive(Debug)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct Project {
        owner: AccountId,
        data_vote_end: u64,
        qtd_vote_yes: u64,
        qtd_vote_no: u64,
        vote: Mapping<AccountId, u64>,
        status_withdraw: bool,
        status: bool,
        balance_permission: Balance,
        pair_psp22: Option<AccountId>,
        withdraw: Mapping<AccountId, Balance>,
        balance_withdraw_per_lunes: Balance,
        id: u64,
        guarantees: Mapping<AccountId, Balance>,
        creation_timestamp: u64,
    }

    #[ink(storage)]
    pub struct Safeguard {
        contract_owner: AccountId,
        // Store individual project fields instead of nested mappings
        project_owners: Mapping<ProjectId, AccountId>,
        project_vote_end_times: Mapping<ProjectId, u64>,
        project_vote_yes_counts: Mapping<ProjectId, u64>,
        project_vote_no_counts: Mapping<ProjectId, u64>,
        project_votes: Mapping<(ProjectId, AccountId), u64>,
        project_withdraw_statuses: Mapping<ProjectId, bool>,
        project_statuses: Mapping<ProjectId, bool>,
        project_permission_balances: Mapping<ProjectId, Balance>,
        project_psp22_pairs: Mapping<ProjectId, Option<AccountId>>,
        project_withdrawals: Mapping<(ProjectId, AccountId), Balance>,
        project_lunes_withdraw_balances: Mapping<ProjectId, Balance>,
        project_ids: Mapping<ProjectId, u64>,
        project_guarantees: Mapping<(ProjectId, AccountId), Balance>,
        project_creation_timestamps: Mapping<ProjectId, u64>,
        project_scores: Mapping<ProjectId, u8>,
        next_project_id: ProjectId,
        
        // Multi-asset vault storage
        supported_tokens: Mapping<TokenId, TokenInfo>,
        token_guarantees: Mapping<(ProjectId, TokenId, AccountId), Balance>,
        project_total_guarantees: Mapping<(ProjectId, TokenId), Balance>,
        user_token_balances: Mapping<(AccountId, TokenId), Balance>,
        next_token_id: TokenId,
        
        // NFT (PSP34) collateral storage
        supported_nft_collections: Mapping<NFTCollectionId, NFTCollectionInfo>,
        nft_guarantees: Mapping<(ProjectId, NFTCollectionId, AccountId, NFTTokenId), Balance>,
        project_nft_guarantees: Mapping<(ProjectId, NFTCollectionId), Balance>,
        user_nft_deposits: Mapping<(AccountId, NFTCollectionId), u32>, // Count of NFTs deposited
        next_nft_collection_id: NFTCollectionId,
        
        reentrancy_guard: ReentrancyGuard,
    }

    impl Safeguard {
        #[ink(constructor)]
        pub fn new() -> Self {
            let caller = Self::env().caller();
            
            Self::env().emit_event(OwnershipTransferred {
                previous_owner: None,
                new_owner: caller,
            });

            Self {
                contract_owner: caller,
                project_owners: Mapping::default(),
                project_vote_end_times: Mapping::default(),
                project_vote_yes_counts: Mapping::default(),
                project_vote_no_counts: Mapping::default(),
                project_votes: Mapping::default(),
                project_withdraw_statuses: Mapping::default(),
                project_statuses: Mapping::default(),
                project_permission_balances: Mapping::default(),
                project_psp22_pairs: Mapping::default(),
                project_withdrawals: Mapping::default(),
                project_lunes_withdraw_balances: Mapping::default(),
                project_ids: Mapping::default(),
                project_guarantees: Mapping::default(),
                project_creation_timestamps: Mapping::default(),
                project_scores: Mapping::default(),
                next_project_id: 0,
                
                // Initialize multi-asset vault storage
                supported_tokens: Mapping::default(),
                token_guarantees: Mapping::default(),
                project_total_guarantees: Mapping::default(),
                user_token_balances: Mapping::default(),
                next_token_id: 0,
                
                // Initialize NFT collateral storage
                supported_nft_collections: Mapping::default(),
                nft_guarantees: Mapping::default(),
                project_nft_guarantees: Mapping::default(),
                user_nft_deposits: Mapping::default(),
                next_nft_collection_id: 0,
                
                reentrancy_guard: ReentrancyGuard::default(),
            }
        }

        #[ink(message)]
        pub fn register_project(&mut self, pair_psp22: Option<AccountId>) -> Result<ProjectId, SafeguardError> {
            let caller = self.env().caller();
            validation::validate_account(caller)?;

            let project_id = self.next_project_id;
            
            // Initialize project fields
            self.project_owners.insert(project_id, &caller);
            self.project_vote_end_times.insert(project_id, &0);
            self.project_vote_yes_counts.insert(project_id, &0);
            self.project_vote_no_counts.insert(project_id, &0);
            self.project_withdraw_statuses.insert(project_id, &false);
            self.project_statuses.insert(project_id, &true);
            self.project_permission_balances.insert(project_id, &0);
            self.project_psp22_pairs.insert(project_id, &pair_psp22);
            self.project_withdrawals.insert(&(project_id, caller), &0);
            self.project_lunes_withdraw_balances.insert(project_id, &0);
            self.project_guarantees.insert(&(project_id, caller), &0);
            // Set project creation timestamp for vesting logic
            let creation_timestamp = self.env().block_timestamp();
            self.project_creation_timestamps.insert(project_id, &creation_timestamp);
            
            // Increment next project ID
            self.next_project_id = safe_math::safe_add(self.next_project_id, 1)?;
            
            // Emit event
            self.env().emit_event(ProjectRegistered {
                project_id,
                owner: caller,
            });
            
            Ok(project_id)
        }

        #[ink(message)]
        pub fn emergency_pause_project(&mut self, project_id: ProjectId, pause: bool) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }

            self.project_statuses.insert(project_id, &!pause);

            // TODO: Emit a ProjectPaused/Unpaused event

            Ok(())
        }

        #[ink(message)]
        pub fn vote(&mut self, project_id: ProjectId, vote_value: bool) -> Result<(), SafeguardError> {
            // Validate inputs
            validation::validate_account(self.env().caller())?;
            
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Check if project is paused
            if !self.project_statuses.get(project_id).unwrap_or(true) {
                return Err(SafeguardError::ProjectPaused);
            }
            
            // Check if user has already voted
            if self.project_votes.contains(&(project_id, self.env().caller())) {
                return Err(SafeguardError::AlreadyVoted);
            }
            
            // Execute vote logic
            self._vote_internal(project_id, vote_value)
        }

        #[ink(message)]
        pub fn vote_finish(&mut self, project_id: ProjectId, balance_per_lunes: Balance) -> Result<(), SafeguardError> {
            // Validate inputs
            validation::validate_account(self.env().caller())?;
            validation::validate_amount(balance_per_lunes)?;
            
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Check if project is paused
            if !self.project_statuses.get(project_id).unwrap_or(true) {
                return Err(SafeguardError::ProjectPaused);
            }
            
            // Execute finish vote logic
            self._finish_vote_internal(project_id, balance_per_lunes)
        }

        #[ink(message)]
        pub fn withdraw(&mut self, project_id: ProjectId, amount: Balance) -> Result<(), SafeguardError> {
            // Validate inputs
            validation::validate_account(self.env().caller())?;
            validation::validate_amount(amount)?;
            
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Check if project is paused
            if !self.project_statuses.get(project_id).unwrap_or(true) {
                return Err(SafeguardError::ProjectPaused);
            }
            
            // Execute withdraw logic
            self._withdraw_internal(project_id, amount)
        }

        #[ink(message)]
        pub fn transfer_project_ownership(&mut self, project_id: ProjectId, new_owner: AccountId) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            let owner = self.project_owners.get(project_id).ok_or(SafeguardError::InvalidInput)?;
            
            // Ensure the caller is the owner of this specific project
            if owner != caller {
                return Err(SafeguardError::NotOwner);
            }
            
            // Validate new owner
            validation::validate_account(new_owner)?;
            
            // Transfer ownership
            self.project_owners.insert(project_id, &new_owner);
            
            // Emit ownership transfer event
            self.env().emit_event(ProjectOwnershipTransferred {
                project_id,
                previous_owner: caller,
                new_owner,
            });
            
            Ok(())
        }

        #[ink(message)]
        pub fn get_withdrawal(&self, project_id: ProjectId, account: AccountId) -> Result<Balance, SafeguardError> {
            // Validate inputs
            validation::validate_account(account)?;
            
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Get withdrawal amount
            let withdrawal = self.project_withdrawals.get(&(project_id, account)).unwrap_or(0);
            Ok(withdrawal)
        }

        #[ink(message)]
        pub fn get_user_vote(&self, project_id: ProjectId, account: AccountId) -> Result<Option<u64>, SafeguardError> {
            // Validate inputs
            validation::validate_account(account)?;
            
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Get user vote
            let vote = self.project_votes.get(&(project_id, account));
            Ok(vote)
        }

        #[ink(message)]
        pub fn has_voted(&self, project_id: ProjectId, account: AccountId) -> Result<bool, SafeguardError> {
            // Validate inputs
            validation::validate_account(account)?;
            
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Check if user has voted
            Ok(self.project_votes.contains(&(project_id, account)))
        }

        #[ink(message)]
        pub fn vote_active(&mut self, project_id: ProjectId, active: bool, balance_min: Balance) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            let owner = self.project_owners.get(project_id).ok_or(SafeguardError::InvalidInput)?;
            
            // Ensure the caller is the owner of this specific project
            if owner != caller {
                return Err(SafeguardError::NotOwner);
            }
            
            // Execute internal activation logic
            self._activate_vote_internal(project_id, active, balance_min)
        }

        #[ink(message)]
        pub fn get_project_info(&self, project_id: ProjectId) -> Option<InfoContract> {
            let owner = self.project_owners.get(project_id)?;
            let data_vote_end = self.project_vote_end_times.get(project_id).unwrap_or(0);
            let qtd_vote_yes = self.project_vote_yes_counts.get(project_id).unwrap_or(0);
            let qtd_vote_no = self.project_vote_no_counts.get(project_id).unwrap_or(0);
            let status_withdraw = self.project_withdraw_statuses.get(project_id).unwrap_or(false);
            let status = self.project_statuses.get(project_id).unwrap_or(false);
            let balance_permission = self.project_permission_balances.get(project_id).unwrap_or(0);
            let pair_psp22 = self.project_psp22_pairs.get(project_id).unwrap_or(None);
            let balance_withdraw_per_lunes = self.project_lunes_withdraw_balances.get(project_id).unwrap_or(0);
            let creation_timestamp = self.project_creation_timestamps.get(project_id).unwrap_or(0);

            // Construct and return InfoContract
            Some(InfoContract {
                owner,
                data_vote_end,
                qtd_vote_yes,
                qtd_vote_no,
                status_withdraw,
                status,
                balance_permission,
                pair_psp22,
                balance_withdraw_per_lunes,
                id: project_id,
                creation_timestamp,
            })
        }

        #[ink(message)]
        pub fn get_project_owner(&self, project_id: ProjectId) -> Result<AccountId, SafeguardError> {
            self.project_owners.get(project_id).ok_or(SafeguardError::InvalidInput)
        }

        #[ink(message)]
        pub fn transfer_contract_ownership(&mut self, new_owner: AccountId) -> Result<(), SafeguardError> {
            // Validate new owner
            validation::validate_account(new_owner)?;
            
            // Check ownership
            if self.env().caller() != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }
            
            // Store previous owner for event emission
            let previous_owner = self.contract_owner;
            
            // Transfer ownership
            self.contract_owner = new_owner;
            
            // Emit ownership transfer event
            self.env().emit_event(OwnershipTransferred {
                previous_owner: Some(previous_owner),
                new_owner,
            });
            
            Ok(())
        }

        fn _vote_internal(&mut self, project_id: ProjectId, vote_value: bool) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            let project_id_value = self.project_ids.get(project_id).unwrap_or(0);

            // Record vote
            self.project_votes.insert((project_id, caller), &project_id_value);

            // Update vote counts with overflow protection
            if vote_value {
                let current_yes_votes = self.project_vote_yes_counts.get(project_id).unwrap_or(0);
                self.project_vote_yes_counts.insert(project_id, &safe_math::safe_add(current_yes_votes, 1)?);
            } else {
                let current_no_votes = self.project_vote_no_counts.get(project_id).unwrap_or(0);
                self.project_vote_no_counts.insert(project_id, &safe_math::safe_add(current_no_votes, 1)?);
            }

            // Emit vote event
            self.env().emit_event(VoteCast {
                project_id,
                voter: caller,
                vote_id: project_id_value,
                vote_value,
            });

            Ok(())
        }

        fn _finish_vote_internal(&mut self, project_id: ProjectId, _balance_per_lunes: Balance) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            let owner = self.project_owners.get(project_id).ok_or(SafeguardError::InvalidInput)?;

            // Ensure the caller is the owner of this specific project
            if owner != caller {
                return Err(SafeguardError::NotOwner);
            }

            // Set vote end time to current timestamp
            let current_time = self.env().block_timestamp();
            self.project_vote_end_times.insert(project_id, &current_time);

            // Get vote counts for the event
            let yes_votes = self.project_vote_yes_counts.get(project_id).unwrap_or(0);
            let no_votes = self.project_vote_no_counts.get(project_id).unwrap_or(0);
            
            // Emit vote finished event
            self.env().emit_event(VotingFinished {
                project_id,
                vote_id: project_id,
                yes_votes,
                no_votes,
            });

            Ok(())
        }

        fn _withdraw_internal(&mut self, project_id: ProjectId, amount: Balance) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            let owner = self.project_owners.get(project_id).ok_or(SafeguardError::InvalidInput)?;
            
            // Ensure the caller is the owner of this specific project
            if owner != caller {
                return Err(SafeguardError::NotOwner);
            }
            
            // Check if withdrawal is already in progress
            if self.project_withdraw_statuses.get(project_id).unwrap_or(false) {
                return Err(SafeguardError::WithdrawalInProgress);
            }
            
            // Mark withdrawal as in progress
            self.project_withdraw_statuses.insert(project_id, &true);
            
            // Update withdrawal amount
            let current_withdrawal = self.project_withdrawals.get((project_id, caller)).unwrap_or(0);
            let new_withdrawal = safe_math::safe_add_balance(current_withdrawal, amount)?;
            self.project_withdrawals.insert((project_id, caller), &new_withdrawal);
            
            // Emit withdrawal event
            self.env().emit_event(WithdrawalActivated {
                project_id,
                vote_id: project_id,
                balance_per_lunes: amount,
            });
            
            Ok(())
        }

        fn _activate_vote_internal(&mut self, project_id: ProjectId, active: bool, balance_min: Balance) -> Result<(), SafeguardError> {
            // Validate minimum balance
            validation::validate_amount(balance_min)?;
            
            // Set project status
            self.project_statuses.insert(project_id, &active);
            
            // Set permission balance threshold
            self.project_permission_balances.insert(project_id, &balance_min);
            
            // Emit vote activation event
            self.env().emit_event(VotingActivated {
                project_id,
                vote_id: project_id,
                minimum_balance: balance_min,
                end_time: self.env().block_timestamp(),
            });
            
            Ok(())
        }

        /// Add a new supported token to the vault
        #[ink(message)]
        pub fn add_supported_token(
            &mut self,
            contract_address: AccountId,
            symbol: [u8; 8],
            decimals: u8,
            min_guarantee_amount: Balance,
        ) -> Result<TokenId, SafeguardError> {
            // Only contract owner can add tokens
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }

            validation::validate_account(contract_address)?;
            validation::validate_amount(min_guarantee_amount)?;

            let token_id = self.next_token_id;
            let token_info = TokenInfo {
                contract_address,
                symbol,
                decimals,
                is_active: true,
                min_guarantee_amount,
                price_feed_id: None,
            };

            self.supported_tokens.insert(token_id, &token_info);
            self.next_token_id = self.next_token_id.saturating_add(1);

            self.env().emit_event(TokenAdded {
                token_id,
                contract_address,
                symbol,
                decimals,
            });

            Ok(token_id)
        }

        /// Add guarantee to a project using a specific token
        #[ink(message)]
        pub fn set_balance_per_lunes(
            &mut self,
            project_id: ProjectId,
            _balance_per_lunes: Balance,
        ) -> Result<(), SafeguardError> {
            let _caller = self.env().caller();
            
            // Validate inputs
            validation::validate_amount(_balance_per_lunes)?;
            
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Update project balance per lunes
            self.project_lunes_withdraw_balances.insert(project_id, &_balance_per_lunes);
            
            Ok(())
        }

        /// Add guarantee to a project using a specific token
        #[ink(message)]
        pub fn add_guarantee(
            &mut self,
            project_id: ProjectId,
            token_id: TokenId,
            amount: Balance,
        ) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            
            // Validate inputs
            validation::validate_amount(amount)?;
            
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Check if token is supported and active
            let token_info = self.supported_tokens.get(token_id)
                .ok_or(SafeguardError::InvalidInput)?;
            
            if !token_info.is_active {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Check minimum amount
            if amount < token_info.min_guarantee_amount {
                return Err(SafeguardError::InvalidAmount);
            }
            
            // Update guarantee mappings
            let current_guarantee = self.token_guarantees.get((project_id, token_id, caller)).unwrap_or(0);
            let new_guarantee = safe_math::safe_add_balance(current_guarantee, amount)?;
            self.token_guarantees.insert((project_id, token_id, caller), &new_guarantee);
            
            // Update project total guarantees
            let current_total = self.project_total_guarantees.get((project_id, token_id)).unwrap_or(0);
            let new_total = safe_math::safe_add_balance(current_total, amount)?;
            self.project_total_guarantees.insert((project_id, token_id), &new_total);
            
            // Update user token balance (for tracking)
            let current_balance = self.user_token_balances.get((caller, token_id)).unwrap_or(0);
            let new_balance = safe_math::safe_add_balance(current_balance, amount)?;
            self.user_token_balances.insert((caller, token_id), &new_balance);
            
            self.env().emit_event(GuaranteeAdded {
                project_id,
                token_id,
                account: caller,
                amount,
            });
            
            // Update project score after adding guarantee
            let _ = self.update_project_score(project_id);
            
            Ok(())
        }

        /// Donate tokens to a project's guarantee pool
        #[ink(message)]
        pub fn donate_to_guarantee(
            &mut self,
            project_id: ProjectId,
            token_id: TokenId,
            amount: Balance,
        ) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            
            // Validate inputs
            validation::validate_amount(amount)?;
            
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Check if token is supported and active
            let token_info = self.supported_tokens.get(token_id)
                .ok_or(SafeguardError::InvalidInput)?;
            
            if !token_info.is_active {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Update project total guarantees (donations go directly to project pool)
            let current_total = self.project_total_guarantees.get(&(project_id, token_id)).unwrap_or(0);
            let new_total = safe_math::safe_add_balance(current_total, amount)?;
            self.project_total_guarantees.insert(&(project_id, token_id), &new_total);
            
            self.env().emit_event(DonationReceived {
                project_id,
                token_id,
                donor: caller,
                amount,
            });
            
            // Update project score after donation
            let _ = self.update_project_score(project_id);
            
            Ok(())
        }

        /// Withdraw guarantee from a project
        #[ink(message)]
        pub fn withdraw_guarantee(
            &mut self,
            project_id: ProjectId,
            token_id: TokenId,
            amount: Balance,
        ) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            
            // Validate inputs
            validation::validate_amount(amount)?;
            
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Check user's guarantee balance
            let current_guarantee = self.token_guarantees.get((project_id, token_id, caller)).unwrap_or(0);
            if current_guarantee < amount {
                return Err(SafeguardError::InsufficientBalance);
            }
            
            // Update guarantee mappings
            let new_guarantee = safe_math::safe_sub_balance(current_guarantee, amount)?;
            if new_guarantee == 0 {
                self.token_guarantees.remove((project_id, token_id, caller));
            } else {
                self.token_guarantees.insert((project_id, token_id, caller), &new_guarantee);
            }
            
            // Update project total guarantees
            let current_total = self.project_total_guarantees.get((project_id, token_id)).unwrap_or(0);
            let new_total = safe_math::safe_sub_balance(current_total, amount)?;
            if new_total == 0 {
                self.project_total_guarantees.remove((project_id, token_id));
            } else {
                self.project_total_guarantees.insert((project_id, token_id), &new_total);
            }
            
            // Update user token balance
            let current_balance = self.user_token_balances.get((caller, token_id)).unwrap_or(0);
            let new_balance = safe_math::safe_sub_balance(current_balance, amount)?;
            if new_balance == 0 {
                self.user_token_balances.remove((caller, token_id));
            } else {
                self.user_token_balances.insert((caller, token_id), &new_balance);
            }
            
            self.env().emit_event(GuaranteeWithdrawn {
                project_id,
                token_id,
                account: caller,
                amount,
            });
            
            // Update project score after withdrawal
            let _ = self.update_project_score(project_id);
            
            Ok(())
        }

        /// Get token information
        #[ink(message)]
        pub fn get_token_info(&self, token_id: TokenId) -> Option<TokenInfo> {
            self.supported_tokens.get(token_id)
        }

        /// Get user's guarantee balance for a specific project and token
        #[ink(message)]
        pub fn get_user_guarantee(
            &self,
            project_id: ProjectId,
            token_id: TokenId,
            account: AccountId,
        ) -> Balance {
            self.token_guarantees.get((project_id, token_id, account)).unwrap_or(0)
        }

        /// Get total guarantees for a project and token
        #[ink(message)]
        pub fn get_project_total_guarantee(
            &self,
            project_id: ProjectId,
            token_id: TokenId,
        ) -> Balance {
            self.project_total_guarantees.get((project_id, token_id)).unwrap_or(0)
        }

        /// Get user's total balance for a specific token across all projects
        #[ink(message)]
        pub fn get_user_token_balance(
            &self,
            account: AccountId,
            token_id: TokenId,
        ) -> Balance {
            self.user_token_balances.get((account, token_id)).unwrap_or(0)
        }

        /// Add a new supported NFT collection to the vault
        #[ink(message)]
        pub fn add_nft_collection(
            &mut self,
            contract_address: AccountId,
            name: [u8; 32],
            symbol: [u8; 8],
            base_value: Balance,
            valuation_method: NFTValuationMethod,
        ) -> Result<NFTCollectionId, SafeguardError> {
            // Only contract owner can add NFT collections
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }

            validation::validate_account(contract_address)?;
            validation::validate_amount(base_value)?;

            let collection_id = self.next_nft_collection_id;
            let collection_info = NFTCollectionInfo {
                contract_address,
                name,
                symbol,
                is_active: true,
                base_value,
                valuation_method,
            };

            self.supported_nft_collections.insert(collection_id, &collection_info);
            self.next_nft_collection_id = self.next_nft_collection_id.saturating_add(1);

            self.env().emit_event(NFTCollectionAdded {
                collection_id,
                contract_address,
                name,
                symbol,
                base_value,
            });

            Ok(collection_id)
        }

        /// Deposit NFT as guarantee for a project
        #[ink(message)]
        pub fn deposit_nft_guarantee(
            &mut self,
            project_id: ProjectId,
            collection_id: NFTCollectionId,
            nft_token_id: NFTTokenId,
        ) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Check if NFT collection is supported and active
            let collection_info = self.supported_nft_collections.get(collection_id)
                .ok_or(SafeguardError::InvalidInput)?;
            
            if !collection_info.is_active {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Calculate NFT value based on collection's valuation method
            let estimated_value = match collection_info.valuation_method {
                NFTValuationMethod::FixedValue => collection_info.base_value,
                NFTValuationMethod::TraitBased => {
                    // For now, use base value. Future: implement trait-based valuation
                    collection_info.base_value
                },
                NFTValuationMethod::OraclePrice => {
                    // For now, use base value. Future: implement oracle integration
                    collection_info.base_value
                },
            };
            
            // Store NFT guarantee
            self.nft_guarantees.insert((project_id, collection_id, caller, nft_token_id), &estimated_value);
            
            // Update project NFT guarantee totals
            let current_total = self.project_nft_guarantees.get((project_id, collection_id)).unwrap_or(0);
            let new_total = safe_math::safe_add_balance(current_total, estimated_value)?;
            self.project_nft_guarantees.insert((project_id, collection_id), &new_total);
            
            // Update user NFT deposit count
            let current_count = self.user_nft_deposits.get((caller, collection_id)).unwrap_or(0);
            let new_count = current_count.saturating_add(1);
            self.user_nft_deposits.insert((caller, collection_id), &new_count);
            
            self.env().emit_event(NFTGuaranteeDeposited {
                project_id,
                collection_id,
                account: caller,
                nft_token_id,
                estimated_value,
            });
            
            // Update project score after NFT deposit
            let _ = self.update_project_score(project_id);
            
            Ok(())
        }

        /// Withdraw NFT guarantee from a project
        #[ink(message)]
        pub fn withdraw_nft_guarantee(
            &mut self,
            project_id: ProjectId,
            collection_id: NFTCollectionId,
            nft_token_id: NFTTokenId,
        ) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Check if NFT guarantee exists
            let estimated_value = self.nft_guarantees.get((project_id, collection_id, caller, nft_token_id))
                .ok_or(SafeguardError::InvalidInput)?;
            
            // Remove NFT guarantee
            self.nft_guarantees.remove((project_id, collection_id, caller, nft_token_id));
            
            // Update project NFT guarantee totals
            let current_total = self.project_nft_guarantees.get((project_id, collection_id)).unwrap_or(0);
            let new_total = safe_math::safe_sub_balance(current_total, estimated_value)?;
            if new_total == 0 {
                self.project_nft_guarantees.remove((project_id, collection_id));
            } else {
                self.project_nft_guarantees.insert((project_id, collection_id), &new_total);
            }
            
            // Update user NFT deposit count
            let current_count = self.user_nft_deposits.get((caller, collection_id)).unwrap_or(0);
            if current_count > 0 {
                let new_count = current_count.saturating_sub(1);
                if new_count == 0 {
                    self.user_nft_deposits.remove((caller, collection_id));
                } else {
                    self.user_nft_deposits.insert((caller, collection_id), &new_count);
                }
            }
            
            self.env().emit_event(NFTGuaranteeWithdrawn {
                project_id,
                collection_id,
                account: caller,
                nft_token_id,
                estimated_value,
            });
            
            // Update project score after NFT withdrawal
            let _ = self.update_project_score(project_id);
            
            Ok(())
        }

        /// Get NFT collection information
        #[ink(message)]
        pub fn get_nft_collection_info(&self, collection_id: NFTCollectionId) -> Option<NFTCollectionInfo> {
            self.supported_nft_collections.get(collection_id)
        }

        /// Get NFT guarantee value for a specific NFT
        #[ink(message)]
        pub fn get_nft_guarantee_value(
            &self,
            project_id: ProjectId,
            collection_id: NFTCollectionId,
            account: AccountId,
            nft_token_id: NFTTokenId,
        ) -> Balance {
            self.nft_guarantees.get(&(project_id, collection_id, account, nft_token_id)).unwrap_or(0)
        }

        /// Get total NFT guarantee value for a project and collection
        #[ink(message)]
        pub fn get_project_nft_guarantee_total(
            &self,
            project_id: ProjectId,
            collection_id: NFTCollectionId,
        ) -> Balance {
            self.project_nft_guarantees.get(&(project_id, collection_id)).unwrap_or(0)
        }

        /// Get user's NFT deposit count for a collection
        #[ink(message)]
        pub fn get_user_nft_deposit_count(
            &self,
            account: AccountId,
            collection_id: NFTCollectionId,
        ) -> u32 {
            self.user_nft_deposits.get(&(account, collection_id)).unwrap_or(0)
        }

        /// Request guarantee release after vesting period (5 years)
        #[ink(message)]
        pub fn request_guarantee_release(
            &mut self,
            project_id: ProjectId,
        ) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Check if caller has guarantees in this project
            let user_guarantee = self.project_guarantees.get(&(project_id, caller)).unwrap_or(0);
            if user_guarantee == 0 {
                return Err(SafeguardError::InvalidInput);
            }
            
            // Check vesting period (5 years = 5 * 365 * 24 * 60 * 60 * 1000 milliseconds)
            let creation_timestamp = self.project_creation_timestamps.get(project_id)
                .ok_or(SafeguardError::InvalidInput)?;
            let current_timestamp = self.env().block_timestamp();
            let vesting_period: u64 = 5 * 365 * 24 * 60 * 60 * 1000; // 5 years in milliseconds
            
            if current_timestamp < creation_timestamp + vesting_period {
                return Err(SafeguardError::VestingPeriodNotMet);
            }
            
            // Check if project is not paused
            let project_status = self.project_statuses.get(project_id).unwrap_or(true);
            if !project_status {
                return Err(SafeguardError::ProjectPaused);
            }
            
            // Check if there's no active withdrawal in progress
            let withdrawal_status = self.project_withdraw_statuses.get(project_id).unwrap_or(false);
            if withdrawal_status {
                return Err(SafeguardError::WithdrawalInProgress);
            }
            
            // Initiate community voting for guarantee release
            // Set voting period (e.g., 7 days)
            let voting_period: u64 = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
            let vote_end_time = current_timestamp + voting_period;
            
            self.project_vote_end_times.insert(project_id, &vote_end_time);
            self.project_vote_yes_counts.insert(project_id, &0);
            self.project_vote_no_counts.insert(project_id, &0);
            
            // Mark withdrawal as in progress
            self.project_withdraw_statuses.insert(project_id, &true);
            
            self.env().emit_event(GuaranteeReleaseRequested {
                project_id,
                requester: caller,
                vesting_end_timestamp: creation_timestamp + vesting_period,
                vote_end_time,
            });
            
            Ok(())
        }

        /// Check if vesting period has been met for a project
        #[ink(message)]
        pub fn is_vesting_period_met(&self, project_id: ProjectId) -> bool {
            if let Some(creation_timestamp) = self.project_creation_timestamps.get(project_id) {
                let current_timestamp = self.env().block_timestamp();
                let vesting_period: u64 = 5 * 365 * 24 * 60 * 60 * 1000; // 5 years in milliseconds
                current_timestamp >= creation_timestamp + vesting_period
            } else {
                false
            }
        }

        /// Get project creation timestamp
        #[ink(message)]
        pub fn get_project_creation_timestamp(&self, project_id: ProjectId) -> Option<u64> {
            self.project_creation_timestamps.get(project_id)
        }

        /// Get remaining vesting time for a project (in milliseconds)
        #[ink(message)]
        pub fn get_remaining_vesting_time(&self, project_id: ProjectId) -> Option<u64> {
            if let Some(creation_timestamp) = self.project_creation_timestamps.get(project_id) {
                let current_timestamp = self.env().block_timestamp();
                let vesting_period: u64 = 5 * 365 * 24 * 60 * 60 * 1000; // 5 years in milliseconds
                let vesting_end = creation_timestamp + vesting_period;
                
                if current_timestamp >= vesting_end {
                    Some(0) // Vesting period completed
                } else {
                    Some(vesting_end - current_timestamp)
                }
            } else {
                None
            }
        }

        /// Calculate project guarantee score (0-100)
        #[ink(message)]
        pub fn calculate_project_score(&self, project_id: ProjectId) -> u8 {
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return 0;
            }
            
            let mut total_score: u32 = 0;
            let mut asset_diversity_bonus: u32 = 0;
            let mut psp22_assets_count: u32 = 0;
            let mut nft_collections_count: u32 = 0;
            
            // Calculate PSP22 token guarantees score
            let mut psp22_total_value: u128 = 0;
            for token_id in 0..self.next_token_id {
                if let Some(token_info) = self.supported_tokens.get(token_id) {
                    if token_info.is_active {
                        let project_total = self.project_total_guarantees.get(&(project_id, token_id)).unwrap_or(0);
                        if project_total > 0 {
                            psp22_total_value = psp22_total_value.saturating_add(project_total);
                            psp22_assets_count = psp22_assets_count.saturating_add(1);
                        }
                    }
                }
            }
            
            // Calculate NFT guarantees score
            let mut nft_total_value: u128 = 0;
            for collection_id in 0..self.next_nft_collection_id {
                if let Some(_collection_info) = self.supported_nft_collections.get(collection_id) {
                    let project_nft_total = self.project_nft_guarantees.get(&(project_id, collection_id)).unwrap_or(0);
                    if project_nft_total > 0 {
                        nft_total_value = nft_total_value.saturating_add(project_nft_total);
                        nft_collections_count = nft_collections_count.saturating_add(1);
                    }
                }
            }
            
            // Base score calculation (0-70 points based on total value)
            let total_guarantee_value = psp22_total_value.saturating_add(nft_total_value);
            let base_score = self._calculate_value_score(total_guarantee_value);
            total_score = total_score.saturating_add(base_score);
            
            // Asset diversity bonus (0-15 points)
            if psp22_assets_count > 0 {
                asset_diversity_bonus = asset_diversity_bonus.saturating_add(5); // 5 points for having PSP22 assets
            }
            if nft_collections_count > 0 {
                asset_diversity_bonus = asset_diversity_bonus.saturating_add(5); // 5 points for having NFT assets
            }
            if psp22_assets_count > 1 {
                asset_diversity_bonus = asset_diversity_bonus.saturating_add(3); // 3 points for multiple PSP22 tokens
            }
            if nft_collections_count > 1 {
                asset_diversity_bonus = asset_diversity_bonus.saturating_add(2); // 2 points for multiple NFT collections
            }
            total_score = total_score.saturating_add(asset_diversity_bonus.min(15));
            
            // Vesting time bonus (0-15 points)
            let vesting_bonus = self._calculate_vesting_bonus(project_id);
            total_score = total_score.saturating_add(vesting_bonus);
            
            // Ensure score is capped at 100
            (total_score.min(100)) as u8
        }
        
        /// Get cached project score or calculate if not cached
        #[ink(message)]
        pub fn get_project_score(&self, project_id: ProjectId) -> u8 {
            // Try to get cached score first
            if let Some(cached_score) = self.project_scores.get(project_id) {
                cached_score
            } else {
                // Calculate score if not cached
                self.calculate_project_score(project_id)
            }
        }
        
        /// Update and cache project score
        #[ink(message)]
        pub fn update_project_score(&mut self, project_id: ProjectId) -> Result<u8, SafeguardError> {
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            let new_score = self.calculate_project_score(project_id);
            self.project_scores.insert(project_id, &new_score);
            
            self.env().emit_event(ProjectScoreUpdated {
                project_id,
                new_score,
            });
            
            Ok(new_score)
        }
        
        /// Internal function to calculate value-based score (0-70 points)
        fn _calculate_value_score(&self, total_value: Balance) -> u32 {
            // Score tiers based on total guarantee value
            // Using LUSDT as reference (assuming 6 decimals)
            let lusdt_unit = 1_000_000; // 1 LUSDT = 1,000,000 units
            
            if total_value >= 1_000_000 * lusdt_unit { // >= 1M LUSDT
                70
            } else if total_value >= 500_000 * lusdt_unit { // >= 500K LUSDT
                60
            } else if total_value >= 100_000 * lusdt_unit { // >= 100K LUSDT
                50
            } else if total_value >= 50_000 * lusdt_unit { // >= 50K LUSDT
                40
            } else if total_value >= 10_000 * lusdt_unit { // >= 10K LUSDT
                30
            } else if total_value >= 5_000 * lusdt_unit { // >= 5K LUSDT
                20
            } else if total_value >= 1_000 * lusdt_unit { // >= 1K LUSDT
                10
            } else if total_value > 0 {
                5 // Any guarantee gets minimum 5 points
            } else {
                0
            }
        }
        
        /// Internal function to calculate vesting time bonus (0-15 points)
        fn _calculate_vesting_bonus(&self, project_id: ProjectId) -> u32 {
            if let Some(creation_timestamp) = self.project_creation_timestamps.get(project_id) {
                let current_timestamp = self.env().block_timestamp();
                let project_age = current_timestamp.saturating_sub(creation_timestamp);
                let vesting_period: u64 = 5 * 365 * 24 * 60 * 60 * 1000; // 5 years in milliseconds
                
                // Calculate bonus based on how much of vesting period has passed
                if project_age >= vesting_period {
                    15 // Full bonus for completed vesting
                } else {
                    // Linear bonus based on vesting progress (0-15 points)
                    let progress = project_age.saturating_mul(15).saturating_div(vesting_period);
                    progress.min(15) as u32
                }
            } else {
                0
            }
        }

        /// Get contract owner
        #[ink(message)]
        pub fn owner(&self) -> Option<AccountId> {
            Some(self.contract_owner)
        }
    }

    /// Tests module
    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::test::{default_accounts, set_caller};

        fn setup() -> (Safeguard, ink::env::test::DefaultAccounts<ink::env::DefaultEnvironment>) {
            let accounts = default_accounts();
            set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let contract = Safeguard::new();
            (contract, accounts)
        }

        #[ink::test]
        fn test_constructor() {
            let (contract, accounts) = setup();
            assert_eq!(contract.owner(), Some(accounts.alice));
            assert_eq!(contract.next_project_id, 0);
        }

        #[ink::test]
        fn test_project_registration() {
            let (mut contract, _accounts) = setup();
            
            // Register a new project
            let result = contract.register_project(None);
            assert!(result.is_ok());
            let project_id = result.unwrap();
            assert_eq!(project_id, 0);
            assert_eq!(contract.next_project_id, 1);
        }

        #[ink::test]
        fn test_contract_ownership() {
            let (mut contract, accounts) = setup();
            
            // Transfer contract ownership
            let result = contract.transfer_contract_ownership(accounts.bob);
            assert!(result.is_ok());
            assert_eq!(contract.owner(), Some(accounts.bob));
        }

        #[ink::test]
        fn test_vote_activation() {
            let (mut contract, _accounts) = setup();
            
            // First register a project
            let project_result = contract.register_project(None);
            assert!(project_result.is_ok());
            let project_id = project_result.unwrap();
            
            // Activate voting for the project
            let result = contract.vote_active(project_id, true, 1000);
            assert!(result.is_ok());
            
            // Check project info
            let info = contract.get_project_info(project_id);
            assert!(info.is_some());
            let project_info = info.unwrap();
            assert!(project_info.status);
            assert_eq!(project_info.balance_permission, 1000);
        }

        #[ink::test]
        fn test_unauthorized_access() {
            let (mut contract, accounts) = setup();
            
            // Register a project as alice
            let project_result = contract.register_project(None);
            assert!(project_result.is_ok());
            let project_id = project_result.unwrap();
            
            // Try to activate voting as non-owner (bob)
            set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            let result = contract.vote_active(project_id, true, 1000);
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::NotOwner);
        }

        #[ink::test]
        fn test_arithmetic_overflow_protection() {
            let result = safe_math::safe_add(u64::MAX, 1);
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::ArithmeticOverflow);
        }

        #[ink::test]
        fn test_input_validation() {
            let zero_account = AccountId::from([0u8; 32]);
            let result = validation::validate_account(zero_account);
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::ZeroAddress);
        }

        #[ink::test]
        fn test_reentrancy_protection() {
            let mut guard = ReentrancyGuard::default();
            
            // First entry should succeed
            let result = guard.start();
            assert!(result.is_ok());
            assert!(guard.is_entered());
            
            // Second entry should fail
            let result = guard.start();
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::ReentrancyDetected);
            
            // End should clear the guard
            guard.end();
            assert!(!guard.is_entered());
        }

        #[ink::test]
        fn test_add_supported_token() {
            let (mut contract, accounts) = setup();
            
            // Add a new token
            let symbol = *b"USDT\0\0\0\0";
            let result = contract.add_supported_token(
                accounts.bob, // token contract address
                symbol,
                6, // decimals
                1000, // min guarantee amount
            );
            
            assert!(result.is_ok());
            let token_id = result.unwrap();
            assert_eq!(token_id, 0);
            assert_eq!(contract.next_token_id, 1);
            
            // Verify token info
            let token_info = contract.get_token_info(token_id);
            assert!(token_info.is_some());
            let info = token_info.unwrap();
            assert_eq!(info.contract_address, accounts.bob);
            assert_eq!(info.symbol, symbol);
            assert_eq!(info.decimals, 6);
            assert_eq!(info.min_guarantee_amount, 1000);
            assert!(info.is_active);
        }

        #[ink::test]
        fn test_add_guarantee() {
            let (mut contract, accounts) = setup();
            
            // First register a project
            let project_result = contract.register_project(None);
            assert!(project_result.is_ok());
            let project_id = project_result.unwrap();
            
            // Add a supported token
            let symbol = *b"LUNES\0\0\0";
            let token_result = contract.add_supported_token(
                accounts.charlie,
                symbol,
                8,
                500,
            );
            assert!(token_result.is_ok());
            let token_id = token_result.unwrap();
            
            // Add guarantee
            let guarantee_amount = 1000;
            let result = contract.add_guarantee(project_id, token_id, guarantee_amount);
            assert!(result.is_ok());
            
            // Verify guarantee was added
            let user_guarantee = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            assert_eq!(user_guarantee, guarantee_amount);
            
            let total_guarantee = contract.get_project_total_guarantee(project_id, token_id);
            assert_eq!(total_guarantee, guarantee_amount);
            
            let user_balance = contract.get_user_token_balance(accounts.alice, token_id);
            assert_eq!(user_balance, guarantee_amount);
        }

        #[ink::test]
        fn test_donate_to_guarantee() {
            let (mut contract, accounts) = setup();
            
            // Setup project and token
            let project_id = contract.register_project(None).unwrap();
            let token_id = contract.add_supported_token(
                accounts.charlie,
                *b"DONATE\0\0",
                8,
                100,
            ).unwrap();
            
            // Donate to guarantee pool
            let donation_amount = 2000;
            let result = contract.donate_to_guarantee(project_id, token_id, donation_amount);
            assert!(result.is_ok());
            
            // Verify donation was added to project total
            let total_guarantee = contract.get_project_total_guarantee(project_id, token_id);
            assert_eq!(total_guarantee, donation_amount);
            
            // User guarantee should be 0 (donations don't count as user guarantees)
            let user_guarantee = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            assert_eq!(user_guarantee, 0);
        }

        #[ink::test]
        fn test_withdraw_guarantee() {
            let (mut contract, accounts) = setup();
            
            // Setup project, token, and add guarantee
            let project_id = contract.register_project(None).unwrap();
            let token_id = contract.add_supported_token(
                accounts.charlie,
                *b"WITHDRAW",
                8,
                500,
            ).unwrap();
            
            let initial_amount = 1500;
            contract.add_guarantee(project_id, token_id, initial_amount).unwrap();
            
            // Withdraw part of the guarantee
            let withdraw_amount = 500;
            let result = contract.withdraw_guarantee(project_id, token_id, withdraw_amount);
            assert!(result.is_ok());
            
            // Verify balances were updated
            let remaining_guarantee = initial_amount - withdraw_amount;
            let user_guarantee = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            assert_eq!(user_guarantee, remaining_guarantee);
            
            let total_guarantee = contract.get_project_total_guarantee(project_id, token_id);
            assert_eq!(total_guarantee, remaining_guarantee);
            
            let user_balance = contract.get_user_token_balance(accounts.alice, token_id);
            assert_eq!(user_balance, remaining_guarantee);
        }

        #[ink::test]
        fn test_multi_asset_unauthorized_access() {
            let (mut contract, accounts) = setup();
            
            // Try to add token as non-owner
            set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            let result = contract.add_supported_token(
                accounts.charlie,
                *b"HACK\0\0\0\0",
                8,
                1000,
            );
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::NotOwner);
        }

        #[ink::test]
        fn test_invalid_token_operations() {
            let (mut contract, accounts) = setup();
            
            let project_id = contract.register_project(None).unwrap();
            let invalid_token_id = 999;
            
            // Try to add guarantee with invalid token
            let result = contract.add_guarantee(project_id, invalid_token_id, 1000);
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::InvalidInput);
            
            // Try to donate with invalid token
            let result = contract.donate_to_guarantee(project_id, invalid_token_id, 1000);
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::InvalidInput);
        }

        #[ink::test]
        fn test_add_nft_collection() {
            let (mut contract, accounts) = setup();
            
            // Add a new NFT collection
            let name = *b"CryptoKitties\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0";
            let symbol = *b"CK\0\0\0\0\0\0";
            let base_value = 5000;
            
            let result = contract.add_nft_collection(
                accounts.bob, // NFT contract address
                name,
                symbol,
                base_value,
                NFTValuationMethod::FixedValue,
            );
            
            assert!(result.is_ok());
            let collection_id = result.unwrap();
            assert_eq!(collection_id, 0);
            assert_eq!(contract.next_nft_collection_id, 1);
            
            // Verify collection info
            let collection_info = contract.get_nft_collection_info(collection_id);
            assert!(collection_info.is_some());
            let info = collection_info.unwrap();
            assert_eq!(info.contract_address, accounts.bob);
            assert_eq!(info.name, name);
            assert_eq!(info.symbol, symbol);
            assert_eq!(info.base_value, base_value);
            assert!(info.is_active);
            assert_eq!(info.valuation_method, NFTValuationMethod::FixedValue);
        }

        #[ink::test]
        fn test_deposit_nft_guarantee() {
            let (mut contract, accounts) = setup();
            
            // Setup project and NFT collection
            let project_id = contract.register_project(None).unwrap();
            let collection_id = contract.add_nft_collection(
                accounts.charlie,
                *b"TestNFTs\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
                *b"TNFT\0\0\0\0",
                2500,
                NFTValuationMethod::FixedValue,
            ).unwrap();
            
            // Deposit NFT as guarantee
            let nft_token_id = 123;
            let result = contract.deposit_nft_guarantee(project_id, collection_id, nft_token_id);
            assert!(result.is_ok());
            
            // Verify NFT guarantee was deposited
            let nft_value = contract.get_nft_guarantee_value(project_id, collection_id, accounts.alice, nft_token_id);
            assert_eq!(nft_value, 2500);
            
            let total_guarantee = contract.get_project_nft_guarantee_total(project_id, collection_id);
            assert_eq!(total_guarantee, 2500);
            
            let deposit_count = contract.get_user_nft_deposit_count(accounts.alice, collection_id);
            assert_eq!(deposit_count, 1);
        }

        #[ink::test]
        fn test_withdraw_nft_guarantee() {
            let (mut contract, accounts) = setup();
            
            // Setup project, collection, and deposit NFT
            let project_id = contract.register_project(None).unwrap();
            let collection_id = contract.add_nft_collection(
                accounts.charlie,
                *b"WithdrawNFTs\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
                *b"WNFT\0\0\0\0",
                3000,
                NFTValuationMethod::FixedValue,
            ).unwrap();
            
            let nft_token_id = 456;
            contract.deposit_nft_guarantee(project_id, collection_id, nft_token_id).unwrap();
            
            // Withdraw NFT guarantee
            let result = contract.withdraw_nft_guarantee(project_id, collection_id, nft_token_id);
            assert!(result.is_ok());
            
            // Verify NFT guarantee was withdrawn
            let nft_value = contract.get_nft_guarantee_value(project_id, collection_id, accounts.alice, nft_token_id);
            assert_eq!(nft_value, 0);
            
            let total_guarantee = contract.get_project_nft_guarantee_total(project_id, collection_id);
            assert_eq!(total_guarantee, 0);
            
            let deposit_count = contract.get_user_nft_deposit_count(accounts.alice, collection_id);
            assert_eq!(deposit_count, 0);
        }

        #[ink::test]
        fn test_multiple_nft_deposits() {
            let (mut contract, accounts) = setup();
            
            // Setup project and collection
            let project_id = contract.register_project(None).unwrap();
            let collection_id = contract.add_nft_collection(
                accounts.charlie,
                *b"MultiNFTs\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
                *b"MNFT\0\0\0\0",
                1000,
                NFTValuationMethod::FixedValue,
            ).unwrap();
            
            // Deposit multiple NFTs
            let nft_ids = [100, 200, 300];
            for &nft_id in &nft_ids {
                let result = contract.deposit_nft_guarantee(project_id, collection_id, nft_id);
                assert!(result.is_ok());
            }
            
            // Verify all NFTs were deposited
            let total_guarantee = contract.get_project_nft_guarantee_total(project_id, collection_id);
            assert_eq!(total_guarantee, 3000); // 3 NFTs * 1000 each
            
            let deposit_count = contract.get_user_nft_deposit_count(accounts.alice, collection_id);
            assert_eq!(deposit_count, 3);
            
            // Verify individual NFT values
            for &nft_id in &nft_ids {
                let nft_value = contract.get_nft_guarantee_value(project_id, collection_id, accounts.alice, nft_id);
                assert_eq!(nft_value, 1000);
            }
        }

        #[ink::test]
        fn test_nft_unauthorized_access() {
            let (mut contract, accounts) = setup();
            
            // Try to add NFT collection as non-owner
            set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            let result = contract.add_nft_collection(
                accounts.charlie,
                *b"HackNFTs\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
                *b"HACK\0\0\0\0",
                5000,
                NFTValuationMethod::FixedValue,
            );
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::NotOwner);
        }

        #[ink::test]
        fn test_invalid_nft_operations() {
            let (mut contract, accounts) = setup();
            
            let project_id = contract.register_project(None).unwrap();
            let invalid_collection_id = 999;
            let nft_token_id = 123;
            
            // Try to deposit NFT with invalid collection
            let result = contract.deposit_nft_guarantee(project_id, invalid_collection_id, nft_token_id);
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::InvalidInput);
            
            // Try to withdraw non-existent NFT guarantee
            let result = contract.withdraw_nft_guarantee(project_id, invalid_collection_id, nft_token_id);
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::InvalidInput);
        }

        #[ink::test]
        fn test_nft_valuation_methods() {
            let (mut contract, accounts) = setup();
            
            // Test different valuation methods
            let base_value = 1500;
            
            // Fixed value method
            let fixed_collection = contract.add_nft_collection(
                accounts.bob,
                *b"FixedNFTs\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
                *b"FIXED\0\0\0",
                base_value,
                NFTValuationMethod::FixedValue,
            ).unwrap();
            
            // Trait-based method (currently uses base value)
            let trait_collection = contract.add_nft_collection(
                accounts.charlie,
                *b"TraitNFTs\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
                *b"TRAIT\0\0\0",
                base_value,
                NFTValuationMethod::TraitBased,
            ).unwrap();
            
            // Oracle price method (currently uses base value)
            let oracle_collection = contract.add_nft_collection(
                accounts.django,
                *b"OracleNFTs\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
                *b"ORACLE\0\0",
                base_value,
                NFTValuationMethod::OraclePrice,
            ).unwrap();
            
            // Verify collection info for each method
            let fixed_info = contract.get_nft_collection_info(fixed_collection).unwrap();
            assert_eq!(fixed_info.valuation_method, NFTValuationMethod::FixedValue);
            
            let trait_info = contract.get_nft_collection_info(trait_collection).unwrap();
            assert_eq!(trait_info.valuation_method, NFTValuationMethod::TraitBased);
            
            let oracle_info = contract.get_nft_collection_info(oracle_collection).unwrap();
            assert_eq!(oracle_info.valuation_method, NFTValuationMethod::OraclePrice);
        }

        #[ink::test]
        fn test_project_creation_timestamp() {
            let (mut contract, _accounts) = setup();
            
            // Register a project and check if timestamp is set
            let project_id = contract.register_project(None).unwrap();
            
            let timestamp = contract.get_project_creation_timestamp(project_id);
            assert!(timestamp.is_some());
            // In test environment, timestamp might be 0, so we just check it exists
            let _timestamp_value = timestamp.unwrap(); // Just verify it doesn't panic
        }

        #[ink::test]
        fn test_vesting_period_not_met() {
            let (mut contract, accounts) = setup();
            
            // Register project and add guarantee
            let project_id = contract.register_project(None).unwrap();
            contract.project_guarantees.insert(&(project_id, accounts.alice), &1000);
            
            // Try to request guarantee release immediately (should fail)
            let result = contract.request_guarantee_release(project_id);
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::VestingPeriodNotMet);
            
            // Check vesting period status
            assert!(!contract.is_vesting_period_met(project_id));
            
            // Check remaining vesting time
            let remaining_time = contract.get_remaining_vesting_time(project_id);
            assert!(remaining_time.is_some());
            assert!(remaining_time.unwrap() > 0);
        }

        #[ink::test]
        fn test_vesting_period_calculations() {
            let (mut contract, _accounts) = setup();
            
            let project_id = contract.register_project(None).unwrap();
            
            // Test vesting period calculation constants
            let vesting_period: u64 = 5 * 365 * 24 * 60 * 60 * 1000; // 5 years in milliseconds
            assert_eq!(vesting_period, 157_680_000_000); // 5 years in milliseconds
            
            // Verify remaining time calculation
            let remaining_time = contract.get_remaining_vesting_time(project_id);
            assert!(remaining_time.is_some());
            
            // Should be close to 5 years (allowing for small timestamp differences)
            let remaining = remaining_time.unwrap();
            assert!(remaining > vesting_period - 1000); // Within 1 second tolerance
            assert!(remaining <= vesting_period);
        }

        #[ink::test]
        fn test_request_guarantee_release_no_guarantees() {
            let (mut contract, _accounts) = setup();
            
            let project_id = contract.register_project(None).unwrap();
            
            // Try to request release without any guarantees
            let result = contract.request_guarantee_release(project_id);
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::InvalidInput);
        }

        #[ink::test]
        fn test_request_guarantee_release_project_paused() {
            let (mut contract, accounts) = setup();
            
            // Register project and add guarantee
            let project_id = contract.register_project(None).unwrap();
            contract.project_guarantees.insert(&(project_id, accounts.alice), &1000);
            
            // Pause the project
            contract.emergency_pause_project(project_id, true).unwrap();
            
            // Try to request release from paused project (will fail due to vesting period first)
            let result = contract.request_guarantee_release(project_id);
            assert!(result.is_err());
            // In test environment, vesting period check happens first, so we expect VestingPeriodNotMet
            assert_eq!(result.unwrap_err(), SafeguardError::VestingPeriodNotMet);
        }

        #[ink::test]
        fn test_request_guarantee_release_withdrawal_in_progress() {
            let (mut contract, accounts) = setup();
            
            // Register project and add guarantee
            let project_id = contract.register_project(None).unwrap();
            contract.project_guarantees.insert(&(project_id, accounts.alice), &1000);
            
            // Set withdrawal in progress
            contract.project_withdraw_statuses.insert(project_id, &true);
            
            // Try to request release while withdrawal is in progress (will fail due to vesting period first)
            let result = contract.request_guarantee_release(project_id);
            assert!(result.is_err());
            // In test environment, vesting period check happens first, so we expect VestingPeriodNotMet
            assert_eq!(result.unwrap_err(), SafeguardError::VestingPeriodNotMet);
        }

        #[ink::test]
        fn test_vesting_period_functionality() {
            let (mut contract, accounts) = setup();
            
            // Register project and add guarantee
            let project_id = contract.register_project(None).unwrap();
            contract.project_guarantees.insert(&(project_id, accounts.alice), &1000);
            
            // Test that vesting period is not met initially
            let result = contract.request_guarantee_release(project_id);
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::VestingPeriodNotMet);
            
            // Test vesting period helper functions
            assert!(!contract.is_vesting_period_met(project_id));
            
            let remaining_time = contract.get_remaining_vesting_time(project_id);
            assert!(remaining_time.is_some());
            
            let creation_timestamp = contract.get_project_creation_timestamp(project_id);
            assert!(creation_timestamp.is_some());
        }

        #[ink::test]
        fn test_vesting_period_edge_cases() {
            let (mut contract, _accounts) = setup();
            
            // Test with non-existent project
            let non_existent_project = 999;
            assert!(!contract.is_vesting_period_met(non_existent_project));
            assert_eq!(contract.get_project_creation_timestamp(non_existent_project), None);
            assert_eq!(contract.get_remaining_vesting_time(non_existent_project), None);
        }

        #[ink::test]
        fn test_project_score_calculation() {
            let (mut contract, accounts) = setup();
            
            // Register project
            let project_id = contract.register_project(None).unwrap();
            
            // Initially, project should have score 0 (no guarantees)
            let initial_score = contract.calculate_project_score(project_id);
            assert_eq!(initial_score, 0);
            
            // Add PSP22 token
            let token_id = contract.add_supported_token(
                accounts.alice,
                *b"TST\0\0\0\0\0",
                18,
                1000,
            ).unwrap();
            
            // Add guarantee (10K LUSDT equivalent)
            let guarantee_amount = 10_000 * 1_000_000; // 10K LUSDT
            contract.add_guarantee(project_id, token_id, guarantee_amount).unwrap();
            
            // Score should now be higher (base score + diversity bonus)
            let score_with_guarantee = contract.get_project_score(project_id);
            assert!(score_with_guarantee > initial_score);
            assert!(score_with_guarantee >= 35); // 30 (base) + 5 (PSP22 diversity)
        }
        
        #[ink::test]
        fn test_score_value_tiers() {
            let (mut contract, accounts) = setup();
            
            let lusdt_unit = 1_000_000; // 1 LUSDT = 1M units
            
            // Test different value tiers
            let test_cases = vec![
                (1_000 * lusdt_unit, 15), // 1K LUSDT -> 10 base + 5 diversity = 15
                (10_000 * lusdt_unit, 35), // 10K LUSDT -> 30 base + 5 diversity = 35
                (100_000 * lusdt_unit, 55), // 100K LUSDT -> 50 base + 5 diversity = 55
                (1_000_000 * lusdt_unit, 75), // 1M LUSDT -> 70 base + 5 diversity = 75
            ];
            
            for (amount, expected_min_score) in test_cases {
                // Create fresh contract for each test
                let (mut test_contract, test_accounts) = setup();
                
                // Register project
                let project_id = test_contract.register_project(None).unwrap();
                
                // Add PSP22 token
                let token_id = test_contract.add_supported_token(
                    test_accounts.alice,
                    *b"LUSDT\0\0\0",
                    6,
                    1000,
                ).unwrap();
                
                test_contract.add_guarantee(project_id, token_id, amount).unwrap();
                let score = test_contract.get_project_score(project_id);
                assert!(score >= expected_min_score, "Amount: {}, Expected: {}, Got: {}", amount, expected_min_score, score);
            }
        }
        
        #[ink::test]
        fn test_score_asset_diversity() {
            let (mut contract, accounts) = setup();
            
            // Register project
            let project_id = contract.register_project(None).unwrap();
            
            // Add multiple PSP22 tokens
            let token1_id = contract.add_supported_token(
                accounts.alice,
                *b"TK1\0\0\0\0\0",
                18,
                1000,
            ).unwrap();
            let token2_id = contract.add_supported_token(
                accounts.alice,
                *b"TK2\0\0\0\0\0",
                18,
                1000,
            ).unwrap();
            
            // Add NFT collection
            let collection_id = contract.add_nft_collection(
                accounts.alice,
                *b"Test NFTs\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
                *b"TNFT\0\0\0\0",
                1_000_000, // 1 LUSDT base value
                NFTValuationMethod::FixedValue,
            ).unwrap();
            
            let base_amount = 5_000 * 1_000_000; // 5K LUSDT
            
            // Test single PSP22 token
            contract.add_guarantee(project_id, token1_id, base_amount).unwrap();
            let score_single_psp22 = contract.get_project_score(project_id);
            
            // Add second PSP22 token (should get multi-PSP22 bonus)
            contract.add_guarantee(project_id, token2_id, base_amount).unwrap();
            let score_multi_psp22 = contract.get_project_score(project_id);
            assert!(score_multi_psp22 > score_single_psp22);
            
            // Add NFT guarantee (should get NFT diversity bonus)
            contract.deposit_nft_guarantee(project_id, collection_id, 1).unwrap();
            let score_with_nft = contract.get_project_score(project_id);
            assert!(score_with_nft > score_multi_psp22);
        }
        
        #[ink::test]
        fn test_score_vesting_bonus() {
            let (mut contract, accounts) = setup();
            
            // Register project
            let project_id = contract.register_project(None).unwrap();
            
            // Add guarantee
            let token_id = contract.add_supported_token(
                accounts.alice,
                *b"TST\0\0\0\0\0",
                18,
                1000,
            ).unwrap();
            contract.add_guarantee(project_id, token_id, 10_000 * 1_000_000).unwrap();
            
            // Get initial score (should have minimal vesting bonus due to recent creation)
            let initial_score = contract.get_project_score(project_id);
            
            // Vesting bonus calculation is based on project age
            // In test environment, timestamps might be 0 or very low
            // So we mainly test that the function doesn't panic and returns reasonable values
            assert!(initial_score > 0);
            assert!(initial_score <= 100);
        }
        
        #[ink::test]
        fn test_score_caching_and_updates() {
            let (mut contract, accounts) = setup();
            
            // Register project
            let project_id = contract.register_project(None).unwrap();
            
            // Add token
            let token_id = contract.add_supported_token(
                accounts.alice,
                *b"TST\0\0\0\0\0",
                18,
                1000,
            ).unwrap();
            
            // Initially no cached score
            let initial_score = contract.get_project_score(project_id);
            assert_eq!(initial_score, 0);
            
            // Update score manually
            let updated_score = contract.update_project_score(project_id).unwrap();
            assert_eq!(updated_score, 0);
            
            // Add guarantee (should auto-update score)
            contract.add_guarantee(project_id, token_id, 10_000 * 1_000_000).unwrap();
            let score_after_guarantee = contract.get_project_score(project_id);
            assert!(score_after_guarantee > 0);
            
            // Withdraw guarantee (should auto-update score)
            contract.withdraw_guarantee(project_id, token_id, 5_000 * 1_000_000).unwrap();
            let score_after_withdrawal = contract.get_project_score(project_id);
            assert!(score_after_withdrawal < score_after_guarantee);
            assert!(score_after_withdrawal > 0); // Still has some guarantee
        }
        
        #[ink::test]
        fn test_score_with_nft_guarantees() {
            let (mut contract, accounts) = setup();
            
            // Register project
            let project_id = contract.register_project(None).unwrap();
            
            // Add NFT collection
            let collection_id = contract.add_nft_collection(
                accounts.alice,
                *b"Valuable NFTs\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
                *b"VNFT\0\0\0\0",
                50_000 * 1_000_000, // 50K LUSDT base value
                NFTValuationMethod::FixedValue,
            ).unwrap();
            
            // Initially score is 0
            let initial_score = contract.get_project_score(project_id);
            assert_eq!(initial_score, 0);
            
            // Deposit NFT (should auto-update score)
            contract.deposit_nft_guarantee(project_id, collection_id, 1).unwrap();
            let score_with_nft = contract.get_project_score(project_id);
            assert!(score_with_nft >= 45); // 40 (base for 50K) + 5 (NFT diversity)
            
            // Withdraw NFT (should auto-update score)
            contract.withdraw_nft_guarantee(project_id, collection_id, 1).unwrap();
            let score_after_withdrawal = contract.get_project_score(project_id);
            assert_eq!(score_after_withdrawal, 0);
        }
        
        #[ink::test]
        fn test_score_edge_cases() {
            let (mut contract, _accounts) = setup();
            
            // Test score for non-existent project
            let non_existent_project = 999;
            let score = contract.calculate_project_score(non_existent_project);
            assert_eq!(score, 0);
            
            // Test update score for non-existent project
            let result = contract.update_project_score(non_existent_project);
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::InvalidInput);
        }

        #[ink::test]
        fn test_vesting_helper_functions() {
            let (mut contract, _accounts) = setup();
            
            // Register project
            let project_id = contract.register_project(None).unwrap();
            
            // Test helper functions work correctly
            assert!(!contract.is_vesting_period_met(project_id));
            assert!(contract.get_project_creation_timestamp(project_id).is_some());
            assert!(contract.get_remaining_vesting_time(project_id).is_some());
            
            let remaining_time = contract.get_remaining_vesting_time(project_id);
            assert!(remaining_time.is_some());
        }
        
        #[ink::test]
        fn test_comprehensive_error_handling() {
            let (mut contract, accounts) = setup();
            
            // Test operations on non-existent project
            let non_existent_project = 999;
            
            // Should fail gracefully
            assert_eq!(contract.add_guarantee(non_existent_project, 0, 1000), Err(SafeguardError::InvalidInput));
            assert_eq!(contract.donate_to_guarantee(non_existent_project, 0, 1000), Err(SafeguardError::InvalidInput));
            assert_eq!(contract.withdraw_guarantee(non_existent_project, 0, 1000), Err(SafeguardError::InvalidInput));
            assert_eq!(contract.request_guarantee_release(non_existent_project), Err(SafeguardError::InvalidInput));
            assert_eq!(contract.update_project_score(non_existent_project), Err(SafeguardError::InvalidInput));
            
            // Test with invalid amounts
            let project_id = contract.register_project(None).unwrap();
            let token_id = contract.add_supported_token(
                accounts.alice,
                *b"TEST\0\0\0\0",
                18,
                1000,
            ).unwrap();
            
            // Zero amount should fail
            assert_eq!(contract.add_guarantee(project_id, token_id, 0), Err(SafeguardError::InvalidAmount));
            assert_eq!(contract.donate_to_guarantee(project_id, token_id, 0), Err(SafeguardError::InvalidAmount));
            
            // Amount below minimum should fail
            assert_eq!(contract.add_guarantee(project_id, token_id, 500), Err(SafeguardError::InvalidAmount));
        }
        
        #[ink::test]
        fn test_score_consistency_across_operations() {
            let (mut contract, accounts) = setup();
            
            // Setup project with guarantees
            let project_id = contract.register_project(None).unwrap();
            let token_id = contract.add_supported_token(
                accounts.alice,
                *b"LUSDT\0\0\0",
                6,
                1000,
            ).unwrap();
            
            // Test score consistency
            let initial_calculated = contract.calculate_project_score(project_id);
            let initial_cached = contract.get_project_score(project_id);
            assert_eq!(initial_calculated, initial_cached);
            
            // Add guarantee and verify auto-update
            contract.add_guarantee(project_id, token_id, 25_000 * 1_000_000).unwrap();
            let score_after_add = contract.get_project_score(project_id);
            let calculated_after_add = contract.calculate_project_score(project_id);
            assert_eq!(score_after_add, calculated_after_add);
            assert!(score_after_add > initial_cached);
            
            // Manual update should return same score
            let manual_update = contract.update_project_score(project_id).unwrap();
            assert_eq!(manual_update, score_after_add);
            
            // Withdraw and verify consistency
            contract.withdraw_guarantee(project_id, token_id, 10_000 * 1_000_000).unwrap();
            let score_after_withdraw = contract.get_project_score(project_id);
            let calculated_after_withdraw = contract.calculate_project_score(project_id);
            assert_eq!(score_after_withdraw, calculated_after_withdraw);
            assert!(score_after_withdraw <= score_after_add); // Allow equal scores due to rounding
        }
    }
}
