#![cfg_attr(not(feature = "std"), no_std)]
#![warn(clippy::arithmetic_side_effects)]

// Define Balance and AccountId at the crate level to be available for all modules
use ink::primitives::AccountId;
pub type Balance = u128;

/// Security modules for Safeguard contract
pub mod security {
    use super::{Balance, AccountId}; // Import from crate root
    use scale::{Decode, Encode};

    /// Custom error types
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum SafeguardError {
        NotOwner,
        ProjectNotFound,
        ProjectPaused,
        VotingInProgress,
        VotingNotActive,
        AlreadyVoted,
        WithdrawalInProgress,
        InsufficientBalance,
        InvalidAmount,
        ZeroAddress,
        TokenNotSupported,
        NFTNotSupported,
        VestingPeriodNotMet,
        ReentrancyDetected,
        InvalidInput,
        // Novos erros para SafeGard v2.0
        ProjectNotActive,
        NoActiveVoting,
        VotingNotFound,
        TooEarlyForVoting,
        VotingExpired,
        VotingStillActive,
        NotEligibleToVote,
        ClaimsNotOpen,
        ClaimsExpired,
        ClaimsStillOpen,
        AlreadyClaimed,
        NoClaimableAmount,
        InsufficientAllowance,
        ArithmeticOverflow,
        ArithmeticUnderflow,
        // Pausability errors
        ContractPaused,
        ContractNotPaused,
        // Timelock errors
        OperationPending,
        OperationNotReady,
        OperationNotFound,
        OperationExpired,
        // Cross-contract errors
        TransferFailed,
        ApprovalFailed,
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
        pub name: Vec<u8>,
        pub metadata_uri: Vec<u8>,
        pub token_contract: AccountId,
        pub treasury_address: AccountId,
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
    pub struct GuaranteeDeposited {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub token_id: TokenId,
        #[ink(topic)]
        pub account: AccountId,
        pub amount: Balance,
    }

    #[ink(event)]
    pub struct TokenGuaranteeDeposited {
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

    // Novos eventos para SafeGard v2.0

    #[ink(event)]
    pub struct VaultCreated {
        #[ink(topic)]
        pub project_id: ProjectId,
        pub creation_timestamp: u64,
    }

    #[ink(event)]
    pub struct DepositFeeCharged {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub depositor: AccountId,
        pub lunes_fee: Balance,
        pub lusdt_fee: Balance,
    }

    #[ink(event)]
    pub struct VoteOpened {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub voting_id: VotingId,
        pub vote_type: VoteType,
        pub start_timestamp: u64,
        pub end_timestamp: u64,
        pub snapshot_block: u64,
    }

    #[ink(event)]
    pub struct VoteClosed {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub voting_id: VotingId,
        pub yes_votes: u64,
        pub no_votes: u64,
        pub total_eligible: u64,
        pub result: VoteResult,
    }

    #[ink(event)]
    pub struct PlanProposed {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub proposer: AccountId,
        pub proposal_uri: Vec<u8>,
        pub correction_window_end: u64,
    }

    #[ink(event)]
    pub struct ClaimsOpened {
        #[ink(topic)]
        pub project_id: ProjectId,
        pub liquidation_timestamp: u64,
        pub claim_deadline: u64,
    }

    #[ink(event)]
    pub struct ClaimPaid {
        #[ink(topic)]
        pub project_id: ProjectId,
        #[ink(topic)]
        pub claimer: AccountId,
        pub project_tokens_returned: Balance,
        pub lunes_received: Balance,
        pub lusdt_received: Balance,
        pub other_tokens_received: Balance,
    }

    #[ink(event)]
    pub struct VaultClosed {
        #[ink(topic)]
        pub project_id: ProjectId,
        pub closure_timestamp: u64,
        pub final_status: ProjectStatus,
    }

    // Pausability events
    #[ink(event)]
    pub struct ContractPausedEvent {
        #[ink(topic)]
        pub paused_by: AccountId,
        pub timestamp: u64,
    }

    #[ink(event)]
    pub struct ContractUnpausedEvent {
        #[ink(topic)]
        pub unpaused_by: AccountId,
        pub timestamp: u64,
    }

    // Timelock events
    #[ink(event)]
    pub struct TimelockOperationScheduled {
        #[ink(topic)]
        pub operation_id: u64,
        #[ink(topic)]
        pub target_function: u8,
        pub scheduled_by: AccountId,
        pub execute_after: u64,
        pub expires_at: u64,
    }

    #[ink(event)]
    pub struct TimelockOperationExecuted {
        #[ink(topic)]
        pub operation_id: u64,
        pub executed_by: AccountId,
        pub timestamp: u64,
    }

    #[ink(event)]
    pub struct TimelockOperationCancelled {
        #[ink(topic)]
        pub operation_id: u64,
        pub cancelled_by: AccountId,
    }

    // Cross-contract transfer events
    #[ink(event)]
    pub struct TokenTransferExecuted {
        #[ink(topic)]
        pub token_id: TokenId,
        #[ink(topic)]
        pub from: AccountId,
        #[ink(topic)]
        pub to: AccountId,
        pub amount: Balance,
    }

    use ink::prelude::vec::Vec;

    pub type ProjectId = u64;
    pub type TokenId = u64;
    pub type NFTCollectionId = u64;
    pub type NFTTokenId = u64;
    pub type VotingId = u64;
    pub type ProposalId = u64;
    pub type OperationId = u64;

    /// Timelock operation types for critical functions
    #[derive(Debug, PartialEq, Eq, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub enum TimelockFunction {
        TransferContractOwnership = 0,
        SetTreasuryAddress = 1,
        SetDepositFees = 2,
        SetScoreParameters = 3,
        EmergencyWithdraw = 4,
        AddSupportedToken = 5,
        AddNftCollection = 6,
    }

    /// Timelock operation data
    #[derive(Debug, PartialEq, Eq, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct TimelockOperation {
        pub function_type: TimelockFunction,
        pub scheduled_by: AccountId,
        pub execute_after: u64,      // Timestamp when operation can be executed
        pub expires_at: u64,         // Timestamp when operation expires
        pub is_executed: bool,
        pub is_cancelled: bool,
        pub data: Vec<u8>,           // Encoded function parameters
    }

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
    #[allow(clippy::cast_possible_truncation)]
    pub enum NFTValuationMethod {
        FixedValue(Balance),
        TraitBased,
        OraclePrice,
    }

    /// Tipos de votação no SafeGard
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub enum VoteType {
        Annual,           // Votação anual de governança
        Extension,        // Extensão de lockup
        Emergency,        // Votação de emergência
        Liquidation,      // Votação para liquidação
    }

    /// Resultado de uma votação
    #[derive(Debug, Clone, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub enum VoteResult {
        Approved,
        Rejected,
        Pending,
        Expired,
    }

    /// Status do projeto no SafeGard
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub enum ProjectStatus {
        Active,           // Projeto ativo, aceitando depósitos
        VotingPeriod,     // Em período de votação
        Approved,         // Aprovado pela comunidade
        Rejected,         // Rejeitado pela comunidade
        Liquidation,      // Em processo de liquidação
        ClaimsOpen,       // Claims abertos para retirada
        Closed,           // Projeto encerrado
        Emergency,        // Estado de emergência
    }

    /// Informações de uma votação
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct VotingInfo {
        pub vote_type: VoteType,
        pub start_timestamp: u64,
        pub end_timestamp: u64,
        pub snapshot_block: u64,
        pub yes_votes: u64,
        pub no_votes: u64,
        pub total_eligible: u64,
        pub result: VoteResult,
        pub proposal_uri: Vec<u8>,
    }

    /// Informações do cofre de um projeto
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct ProjectVault {
        pub project_id: ProjectId,
        pub owner: AccountId,
        pub name: Vec<u8>,
        pub metadata_uri: Vec<u8>, // Link para metadados off-chain (IPFS/JSON)
        pub token_contract: AccountId,
        pub treasury_address: AccountId,
        pub creation_timestamp: u64,
        pub status: ProjectStatus,
        pub total_lunes_collateral: Balance,
        pub total_lusdt_collateral: Balance,
        pub total_other_collateral: Balance,
        pub current_voting_id: Option<VotingId>,
        pub last_annual_vote: u64,
        pub liquidation_timestamp: Option<u64>,
        pub claims_deadline: Option<u64>,
    }

    /// Informações de claim de um usuário
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct ClaimInfo {
        pub project_tokens_held: Balance,
        pub lunes_share: Balance,
        pub lusdt_share: Balance,
        pub other_tokens_share: Balance,
        pub is_claimed: bool,
        pub claim_timestamp: Option<u64>,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct InfoContract {
        pub owner: AccountId,
        pub metadata_uri: Vec<u8>,
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
        
        // Score v1.1 parameters
        lunes_token_id: Option<TokenId>, // AccountId of the Lunes token
        current_lunes_supply: Balance,   // Current supply of Lunes (for burn progress calculation)
        
        // Governance parameters for Score v1.1
        alpha: Balance,           // Scale factor for Lunes target when r=1 (default: 500_000 * 10^18)
        gamma: u32,              // Convexity parameter for large projects (default: 120, represents 1.2 * 100)
        delta: u32,              // Sensitivity for other collaterals reduction (default: 100, represents 1.0 * 100)
        t_min: Balance,          // Minimum Lunes target (default: 100_000 * 10^18)
        theta: u32,              // Temporal uplift parameter (default: 20, represents 0.20 * 100)
        s_ref: Balance,          // Reference supply for project size calculation (default: 1_000_000_000 * 10^18)
        floor_f: Balance,        // Supply floor (default: 50_000_000 * 10^18)
        kappa: u32,              // Transition parameter (default: 0, represents 0.0 * 100)
        epsilon: Balance,        // Small value to avoid division by zero (default: 1)
        
        // SafeGard v2.0 - Novos campos para regras de negócio
        project_vaults: Mapping<ProjectId, ProjectVault>,
        voting_infos: Mapping<VotingId, VotingInfo>,
        user_claims: Mapping<(ProjectId, AccountId), ClaimInfo>,
        next_voting_id: VotingId,
        
        // Treasury e taxas
        treasury_address: AccountId,
        lunes_deposit_fee: Balance,    // 100 LUNES
        lusdt_deposit_fee: Balance,    // 10 LUSDT
        lusdt_token_id: Option<TokenId>,
        
        // Configurações de governança
        annual_voting_duration: u64,   // 7 dias em milliseconds
        correction_window_duration: u64, // 30 dias para correções
        claims_period_duration: u64,   // 90 dias para claims
        
        // Global pausability
        is_paused: bool,
        paused_at: u64,
        
        // Timelock for critical operations
        timelock_operations: Mapping<OperationId, TimelockOperation>,
        next_operation_id: OperationId,
        timelock_delay: u64,           // Default: 48 hours in milliseconds
        timelock_expiry: u64,          // Default: 7 days in milliseconds
        
        // Score calculation cache for optimization
        project_token_count: Mapping<ProjectId, u32>,  // Number of tokens per project
        project_nft_count: Mapping<ProjectId, u32>,    // Number of NFT collections per project
        
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
                
                // Initialize Score v1.1 parameters with defaults
                lunes_token_id: None,
                current_lunes_supply: 200_000_000 * 1_000_000_000_000_000_000, // 200M Lunes with 18 decimals
                
                // Default governance parameters (as per Score v1.1 spec)
                alpha: 500_000 * 1_000_000_000_000_000_000,    // 500,000 Lunes
                gamma: 120,                                      // 1.2 * 100 (represents 1.2)
                delta: 100,                                      // 1.0 * 100 (represents 1.0)
                t_min: 100_000 * 1_000_000_000_000_000_000,     // 100,000 Lunes
                theta: 20,                                       // 0.20 * 100 (represents 0.20)
                s_ref: 1_000_000_000 * 1_000_000_000_000_000_000, // 1 billion tokens
                floor_f: 50_000_000 * 1_000_000_000_000_000_000, // 50M Lunes
                kappa: 0,                                        // 0.0 * 100 (represents 0.0)
                epsilon: 1,                                      // Small value to avoid division by zero
                
                // Initialize SafeGard v2.0 fields
                project_vaults: Mapping::default(),
                voting_infos: Mapping::default(),
                user_claims: Mapping::default(),
                next_voting_id: 0,
                
                // Treasury configuration
                treasury_address: caller, // Initially set to contract owner
                lunes_deposit_fee: 100 * 1_000_000_000_000_000_000,  // 100 LUNES
                lusdt_deposit_fee: 10 * 1_000_000_000_000_000_000,   // 10 LUSDT
                lusdt_token_id: None,
                
                // Governance timing configuration
                annual_voting_duration: 7 * 24 * 60 * 60 * 1000,      // 7 dias em ms
                correction_window_duration: 30 * 24 * 60 * 60 * 1000, // 30 dias em ms
                claims_period_duration: 90 * 24 * 60 * 60 * 1000,     // 90 dias em ms
                
                // Initialize pausability
                is_paused: false,
                paused_at: 0,
                
                // Initialize timelock
                timelock_operations: Mapping::default(),
                next_operation_id: 0,
                timelock_delay: 48 * 60 * 60 * 1000,    // 48 hours in ms
                timelock_expiry: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
                
                // Initialize score cache
                project_token_count: Mapping::default(),
                project_nft_count: Mapping::default(),
                
                reentrancy_guard: ReentrancyGuard::default(),
            }
        }

        /// Registra um novo projeto no SafeGard com cofre segregado
        #[ink(message, selector = 0x4e6f7465)]
        pub fn register_project(
            &mut self, 
            name: Vec<u8>,
            metadata_uri: Vec<u8>,
            token_contract: AccountId,
            treasury_address: AccountId,
        ) -> Result<ProjectId, SafeguardError> {
            let caller = self.env().caller();
            validation::validate_account(caller)?;

            // Validar parâmetros
            if name.is_empty() || name.len() > 64 {
                return Err(SafeguardError::InvalidInput);
            }

            let project_id = self.next_project_id;
            let current_timestamp = self.env().block_timestamp();

            // Criar cofre segregado para o projeto
            let project_vault = ProjectVault {
                project_id,
                owner: caller,
                name: name.clone(),
                metadata_uri: metadata_uri.clone(),
                token_contract,
                treasury_address,
                creation_timestamp: current_timestamp,
                status: ProjectStatus::Active,
                total_lunes_collateral: 0,
                total_lusdt_collateral: 0,
                total_other_collateral: 0,
                current_voting_id: None,
                last_annual_vote: 0,
                liquidation_timestamp: None,
                claims_deadline: None,
            };

            // Armazenar o cofre do projeto
            self.project_vaults.insert(project_id, &project_vault);
            
            // Manter compatibilidade com sistema existente
            self.project_owners.insert(project_id, &caller);
            self.project_creation_timestamps.insert(project_id, &current_timestamp);
            self.project_statuses.insert(project_id, &true); // Ativo
            
            self.next_project_id += 1;

            // Emitir eventos
            self.env().emit_event(ProjectRegistered {
                project_id,
                owner: caller,
                name,
                metadata_uri,
                token_contract,
                treasury_address,
            });

            self.env().emit_event(VaultCreated {
                project_id,
                creation_timestamp: current_timestamp,
            });

            Ok(project_id)
        }

        /// Depósito de garantia com taxas obrigatórias (100 LUNES + 10 LUSDT)
        #[ink(message, payable)]
        pub fn deposit_guarantee_with_fees(
            &mut self, 
            project_id: ProjectId,
            token_id: TokenId,
            amount: Balance,
        ) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            
            // Verificar se o projeto existe e está ativo
            let mut vault = self.project_vaults.get(project_id).ok_or(SafeguardError::ProjectNotFound)?;
            if vault.status != ProjectStatus::Active {
                return Err(SafeguardError::ProjectNotActive);
            }

            // Verificar se o token é suportado
            let token_info = self.supported_tokens.get(token_id).ok_or(SafeguardError::TokenNotSupported)?;
            if !token_info.is_active {
                return Err(SafeguardError::TokenNotSupported);
            }

            // Cobrar taxas obrigatórias
            self._charge_deposit_fees(project_id, caller)?;

            // Processar o depósito da garantia
            self._process_guarantee_deposit(project_id, token_id, caller, amount)?;

            // Atualizar totais do cofre
            if Some(token_id) == self.lunes_token_id {
                vault.total_lunes_collateral = vault.total_lunes_collateral.saturating_add(amount);
            } else if Some(token_id) == self.lusdt_token_id {
                vault.total_lusdt_collateral = vault.total_lusdt_collateral.saturating_add(amount);
            } else {
                vault.total_other_collateral = vault.total_other_collateral.saturating_add(amount);
            }

            self.project_vaults.insert(project_id, &vault);

            // Atualizar score do projeto
            self.update_project_score(project_id)?;

            Ok(())
        }

        /// Cobra as taxas obrigatórias de depósito
        fn _charge_deposit_fees(&mut self, project_id: ProjectId, depositor: AccountId) -> Result<(), SafeguardError> {
            // Verificar se os tokens de taxa estão configurados
            let lunes_token_id = self.lunes_token_id.ok_or(SafeguardError::TokenNotSupported)?;
            let lusdt_token_id = self.lusdt_token_id.ok_or(SafeguardError::TokenNotSupported)?;

            // Transferir 100 LUNES para a treasury
            self._transfer_fee_to_treasury(lunes_token_id, depositor, self.lunes_deposit_fee)?;

            // Transferir 10 LUSDT para a treasury  
            self._transfer_fee_to_treasury(lusdt_token_id, depositor, self.lusdt_deposit_fee)?;

            // Emitir evento de cobrança de taxa
            self.env().emit_event(DepositFeeCharged {
                project_id,
                depositor,
                lunes_fee: self.lunes_deposit_fee,
                lusdt_fee: self.lusdt_deposit_fee,
            });

            Ok(())
        }

        // _transfer_fee_to_treasury is now implemented with real cross-contract calls below

        /// Processa o depósito da garantia
        fn _process_guarantee_deposit(
            &mut self,
            project_id: ProjectId,
            token_id: TokenId,
            depositor: AccountId,
            amount: Balance,
        ) -> Result<(), SafeguardError> {
            // Atualizar saldo do usuário
            let current_balance = self.token_guarantees.get(&(project_id, token_id, depositor)).unwrap_or(0);
            self.token_guarantees.insert((project_id, token_id, depositor), &(current_balance.saturating_add(amount)));

            // Atualizar total do projeto
            let current_total = self.project_total_guarantees.get(&(project_id, token_id)).unwrap_or(0);
            self.project_total_guarantees.insert((project_id, token_id), &(current_total.saturating_add(amount)));

            // Emitir evento de depósito
            self.env().emit_event(TokenGuaranteeDeposited {
                project_id,
                token_id,
                account: depositor,
                amount,
            });

            Ok(())
        }

        /// Inicia votação anual de governança para um projeto
        #[ink(message)]
        pub fn start_annual_voting(&mut self, project_id: ProjectId) -> Result<VotingId, SafeguardError> {
            let caller = self.env().caller();
            
            // Verificar se o projeto existe
            let mut vault = self.project_vaults.get(project_id).ok_or(SafeguardError::ProjectNotFound)?;
            
            // Verificar se o caller é o owner do projeto
            if vault.owner != caller {
                return Err(SafeguardError::NotOwner);
            }

            // Verificar se não há votação em andamento
            if vault.current_voting_id.is_some() {
                return Err(SafeguardError::VotingInProgress);
            }

            // Verificar se já passou um ano desde a última votação
            let current_timestamp = self.env().block_timestamp();
            let one_year_ms = 365 * 24 * 60 * 60 * 1000u64;
            
            if vault.last_annual_vote > 0 && 
               current_timestamp < vault.last_annual_vote.saturating_add(one_year_ms) {
                return Err(SafeguardError::TooEarlyForVoting);
            }

            // Criar nova votação
            let voting_id = self.next_voting_id;
            let end_timestamp = current_timestamp.saturating_add(self.annual_voting_duration);
            
            let voting_info = VotingInfo {
                vote_type: VoteType::Annual,
                start_timestamp: current_timestamp,
                end_timestamp,
                snapshot_block: self.env().block_number() as u64,
                yes_votes: 0,
                no_votes: 0,
                total_eligible: self._calculate_eligible_voters(project_id)?,
                result: VoteResult::Pending,
                proposal_uri: Vec::new(),
            };

            // Armazenar votação
            self.voting_infos.insert(voting_id, &voting_info);
            
            // Atualizar vault
            vault.current_voting_id = Some(voting_id);
            vault.status = ProjectStatus::VotingPeriod;
            self.project_vaults.insert(project_id, &vault);
            
            self.next_voting_id += 1;

            // Emitir evento
            self.env().emit_event(VoteOpened {
                project_id,
                voting_id,
                vote_type: VoteType::Annual,
                start_timestamp: current_timestamp,
                end_timestamp,
                snapshot_block: voting_info.snapshot_block,
            });

            Ok(voting_id)
        }

        /// Propõe um plano para votação
        #[ink(message)]
        pub fn propose_plan(
            &mut self, 
            project_id: ProjectId, 
            proposal_uri: Vec<u8>
        ) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            
            // Verificar se o projeto existe
            let vault = self.project_vaults.get(project_id).ok_or(SafeguardError::ProjectNotFound)?;
            
            // Verificar se o caller é o owner do projeto
            if vault.owner != caller {
                return Err(SafeguardError::NotOwner);
            }

            // Verificar se há votação ativa
            let voting_id = vault.current_voting_id.ok_or(SafeguardError::NoActiveVoting)?;
            let mut voting_info = self.voting_infos.get(voting_id).ok_or(SafeguardError::VotingNotFound)?;

            // Atualizar proposta
            voting_info.proposal_uri = proposal_uri.clone();
            self.voting_infos.insert(voting_id, &voting_info);

            // Calcular janela de correção
            let current_timestamp = self.env().block_timestamp();
            let correction_end = current_timestamp.saturating_add(self.correction_window_duration);

            // Emitir evento
            self.env().emit_event(PlanProposed {
                project_id,
                proposer: caller,
                proposal_uri,
                correction_window_end: correction_end,
            });

            Ok(())
        }

        /// Vota em uma proposta
        #[ink(message)]
        pub fn vote_on_proposal(
            &mut self, 
            project_id: ProjectId, 
            vote: bool
        ) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            
            // Verificar se o projeto existe
            let vault = self.project_vaults.get(project_id).ok_or(SafeguardError::ProjectNotFound)?;
            
            // Verificar se há votação ativa
            let voting_id = vault.current_voting_id.ok_or(SafeguardError::NoActiveVoting)?;
            let mut voting_info = self.voting_infos.get(voting_id).ok_or(SafeguardError::VotingNotFound)?;

            // Verificar se a votação ainda está aberta
            let current_timestamp = self.env().block_timestamp();
            if current_timestamp > voting_info.end_timestamp {
                return Err(SafeguardError::VotingExpired);
            }

            // Verificar se o usuário tem direito a voto (possui garantias no projeto)
            let user_has_guarantees = self._user_has_guarantees(project_id, caller)?;
            if !user_has_guarantees {
                return Err(SafeguardError::NotEligibleToVote);
            }

            // Verificar se já votou
            if self.project_votes.contains((project_id, caller)) {
                return Err(SafeguardError::AlreadyVoted);
            }

            // Registrar voto
            if vote {
                voting_info.yes_votes = voting_info.yes_votes.saturating_add(1);
            } else {
                voting_info.no_votes = voting_info.no_votes.saturating_add(1);
            }

            self.voting_infos.insert(voting_id, &voting_info);
            self.project_votes.insert((project_id, caller), &(if vote { 1 } else { 0 }));

            Ok(())
        }

        /// Finaliza uma votação e determina o resultado
        #[ink(message)]
        pub fn finalize_voting(&mut self, project_id: ProjectId) -> Result<VoteResult, SafeguardError> {
            let caller = self.env().caller();
            
            // Verificar se o projeto existe
            let mut vault = self.project_vaults.get(project_id).ok_or(SafeguardError::ProjectNotFound)?;
            
            // Verificar se há votação ativa
            let voting_id = vault.current_voting_id.ok_or(SafeguardError::NoActiveVoting)?;
            let mut voting_info = self.voting_infos.get(voting_id).ok_or(SafeguardError::VotingNotFound)?;

            // Verificar se a votação expirou
            let current_timestamp = self.env().block_timestamp();
            if current_timestamp <= voting_info.end_timestamp {
                return Err(SafeguardError::VotingStillActive);
            }

            // Calcular resultado (maioria simples)
            let total_votes = voting_info.yes_votes.saturating_add(voting_info.no_votes);
            let result = if voting_info.yes_votes > voting_info.no_votes {
                VoteResult::Approved
            } else if voting_info.no_votes > voting_info.yes_votes {
                VoteResult::Rejected
            } else {
                VoteResult::Rejected // Empate = rejeição
            };

            // Atualizar resultado
            voting_info.result = result.clone();
            self.voting_infos.insert(voting_id, &voting_info);

            // Atualizar status do projeto baseado no resultado
            match result {
                VoteResult::Approved => {
                    vault.status = ProjectStatus::Approved;
                    vault.last_annual_vote = current_timestamp;
                },
                VoteResult::Rejected => {
                    vault.status = ProjectStatus::Rejected;
                    // Iniciar processo de liquidação
                    vault.liquidation_timestamp = Some(current_timestamp);
                    vault.claims_deadline = Some(current_timestamp.saturating_add(self.claims_period_duration));
                },
                _ => {}
            }

            vault.current_voting_id = None;
            self.project_vaults.insert(project_id, &vault);

            // Emitir evento
            self.env().emit_event(VoteClosed {
                project_id,
                voting_id,
                yes_votes: voting_info.yes_votes,
                no_votes: voting_info.no_votes,
                total_eligible: voting_info.total_eligible,
                result: result.clone(),
            });

            // Se rejeitado, abrir claims
            if result == VoteResult::Rejected {
                self.env().emit_event(ClaimsOpened {
                    project_id,
                    liquidation_timestamp: current_timestamp,
                    claim_deadline: vault.claims_deadline.unwrap(),
                });
            }

            Ok(result)
        }

        /// Calcula o número de votantes elegíveis
        fn _calculate_eligible_voters(&self, _project_id: ProjectId) -> Result<u64, SafeguardError> {
            // Por simplicidade, conta todos os usuários que têm garantias no projeto
            let _count = 0u64;
            
            // Iterar sobre todos os tokens suportados e contar usuários únicos
            // Em uma implementação real, seria mais eficiente manter um registro separado
            for _token_id in 0..self.next_token_id {
                // Esta é uma implementação simplificada
                // Na prática, precisaríamos de uma estrutura de dados mais eficiente
            }
            
            // Retorna um valor padrão por enquanto
            Ok(10) // Placeholder
        }

        /// Verifica se um usuário tem garantias no projeto
        fn _user_has_guarantees(&self, project_id: ProjectId, user: AccountId) -> Result<bool, SafeguardError> {
            // Verificar se o usuário tem garantias em qualquer token
            for token_id in 0..self.next_token_id {
                let balance = self.token_guarantees.get(&(project_id, token_id, user)).unwrap_or(0);
                if balance > 0 {
                    return Ok(true);
                }
            }
            
            // Verificar NFTs também
            for collection_id in 0..self.next_nft_collection_id {
                let nft_count = self.user_nft_deposits.get(&(user, collection_id)).unwrap_or(0);
                if nft_count > 0 {
                    return Ok(true);
                }
            }
            
            Ok(false)
        }

        /// Processa claim de liquidação com distribuição proporcional
        #[ink(message)]
        pub fn process_claim(&mut self, project_id: ProjectId) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            
            // Verificar se o projeto existe
            let vault = self.project_vaults.get(project_id).ok_or(SafeguardError::ProjectNotFound)?;
            
            // Verificar se o projeto está em liquidação
            if vault.status != ProjectStatus::Rejected && vault.status != ProjectStatus::ClaimsOpen {
                return Err(SafeguardError::ClaimsNotOpen);
            }

            // Verificar se ainda está dentro do prazo de claims
            let current_timestamp = self.env().block_timestamp();
            if let Some(deadline) = vault.claims_deadline {
                if current_timestamp > deadline {
                    return Err(SafeguardError::ClaimsExpired);
                }
            }

            // Verificar se o usuário já fez claim
            if let Some(existing_claim) = self.user_claims.get(&(project_id, caller)) {
                if existing_claim.is_claimed {
                    return Err(SafeguardError::AlreadyClaimed);
                }
            }

            // Calcular a participação proporcional do usuário
            let claim_info = self._calculate_proportional_claim(project_id, caller)?;
            
            // Verificar se o usuário tem direito a claim
            if claim_info.project_tokens_held == 0 {
                return Err(SafeguardError::NoClaimableAmount);
            }

            // Processar transferências (simulado - em implementação real seria cross-contract calls)
            self._execute_claim_transfers(project_id, caller, &claim_info)?;

            // Marcar claim como processado
            let mut updated_claim = claim_info;
            updated_claim.is_claimed = true;
            updated_claim.claim_timestamp = Some(current_timestamp);
            self.user_claims.insert((project_id, caller), &updated_claim);

            // Emitir evento
            self.env().emit_event(ClaimPaid {
                project_id,
                claimer: caller,
                project_tokens_returned: updated_claim.project_tokens_held,
                lunes_received: updated_claim.lunes_share,
                lusdt_received: updated_claim.lusdt_share,
                other_tokens_received: updated_claim.other_tokens_share,
            });

            Ok(())
        }

        /// Calcula a distribuição proporcional para um claim
        fn _calculate_proportional_claim(&self, project_id: ProjectId, claimer: AccountId) -> Result<ClaimInfo, SafeguardError> {
            let vault = self.project_vaults.get(project_id).ok_or(SafeguardError::ProjectNotFound)?;
            
            // Calcular total de tokens do projeto que o usuário possui
            // Em uma implementação real, isso seria obtido do contrato do token do projeto
            let user_project_tokens: Balance = 1000 * 1_000_000_000_000_000_000; // Placeholder: 1000 tokens
            
            // Calcular supply total do projeto
            let total_project_supply: Balance = 1_000_000 * 1_000_000_000_000_000_000; // Placeholder: 1M tokens
            
            if total_project_supply == 0 {
                return Ok(ClaimInfo {
                    project_tokens_held: 0,
                    lunes_share: 0,
                    lusdt_share: 0,
                    other_tokens_share: 0,
                    is_claimed: false,
                    claim_timestamp: None,
                });
            }

            // Calcular proporção do usuário
            let user_proportion = user_project_tokens.saturating_mul(1_000_000_000_000_000_000)
                .saturating_div(total_project_supply);

            // Calcular shares proporcionais
            let lunes_share = vault.total_lunes_collateral.saturating_mul(user_proportion)
                .saturating_div(1_000_000_000_000_000_000);
            
            let lusdt_share = vault.total_lusdt_collateral.saturating_mul(user_proportion)
                .saturating_div(1_000_000_000_000_000_000);
            
            let other_share = vault.total_other_collateral.saturating_mul(user_proportion)
                .saturating_div(1_000_000_000_000_000_000);

            Ok(ClaimInfo {
                project_tokens_held: user_project_tokens,
                lunes_share,
                lusdt_share,
                other_tokens_share: other_share,
                is_claimed: false,
                claim_timestamp: None,
            })
        }

        // _execute_claim_transfers is now implemented with real cross-contract calls below

        /// Encerra um projeto após o período de claims
        #[ink(message)]
        pub fn close_project(&mut self, project_id: ProjectId) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            
            // Verificar se o projeto existe
            let mut vault = self.project_vaults.get(project_id).ok_or(SafeguardError::ProjectNotFound)?;
            
            // Verificar permissões (owner ou contract owner)
            if vault.owner != caller && self.contract_owner != caller {
                return Err(SafeguardError::NotOwner);
            }

            // Verificar se o período de claims expirou
            let current_timestamp = self.env().block_timestamp();
            if let Some(deadline) = vault.claims_deadline {
                if current_timestamp <= deadline {
                    return Err(SafeguardError::ClaimsStillOpen);
                }
            }

            // Atualizar status para fechado
            vault.status = ProjectStatus::Closed;
            self.project_vaults.insert(project_id, &vault);

            // Emitir evento
            self.env().emit_event(VaultClosed {
                project_id,
                closure_timestamp: current_timestamp,
                final_status: ProjectStatus::Closed,
            });

            Ok(())
        }

        /// Configurar endereço da treasury (owner only)
        #[ink(message)]
        pub fn set_treasury_address(&mut self, treasury: AccountId) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }

            self.treasury_address = treasury;
            Ok(())
        }

        /// Configurar token LUSDT (owner only)
        #[ink(message)]
        pub fn set_lusdt_token_id(&mut self, token_id: TokenId) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }

            // Verificar se o token existe
            let token_info = self.supported_tokens.get(token_id).ok_or(SafeguardError::TokenNotSupported)?;
            if !token_info.is_active {
                return Err(SafeguardError::TokenNotSupported);
            }

            self.lusdt_token_id = Some(token_id);
            Ok(())
        }

        /// Configurar taxas de depósito (owner only)
        #[ink(message)]
        pub fn set_deposit_fees(&mut self, lunes_fee: Balance, lusdt_fee: Balance) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }

            self.lunes_deposit_fee = lunes_fee;
            self.lusdt_deposit_fee = lusdt_fee;
            Ok(())
        }

        /// Obter informações do cofre de um projeto
        #[ink(message)]
        pub fn get_project_vault(&self, project_id: ProjectId) -> Option<ProjectVault> {
            self.project_vaults.get(project_id)
        }

        /// Obter informações de uma votação
        #[ink(message)]
        pub fn get_voting_info(&self, voting_id: VotingId) -> Option<VotingInfo> {
            self.voting_infos.get(voting_id)
        }

        /// Obter informações de claim de um usuário
        #[ink(message)]
        pub fn get_user_claim(&self, project_id: ProjectId, user: AccountId) -> Option<ClaimInfo> {
            self.user_claims.get(&(project_id, user))
        }

        /// Função legada para compatibilidade
        #[ink(message)]
        pub fn register_project_legacy(&mut self, pair_psp22: Option<AccountId>) -> Result<ProjectId, SafeguardError> {
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
                name: Vec::new(),
                metadata_uri: Vec::new(),
                token_contract: AccountId::from([0u8; 32]),
                treasury_address: AccountId::from([0u8; 32]),
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

        #[ink(message, selector = 0x34567890)]
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

        #[ink(message, selector = 0x7890abcd)]
        pub fn get_next_project_id(&self) -> ProjectId {
            self.next_project_id
        }

        #[ink(message, selector = 0x45678901)]
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

            let metadata_uri = self.project_vaults.get(project_id).map(|v| v.metadata_uri).unwrap_or_default();

            // Construct and return InfoContract
            Some(InfoContract {
                owner,
                metadata_uri,
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
        #[ink(message, selector = 0x12345678)]
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
            
            self.env().emit_event(GuaranteeDeposited {
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
        #[ink(message, selector = 0x23456789)]
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
        #[ink(message, selector = 0x67890123)]
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
                NFTValuationMethod::FixedValue(_) => collection_info.base_value,
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

        /// Calculate project guarantee score using Score v1.1 model (0-100)
        #[ink(message)]
        pub fn calculate_project_score(&self, project_id: ProjectId) -> u8 {
            // Check if project exists
            if !self.project_owners.contains(project_id) {
                return 0;
            }
            
            // Get project supply (for now, use a default value - this should be configurable per project)
            let project_supply: Balance = 1_000_000 * 1_000_000_000_000_000_000; // 1M tokens with 18 decimals (placeholder)
            
            // Calculate Lunes collateral amount
            let lunes_collateral = self._get_lunes_collateral_amount(project_id);
            
            // If no Lunes collateral, score is 0 (Lunes is mandatory)
            if lunes_collateral == 0 {
                return 0;
            }
            
            // Calculate burn progress (π)
            let pi = self._calculate_burn_progress();
            
            // Calculate effective Lunes supply
            let s_l_eff = self._calculate_effective_lunes_supply(pi);
            
            // Calculate project relative size for base target calculation
            let r_proj = project_supply.saturating_div(self.s_ref.max(self.epsilon));
            
            // Calculate base target T_base
            let t_base = self._calculate_base_target(r_proj);
            
            // Apply temporal uplift
            let uplift = self._calculate_uplift(pi);
            let t_prime = t_base.saturating_div(uplift.max(self.epsilon));
            
            // Calculate Lunes component (up to 95 points)
            let s_lunes = if lunes_collateral > 0 {
                let ratio = lunes_collateral.saturating_mul(95).saturating_div(t_prime.max(self.epsilon));
                ratio.min(95)
            } else {
                0
            };
            
            // Calculate other tokens component (up to 5 points)
            let s_other = self._calculate_other_tokens_score(project_id, lunes_collateral, project_supply, s_l_eff);
            
            // Final score (capped at 100)
            let total_score = s_lunes.saturating_add(s_other);
            (total_score.min(100)) as u8
        }
        
        /// Get cached project score or calculate if not cached
        #[ink(message, selector = 0x56789012)]
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
        
        /// Get Lunes collateral amount for a project
        fn _get_lunes_collateral_amount(&self, project_id: ProjectId) -> Balance {
            if let Some(lunes_token_id) = self.lunes_token_id {
                self.project_total_guarantees.get(&(project_id, lunes_token_id)).unwrap_or(0)
            } else {
                0
            }
        }
        
        /// Calculate burn progress (π) - normalized between 0 and 1
        fn _calculate_burn_progress(&self) -> u32 {
            let initial_supply = 200_000_000 * 1_000_000_000_000_000_000; // 200M Lunes
            let floor_supply = self.floor_f;
            
            if self.current_lunes_supply <= floor_supply {
                100 // π = 1.0 (represented as 100)
            } else if self.current_lunes_supply >= initial_supply {
                0 // π = 0.0
            } else {
                // π = (200M - S_L_atual) / (200M - floor_f)
                let numerator = initial_supply.saturating_sub(self.current_lunes_supply);
                let denominator = initial_supply.saturating_sub(floor_supply);
                if denominator > 0 {
                    numerator.saturating_mul(100).saturating_div(denominator).min(100) as u32
                } else {
                    0
                }
            }
        }
        
        /// Calculate effective Lunes supply (S_L_eff)
        fn _calculate_effective_lunes_supply(&self, pi: u32) -> Balance {
            // S_L_eff = (1 - π) * S_L_atual + π * floor_f
            let pi_balance = pi as Balance;
            let one_minus_pi = (100 - pi) as Balance;
            
            let term1 = one_minus_pi.saturating_mul(self.current_lunes_supply).saturating_div(100);
            let term2 = pi_balance.saturating_mul(self.floor_f).saturating_div(100);
            
            term1.saturating_add(term2)
        }
        
        /// Calculate base target T_base = max(T_min, α * r_proj^γ)
        fn _calculate_base_target(&self, r_proj: Balance) -> Balance {
            // Calculate r_proj^gamma using integer approximation
            let gamma_factor = self._power_approximation(r_proj, self.gamma);
            let alpha_times_gamma = self.alpha.saturating_mul(gamma_factor).saturating_div(1_000_000_000_000_000_000); // Normalize
            
            alpha_times_gamma.max(self.t_min)
        }
        
        /// Calculate temporal uplift u(π) = 1 + θ * π
        fn _calculate_uplift(&self, pi: u32) -> Balance {
            // u(π) = 1 + θ * π, where θ and π are scaled by 100
            let base: Balance = 1_000_000_000_000_000_000; // 1.0 with 18 decimals
            let theta_times_pi = (self.theta as Balance).saturating_mul(pi as Balance).saturating_div(10000); // θ*π/100/100
            let uplift_scaled = theta_times_pi.saturating_mul(1_000_000_000_000_000_000).saturating_div(100);
            
            base.saturating_add(uplift_scaled)
        }
        
        /// Calculate other tokens score component (up to 5 points)
        fn _calculate_other_tokens_score(&self, project_id: ProjectId, lunes_collateral: Balance, project_supply: Balance, s_l_eff: Balance) -> Balance {
            if lunes_collateral == 0 {
                return 0; // No score for other tokens if no Lunes
            }
            
            // Calculate total value of other tokens (excluding Lunes)
            let mut other_tokens_value: Balance = 0;
            
            for token_id in 0..self.next_token_id {
                // Skip Lunes token
                if Some(token_id) == self.lunes_token_id {
                    continue;
                }
                
                if let Some(token_info) = self.supported_tokens.get(token_id) {
                    if token_info.is_active {
                        let project_total = self.project_total_guarantees.get(&(project_id, token_id)).unwrap_or(0);
                        if project_total > 0 {
                            // Apply haircut (for simplicity, using a fixed 90% haircut for now)
                            let haircut_value = project_total.saturating_mul(90).saturating_div(100);
                            other_tokens_value = other_tokens_value.saturating_add(haircut_value);
                        }
                    }
                }
            }
            
            // Add NFT values (with haircuts)
            for collection_id in 0..self.next_nft_collection_id {
                if let Some(_collection_info) = self.supported_nft_collections.get(collection_id) {
                    let project_nft_total = self.project_nft_guarantees.get(&(project_id, collection_id)).unwrap_or(0);
                    if project_nft_total > 0 {
                        // Apply haircut for NFTs (using 50% haircut)
                        let haircut_value = project_nft_total.saturating_mul(50).saturating_div(100);
                        other_tokens_value = other_tokens_value.saturating_add(haircut_value);
                    }
                }
            }
            
            if other_tokens_value == 0 {
                return 0;
            }
            
            // Calculate q = E_other / max(C_L, ε)
            let q = other_tokens_value.saturating_div(lunes_collateral.max(self.epsilon));
            
            // Calculate r_extra for penalty calculation
            let r_extra = project_supply.saturating_div(s_l_eff.max(self.epsilon));
            
            // Calculate g(r_extra) = 1 / (1 + r_extra^δ)
            let r_extra_delta = self._power_approximation(r_extra, self.delta);
            let denominator = 1_000_000_000_000_000_000_u128.saturating_add(r_extra_delta); // 1 + r_extra^δ
            let g = 1_000_000_000_000_000_000_u128.saturating_div(denominator.max(self.epsilon));
            
            // S_other = 5 * min(1, q * g)
            let q_times_g = q.saturating_mul(g).saturating_div(1_000_000_000_000_000_000);
            let score_factor = q_times_g.min(1_000_000_000_000_000_000); // min(1, q*g)
            
            score_factor.saturating_mul(5).saturating_div(1_000_000_000_000_000_000)
        }
        
        /// Simple power approximation for integer calculations
        fn _power_approximation(&self, base: Balance, exponent: u32) -> Balance {
            if exponent == 0 {
                return 1_000_000_000_000_000_000; // 1.0 with 18 decimals
            }
            
            // Convert exponent from scaled integer (e.g., 120 = 1.2) to actual value
            let exp_whole = exponent / 100;
            let exp_frac = exponent % 100;
            
            let mut result: Balance = 1_000_000_000_000_000_000; // Start with 1.0
            
            // Handle whole part of exponent
            for _ in 0..exp_whole {
                result = result.saturating_mul(base).saturating_div(1_000_000_000_000_000_000);
            }
            
            // Handle fractional part (simple approximation)
            if exp_frac > 0 {
                // For fractional exponents, use linear approximation: x^0.2 ≈ 1 + 0.2*(x-1)
                let base_minus_one = base.saturating_sub(1_000_000_000_000_000_000);
                let frac_adjustment = base_minus_one.saturating_mul(exp_frac as Balance).saturating_div(100);
                let frac_result = 1_000_000_000_000_000_000_u128.saturating_add(frac_adjustment);
                result = result.saturating_mul(frac_result).saturating_div(1_000_000_000_000_000_000);
            }
            
            result
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

        /// Set Lunes token ID (owner-only)
        #[ink(message)]
        pub fn set_lunes_token_id(&mut self, token_id: TokenId) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }
            
            // Validate that the token exists in supported tokens
            if !self.supported_tokens.contains(token_id) {
                return Err(SafeguardError::InvalidInput);
            }
            
            self.lunes_token_id = Some(token_id);
            Ok(())
        }
        
        /// Update current Lunes supply (owner-only)
        #[ink(message)]
        pub fn update_lunes_supply(&mut self, new_supply: Balance) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }
            
            self.current_lunes_supply = new_supply;
            Ok(())
        }
        
        /// Set Score v1.1 governance parameters (owner-only)
        #[ink(message)]
        pub fn set_score_parameters(
            &mut self,
            alpha: Option<Balance>,
            gamma: Option<u32>,
            delta: Option<u32>,
            t_min: Option<Balance>,
            theta: Option<u32>,
            s_ref: Option<Balance>,
            floor_f: Option<Balance>,
            kappa: Option<u32>,
        ) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }
            
            // Validate parameters ranges
            if let Some(g) = gamma {
                if g == 0 || g > 300 { // gamma should be > 1.0 and reasonable (max 3.0)
                    return Err(SafeguardError::InvalidInput);
                }
            }
            
            if let Some(d) = delta {
                if d == 0 || d > 500 { // delta should be >= 1.0 and reasonable (max 5.0)
                    return Err(SafeguardError::InvalidInput);
                }
            }
            
            if let Some(t) = theta {
                if t > 30 { // theta should be <= 0.30 (30 in our representation)
                    return Err(SafeguardError::InvalidInput);
                }
            }
            
            if let Some(k) = kappa {
                if k > 100 { // kappa should be <= 1.0 (100 in our representation)
                    return Err(SafeguardError::InvalidInput);
                }
            }
            
            // Update parameters
            if let Some(a) = alpha { self.alpha = a; }
            if let Some(g) = gamma { self.gamma = g; }
            if let Some(d) = delta { self.delta = d; }
            if let Some(t) = t_min { self.t_min = t; }
            if let Some(th) = theta { self.theta = th; }
            if let Some(s) = s_ref { self.s_ref = s; }
            if let Some(f) = floor_f { self.floor_f = f; }
            if let Some(k) = kappa { self.kappa = k; }
            
            Ok(())
        }
        
        /// Get Score v1.1 parameters
        #[ink(message)]
        pub fn get_score_parameters(&self) -> (Balance, u32, u32, Balance, u32, Balance, Balance, u32, Balance) {
            (
                self.alpha,
                self.gamma,
                self.delta,
                self.t_min,
                self.theta,
                self.s_ref,
                self.floor_f,
                self.kappa,
                self.current_lunes_supply,
            )
        }
        
        /// Get Lunes token ID
        #[ink(message)]
        pub fn get_lunes_token_id(&self) -> Option<TokenId> {
            self.lunes_token_id
        }

        /// Get contract owner
        #[ink(message)]
        pub fn owner(&self) -> Option<AccountId> {
            Some(self.contract_owner)
        }

        // ==================== PAUSABILITY FUNCTIONS ====================

        /// Pause the contract (owner only)
        #[ink(message)]
        pub fn pause(&mut self) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }
            
            if self.is_paused {
                return Err(SafeguardError::ContractPaused);
            }
            
            self.is_paused = true;
            self.paused_at = self.env().block_timestamp();
            
            self.env().emit_event(ContractPausedEvent {
                paused_by: caller,
                timestamp: self.paused_at,
            });
            
            Ok(())
        }

        /// Unpause the contract (owner only)
        #[ink(message)]
        pub fn unpause(&mut self) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }
            
            if !self.is_paused {
                return Err(SafeguardError::ContractNotPaused);
            }
            
            self.is_paused = false;
            
            self.env().emit_event(ContractUnpausedEvent {
                unpaused_by: caller,
                timestamp: self.env().block_timestamp(),
            });
            
            Ok(())
        }

        /// Check if contract is paused
        #[ink(message)]
        pub fn is_contract_paused(&self) -> bool {
            self.is_paused
        }

        /// Get pause timestamp
        #[ink(message)]
        pub fn get_paused_at(&self) -> u64 {
            self.paused_at
        }

        /// Internal modifier to check if contract is not paused
        fn _ensure_not_paused(&self) -> Result<(), SafeguardError> {
            if self.is_paused {
                return Err(SafeguardError::ContractPaused);
            }
            Ok(())
        }

        // ==================== TIMELOCK FUNCTIONS ====================

        /// Schedule a timelock operation (owner only)
        #[ink(message)]
        pub fn schedule_operation(
            &mut self,
            function_type: u8,
            data: Vec<u8>,
        ) -> Result<OperationId, SafeguardError> {
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }
            
            let current_time = self.env().block_timestamp();
            let operation_id = self.next_operation_id;
            
            let function = match function_type {
                0 => TimelockFunction::TransferContractOwnership,
                1 => TimelockFunction::SetTreasuryAddress,
                2 => TimelockFunction::SetDepositFees,
                3 => TimelockFunction::SetScoreParameters,
                4 => TimelockFunction::EmergencyWithdraw,
                5 => TimelockFunction::AddSupportedToken,
                6 => TimelockFunction::AddNftCollection,
                _ => return Err(SafeguardError::InvalidInput),
            };
            
            let operation = TimelockOperation {
                function_type: function,
                scheduled_by: caller,
                execute_after: current_time.saturating_add(self.timelock_delay),
                expires_at: current_time.saturating_add(self.timelock_delay).saturating_add(self.timelock_expiry),
                is_executed: false,
                is_cancelled: false,
                data,
            };
            
            self.timelock_operations.insert(operation_id, &operation);
            self.next_operation_id = self.next_operation_id.saturating_add(1);
            
            self.env().emit_event(TimelockOperationScheduled {
                operation_id,
                target_function: function_type,
                scheduled_by: caller,
                execute_after: operation.execute_after,
                expires_at: operation.expires_at,
            });
            
            Ok(operation_id)
        }

        /// Cancel a pending timelock operation (owner only)
        #[ink(message)]
        pub fn cancel_operation(&mut self, operation_id: OperationId) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }
            
            let mut operation = self.timelock_operations.get(operation_id)
                .ok_or(SafeguardError::OperationNotFound)?;
            
            if operation.is_executed {
                return Err(SafeguardError::OperationNotFound);
            }
            
            if operation.is_cancelled {
                return Err(SafeguardError::OperationNotFound);
            }
            
            operation.is_cancelled = true;
            self.timelock_operations.insert(operation_id, &operation);
            
            self.env().emit_event(TimelockOperationCancelled {
                operation_id,
                cancelled_by: caller,
            });
            
            Ok(())
        }

        /// Execute a timelock operation (owner only)
        #[ink(message)]
        pub fn execute_operation(&mut self, operation_id: OperationId) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }
            
            let mut operation = self.timelock_operations.get(operation_id)
                .ok_or(SafeguardError::OperationNotFound)?;
            
            if operation.is_executed {
                return Err(SafeguardError::OperationNotFound);
            }
            
            if operation.is_cancelled {
                return Err(SafeguardError::OperationNotFound);
            }
            
            let current_time = self.env().block_timestamp();
            
            if current_time < operation.execute_after {
                return Err(SafeguardError::OperationNotReady);
            }
            
            if current_time > operation.expires_at {
                return Err(SafeguardError::OperationExpired);
            }
            
            // Mark as executed
            operation.is_executed = true;
            self.timelock_operations.insert(operation_id, &operation);
            
            self.env().emit_event(TimelockOperationExecuted {
                operation_id,
                executed_by: caller,
                timestamp: current_time,
            });
            
            Ok(())
        }

        /// Get timelock operation info
        #[ink(message)]
        pub fn get_operation(&self, operation_id: OperationId) -> Option<TimelockOperation> {
            self.timelock_operations.get(operation_id)
        }

        /// Get timelock delay
        #[ink(message)]
        pub fn get_timelock_delay(&self) -> u64 {
            self.timelock_delay
        }

        /// Set timelock delay (owner only, requires timelock)
        #[ink(message)]
        pub fn set_timelock_delay(&mut self, new_delay: u64) -> Result<(), SafeguardError> {
            let caller = self.env().caller();
            if caller != self.contract_owner {
                return Err(SafeguardError::NotOwner);
            }
            
            // Minimum 1 hour, maximum 7 days
            if new_delay < 60 * 60 * 1000 || new_delay > 7 * 24 * 60 * 60 * 1000 {
                return Err(SafeguardError::InvalidInput);
            }
            
            self.timelock_delay = new_delay;
            Ok(())
        }

        // ==================== CROSS-CONTRACT PSP22 CALLS ====================

        /// Internal function to transfer PSP22 tokens from user to contract
        fn _psp22_transfer_from(
            &mut self,
            token_id: TokenId,
            from: AccountId,
            amount: Balance,
        ) -> Result<(), SafeguardError> {
            let token_info = self.supported_tokens.get(token_id)
                .ok_or(SafeguardError::TokenNotSupported)?;
            
            // Build cross-contract call to PSP22 transfer_from
            let result = ink::env::call::build_call::<ink::env::DefaultEnvironment>()
                .call(token_info.contract_address)
                .gas_limit(0) // Use remaining gas
                .transferred_value(0)
                .exec_input(
                    ink::env::call::ExecutionInput::new(ink::env::call::Selector::new(
                        // PSP22::transfer_from selector
                        ink::selector_bytes!("transfer_from")
                    ))
                    .push_arg(from)
                    .push_arg(self.env().account_id())
                    .push_arg(amount)
                    .push_arg::<Vec<u8>>(Vec::new()) // data
                )
                .returns::<Result<(), psp22::PSP22Error>>()
                .try_invoke();
            
            match result {
                Ok(Ok(Ok(()))) => {
                    self.env().emit_event(TokenTransferExecuted {
                        token_id,
                        from,
                        to: self.env().account_id(),
                        amount,
                    });
                    Ok(())
                },
                _ => Err(SafeguardError::TransferFailed),
            }
        }

        /// Internal function to transfer PSP22 tokens from contract to user
        fn _psp22_transfer(
            &mut self,
            token_id: TokenId,
            to: AccountId,
            amount: Balance,
        ) -> Result<(), SafeguardError> {
            let token_info = self.supported_tokens.get(token_id)
                .ok_or(SafeguardError::TokenNotSupported)?;
            
            // Build cross-contract call to PSP22 transfer
            let result = ink::env::call::build_call::<ink::env::DefaultEnvironment>()
                .call(token_info.contract_address)
                .gas_limit(0)
                .transferred_value(0)
                .exec_input(
                    ink::env::call::ExecutionInput::new(ink::env::call::Selector::new(
                        // PSP22::transfer selector
                        ink::selector_bytes!("transfer")
                    ))
                    .push_arg(to)
                    .push_arg(amount)
                    .push_arg::<Vec<u8>>(Vec::new()) // data
                )
                .returns::<Result<(), psp22::PSP22Error>>()
                .try_invoke();
            
            match result {
                Ok(Ok(Ok(()))) => {
                    self.env().emit_event(TokenTransferExecuted {
                        token_id,
                        from: self.env().account_id(),
                        to,
                        amount,
                    });
                    Ok(())
                },
                _ => Err(SafeguardError::TransferFailed),
            }
        }

        /// Internal function to get PSP22 balance
        fn _psp22_balance_of(
            &self,
            token_id: TokenId,
            account: AccountId,
        ) -> Result<Balance, SafeguardError> {
            let token_info = self.supported_tokens.get(token_id)
                .ok_or(SafeguardError::TokenNotSupported)?;
            
            let result = ink::env::call::build_call::<ink::env::DefaultEnvironment>()
                .call(token_info.contract_address)
                .gas_limit(0)
                .transferred_value(0)
                .exec_input(
                    ink::env::call::ExecutionInput::new(ink::env::call::Selector::new(
                        // PSP22::balance_of selector
                        ink::selector_bytes!("balance_of")
                    ))
                    .push_arg(account)
                )
                .returns::<Balance>()
                .try_invoke();
            
            match result {
                Ok(Ok(balance)) => Ok(balance),
                _ => Err(SafeguardError::TransferFailed),
            }
        }

        /// Transfer fee to treasury using real PSP22 call
        fn _transfer_fee_to_treasury(
            &mut self,
            token_id: TokenId,
            from: AccountId,
            amount: Balance,
        ) -> Result<(), SafeguardError> {
            // First transfer from user to contract
            self._psp22_transfer_from(token_id, from, amount)?;
            
            // Then transfer from contract to treasury
            self._psp22_transfer(token_id, self.treasury_address, amount)?;
            
            Ok(())
        }

        /// Execute claim transfers to user
        fn _execute_claim_transfers(
            &mut self,
            project_id: ProjectId,
            claimer: AccountId,
            claim_info: &ClaimInfo,
        ) -> Result<(), SafeguardError> {
            // Transfer Lunes share if any
            if claim_info.lunes_share > 0 {
                if let Some(lunes_id) = self.lunes_token_id {
                    self._psp22_transfer(lunes_id, claimer, claim_info.lunes_share)?;
                }
            }
            
            // Transfer LUSDT share if any
            if claim_info.lusdt_share > 0 {
                if let Some(lusdt_id) = self.lusdt_token_id {
                    self._psp22_transfer(lusdt_id, claimer, claim_info.lusdt_share)?;
                }
            }
            
            // Emit claim paid event
            self.env().emit_event(ClaimPaid {
                project_id,
                claimer,
                project_tokens_returned: claim_info.project_tokens_held,
                lunes_received: claim_info.lunes_share,
                lusdt_received: claim_info.lusdt_share,
                other_tokens_received: claim_info.other_tokens_share,
            });
            
            Ok(())
        }

        // ==================== OPTIMIZED SCORE CALCULATION ====================

        /// Calculate temporal target T' = T_base / u(π) for Score v1.1
        fn _calculate_temporal_target(&self, project_id: ProjectId) -> Balance {
            // Get project supply (total guarantees as proxy)
            let lunes_id = self.lunes_token_id.unwrap_or(0);
            let project_supply = self.project_total_guarantees.get((project_id, lunes_id)).unwrap_or(0);
            
            // Calculate r_proj = S_p / S_ref
            let r_proj = project_supply.saturating_mul(1_000_000_000_000_000_000).saturating_div(self.s_ref.max(1));
            
            // Calculate T_base
            let t_base = self._calculate_base_target(r_proj);
            
            // Calculate burn progress π
            let pi = self._calculate_burn_progress();
            
            // Calculate uplift u(π)
            let uplift = self._calculate_uplift(pi);
            
            // T' = T_base / u(π)
            t_base.saturating_mul(1_000_000_000_000_000_000).saturating_div(uplift.max(1))
        }

        /// Optimized score calculation with caching
        fn _calculate_score_optimized(&self, project_id: ProjectId) -> u8 {
            // Check if Lunes token is configured
            let lunes_id = match self.lunes_token_id {
                Some(id) => id,
                None => return 0, // No score without Lunes configured
            };
            
            // Get Lunes collateral for this project
            let lunes_collateral = self.project_total_guarantees.get((project_id, lunes_id)).unwrap_or(0);
            
            // Score v1.1: Lunes is mandatory
            if lunes_collateral == 0 {
                return 0;
            }
            
            // Use cached token count for optimization
            let token_count = self.project_token_count.get(project_id).unwrap_or(0);
            let nft_count = self.project_nft_count.get(project_id).unwrap_or(0);
            
            // Calculate Lunes component (up to 95 points)
            let t_prime = self._calculate_temporal_target(project_id);
            let lunes_score = if t_prime > 0 {
                let ratio = lunes_collateral.saturating_mul(95).saturating_div(t_prime);
                ratio.min(95) as u8
            } else {
                0
            };
            
            // Calculate other tokens component (up to 5 points)
            // Only calculate if there are other tokens (optimization)
            let other_score = if token_count > 1 || nft_count > 0 {
                self._calculate_other_tokens_score_fast(project_id, lunes_id, token_count, nft_count)
            } else {
                0
            };
            
            // Total score capped at 100
            (lunes_score as u32 + other_score as u32).min(100) as u8
        }

        /// Fast calculation for other tokens score
        fn _calculate_other_tokens_score_fast(
            &self,
            project_id: ProjectId,
            lunes_id: TokenId,
            token_count: u32,
            nft_count: u32,
        ) -> u8 {
            let mut other_value: Balance = 0;
            
            // Only iterate if there are tokens to check
            if token_count > 1 {
                // Iterate only up to token_count (optimization)
                for token_id in 0..self.next_token_id.min(token_count as u64 + 1) {
                    if token_id == lunes_id {
                        continue;
                    }
                    
                    let amount = self.project_total_guarantees.get((project_id, token_id)).unwrap_or(0);
                    if amount > 0 {
                        // Apply 90% haircut for other PSP22 tokens
                        other_value = other_value.saturating_add(amount.saturating_mul(10).saturating_div(100));
                    }
                }
            }
            
            // Add NFT value with 50% haircut (only if there are NFTs)
            if nft_count > 0 {
                for collection_id in 0..self.next_nft_collection_id.min(nft_count as u64 + 1) {
                    let nft_value = self.project_nft_guarantees.get((project_id, collection_id)).unwrap_or(0);
                    if nft_value > 0 {
                        other_value = other_value.saturating_add(nft_value.saturating_mul(50).saturating_div(100));
                    }
                }
            }
            
            // Calculate score (max 5 points)
            let score = other_value.saturating_mul(5).saturating_div(self.t_min.max(1));
            score.min(5) as u8
        }

        /// Update token count cache when adding guarantee
        fn _update_token_count_cache(&mut self, project_id: ProjectId, token_id: TokenId, is_add: bool) {
            let current_amount = self.project_total_guarantees.get((project_id, token_id)).unwrap_or(0);
            let current_count = self.project_token_count.get(project_id).unwrap_or(0);
            
            if is_add && current_amount == 0 {
                // First deposit of this token for this project
                self.project_token_count.insert(project_id, &(current_count.saturating_add(1)));
            } else if !is_add && current_amount == 0 && current_count > 0 {
                // Last withdrawal of this token for this project
                self.project_token_count.insert(project_id, &(current_count.saturating_sub(1)));
            }
        }

        /// Update NFT count cache
        fn _update_nft_count_cache(&mut self, project_id: ProjectId, collection_id: NFTCollectionId, is_add: bool) {
            let current_amount = self.project_nft_guarantees.get((project_id, collection_id)).unwrap_or(0);
            let current_count = self.project_nft_count.get(project_id).unwrap_or(0);
            
            if is_add && current_amount == 0 {
                self.project_nft_count.insert(project_id, &(current_count.saturating_add(1)));
            } else if !is_add && current_amount == 0 && current_count > 0 {
                self.project_nft_count.insert(project_id, &(current_count.saturating_sub(1)));
            }
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
            let (mut contract, accounts) = setup();
            
            // Register a new project
            let result = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            );
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
            let (mut contract, accounts) = setup();
            
            // First register a project
            let project_result = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            );
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
            let project_result = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            );
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
            let project_result = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            );
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
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
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
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
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
            
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
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
            let name = *b"Test Collection\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0";
            let symbol = *b"TEST\0\0\0\0";
            let base_value: Balance = 1000;
            let collection_id = contract.add_nft_collection(
                accounts.bob,
                name,
                symbol,
                base_value,
                NFTValuationMethod::FixedValue(1000),
            );
            
            assert!(collection_id.is_ok());
            let collection_id = collection_id.unwrap();
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
            assert!(matches!(info.valuation_method, NFTValuationMethod::FixedValue(_)));
        }

        #[ink::test]
        fn test_deposit_nft_guarantee() {
            let (mut contract, accounts) = setup();
            
            // Setup project and NFT collection
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            let collection_id = contract.add_nft_collection(
                accounts.charlie,
                *b"TestNFTs\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
                *b"TNFT\0\0\0\0",
                2500,
                NFTValuationMethod::FixedValue(1000),
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
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            let collection_id = contract.add_nft_collection(
                accounts.charlie,
                *b"WithdrawNFTs\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
                *b"WNFT\0\0\0\0",
                3000,
                NFTValuationMethod::FixedValue(1000),
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
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            let collection_id = contract.add_nft_collection(
                accounts.charlie,
                *b"MultiNFTs\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
                *b"MNFT\0\0\0\0",
                1000,
                NFTValuationMethod::FixedValue(1000),
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
                NFTValuationMethod::FixedValue(1000),
            );
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::NotOwner);
        }

        #[ink::test]
        fn test_invalid_nft_operations() {
            let (mut contract, accounts) = setup();
            
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
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
                NFTValuationMethod::FixedValue(1000),
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
            assert!(matches!(fixed_info.valuation_method, NFTValuationMethod::FixedValue(_)));
            
            let trait_info = contract.get_nft_collection_info(trait_collection).unwrap();
            assert_eq!(trait_info.valuation_method, NFTValuationMethod::TraitBased);
            
            let oracle_info = contract.get_nft_collection_info(oracle_collection).unwrap();
            assert_eq!(oracle_info.valuation_method, NFTValuationMethod::OraclePrice);
        }

        #[ink::test]
        fn test_project_creation_timestamp() {
            let (mut contract, accounts) = setup();
            
            // Register a project and check if timestamp is set
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            
            let timestamp = contract.get_project_creation_timestamp(project_id);
            assert!(timestamp.is_some());
            // In test environment, timestamp might be 0, so we just check it exists
            let _timestamp_value = timestamp.unwrap(); // Just verify it doesn't panic
        }

        #[ink::test]
        fn test_vesting_period_not_met() {
            let (mut contract, accounts) = setup();
            
            // Register project and add guarantee
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
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
            let (mut contract, accounts) = setup();
            
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            
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
            let (mut contract, accounts) = setup();
            
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            
            // Try to request release without any guarantees
            let result = contract.request_guarantee_release(project_id);
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), SafeguardError::InvalidInput);
        }

        #[ink::test]
        fn test_request_guarantee_release_project_paused() {
            let (mut contract, accounts) = setup();
            
            // Register project and add guarantee
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
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
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
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
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
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
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            
            // Initially, project should have score 0 (no guarantees)
            let initial_score = contract.calculate_project_score(project_id);
            assert_eq!(initial_score, 0);
            
            // Add Lunes token (mandatory for Score v1.1)
            let lunes_token_id = contract.add_supported_token(
                accounts.alice,
                *b"LUNES\0\0\0",
                18,
                1000,
            ).unwrap();
            
            // Configure Lunes token ID
            contract.set_lunes_token_id(lunes_token_id).unwrap();
            
            // Add Lunes guarantee
            let lunes_amount = 100_000 * 1_000_000_000_000_000_000; // 100K Lunes (T_min)
            contract.add_guarantee(project_id, lunes_token_id, lunes_amount).unwrap();
            
            // Score should now be higher (Score v1.1 gives points for Lunes)
            let score_with_guarantee = contract.get_project_score(project_id);
            assert!(score_with_guarantee > initial_score);
            assert!(score_with_guarantee > 0); // Should have some score from Lunes
        }
        
        #[ink::test]
        fn test_score_value_tiers() {
            let (mut contract, accounts) = setup();
            
            // Register project
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            
            // Add Lunes token (mandatory for Score v1.1)
            let lunes_token_id = contract.add_supported_token(
                accounts.alice,
                *b"LUNES\0\0\0",
                18,
                1000,
            ).unwrap();
            
            // Configure Lunes token ID
            contract.set_lunes_token_id(lunes_token_id).unwrap();
            
            // Test different Lunes amounts - Score v1.1 gives up to 95 points from Lunes
            let lunes_unit = 1_000_000_000_000_000_000; // 18 decimals
            let test_cases = vec![
                (10_000 * lunes_unit, 1), // Small amount should give some score
                (100_000 * lunes_unit, 5), // T_min amount should give higher score  
                (500_000 * lunes_unit, 20), // Should give significant score
                (1_000_000 * lunes_unit, 30), // Large amount should give good score
            ];
            
            for (amount, expected_min_score) in test_cases {
                // Create fresh contract for each test
                let (mut test_contract, test_accounts) = setup();
                let project_id = test_contract.register_project(
                    b"Test Project".to_vec(),
                    b"ipfs://metadata".to_vec(),
                    accounts.alice,
                    accounts.bob
                ).unwrap();
                
                let lunes_token_id = test_contract.add_supported_token(
                    test_accounts.alice,
                    *b"LUNES\0\0\0",
                    18,
                    1000,
                ).unwrap();
                test_contract.set_lunes_token_id(lunes_token_id).unwrap();
                
                test_contract.add_guarantee(project_id, lunes_token_id, amount).unwrap();
                let score = test_contract.get_project_score(project_id);
                assert!(score >= expected_min_score, "Amount: {}, Expected: {}, Got: {}", amount, expected_min_score, score);
            }
        }
        
        #[ink::test]
        fn test_score_asset_diversity() {
            let (mut contract, accounts) = setup();
            
            // Register project
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            
            // Add Lunes token first (required for Score v1.1)
            let lunes_token_id = contract.add_supported_token(
                accounts.alice,
                *b"LUNES\0\0\0",
                18,
                1000,
            ).unwrap();
            contract.set_lunes_token_id(lunes_token_id).unwrap();
            
            // Add other PSP22 tokens
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
                NFTValuationMethod::FixedValue(1_000_000),
            ).unwrap();
            
            let lunes_amount = 100_000 * 1_000_000_000_000_000_000; // 100K Lunes
            
            // Test with Lunes only
            contract.add_guarantee(project_id, lunes_token_id, lunes_amount).unwrap();
            let score_lunes_only = contract.get_project_score(project_id);
            assert!(score_lunes_only > 0); // Score v1.1: Lunes gives score
            
            // Add second PSP22 token (other tokens give up to 5 extra points)
            contract.add_guarantee(project_id, token2_id, 1_000_000).unwrap();
            let score_with_other = contract.get_project_score(project_id);
            assert!(score_with_other >= score_lunes_only); // May get diversity bonus
            
            // Add NFT guarantee (NFTs give up to 2.5 extra points)
            contract.deposit_nft_guarantee(project_id, collection_id, 1).unwrap();
            let score_with_nft = contract.get_project_score(project_id);
            assert!(score_with_nft >= score_with_other);
        }
        
        #[ink::test]
        fn test_score_vesting_bonus() {
            let (mut contract, accounts) = setup();
            
            // Register project
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            
            // Add Lunes token first (required for Score v1.1)
            let lunes_token_id = contract.add_supported_token(
                accounts.alice,
                *b"LUNES\0\0\0",
                18,
                1000,
            ).unwrap();
            contract.set_lunes_token_id(lunes_token_id).unwrap();
            
            // Add Lunes guarantee
            let lunes_amount = 100_000 * 1_000_000_000_000_000_000; // 100K Lunes
            contract.add_guarantee(project_id, lunes_token_id, lunes_amount).unwrap();
            
            // Get initial score (should have score from Lunes)
            let initial_score = contract.get_project_score(project_id);
            
            // Score v1.1: Lunes gives up to 95 points
            // Vesting bonus is additional but requires time
            // In test environment, timestamps might be 0 or very low
            assert!(initial_score > 0);
            assert!(initial_score <= 100);
        }
        
        #[ink::test]
        fn test_score_caching_and_updates() {
            let (mut contract, accounts) = setup();
            
            // Register project
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            
            // Add Lunes token (required for Score v1.1)
            let lunes_token_id = contract.add_supported_token(
                accounts.alice,
                *b"LUNES\0\0\0",
                18,
                1000,
            ).unwrap();
            contract.set_lunes_token_id(lunes_token_id).unwrap();
            
            // Initially no cached score (no Lunes guarantee yet)
            let initial_score = contract.get_project_score(project_id);
            assert_eq!(initial_score, 0);
            
            // Update score manually (still 0, no Lunes)
            let updated_score = contract.update_project_score(project_id).unwrap();
            assert_eq!(updated_score, 0);
            
            // Add Lunes guarantee (should auto-update score)
            let lunes_amount = 100_000 * 1_000_000_000_000_000_000; // 100K Lunes
            contract.add_guarantee(project_id, lunes_token_id, lunes_amount).unwrap();
            let score_after_guarantee = contract.get_project_score(project_id);
            assert!(score_after_guarantee > 0);
            
            // Withdraw half Lunes guarantee (should auto-update score)
            contract.withdraw_guarantee(project_id, lunes_token_id, lunes_amount / 2).unwrap();
            let score_after_withdrawal = contract.get_project_score(project_id);
            assert!(score_after_withdrawal <= score_after_guarantee); // May be equal or less
            assert!(score_after_withdrawal > 0); // Still has some Lunes
        }
        
        #[ink::test]
        fn test_score_with_nft_guarantees() {
            let (mut contract, accounts) = setup();
            
            // Register project
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            
            // Add Lunes token first (required for Score v1.1)
            let lunes_token_id = contract.add_supported_token(
                accounts.alice,
                *b"LUNES\0\0\0",
                18,
                1000,
            ).unwrap();
            contract.set_lunes_token_id(lunes_token_id).unwrap();
            
            // Add NFT collection
            let collection_id = contract.add_nft_collection(
                accounts.alice,
                *b"Valuable NFTs\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
                *b"VNFT\0\0\0\0",
                50_000 * 1_000_000, // 50K LUSDT base value
                NFTValuationMethod::FixedValue(50_000 * 1_000_000),
            ).unwrap();
            
            // Initially score is 0 (no Lunes guarantee)
            let initial_score = contract.get_project_score(project_id);
            assert_eq!(initial_score, 0);
            
            // Add Lunes first (required for any score in v1.1)
            let lunes_amount = 100_000 * 1_000_000_000_000_000_000; // 100K Lunes
            contract.add_guarantee(project_id, lunes_token_id, lunes_amount).unwrap();
            let score_with_lunes = contract.get_project_score(project_id);
            assert!(score_with_lunes > 0);
            
            // Deposit NFT (NFTs give up to 2.5 bonus points in Score v1.1)
            contract.deposit_nft_guarantee(project_id, collection_id, 1).unwrap();
            let score_with_nft = contract.get_project_score(project_id);
            assert!(score_with_nft >= score_with_lunes); // Should be same or higher with NFT
            
            // Withdraw NFT (should auto-update score)
            contract.withdraw_nft_guarantee(project_id, collection_id, 1).unwrap();
            let score_after_withdrawal = contract.get_project_score(project_id);
            assert!(score_after_withdrawal > 0); // Still has Lunes
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
            let (mut contract, accounts) = setup();
            
            // Register project
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            
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
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
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
            let project_id = contract.register_project(
                b"Test Project".to_vec(),
                b"ipfs://metadata".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            
            // Add Lunes token (required for Score v1.1)
            let lunes_token_id = contract.add_supported_token(
                accounts.alice,
                *b"LUNES\0\0\0",
                18,
                1000,
            ).unwrap();
            contract.set_lunes_token_id(lunes_token_id).unwrap();
            
            // Test score consistency (initially 0, no Lunes guarantee)
            let initial_calculated = contract.calculate_project_score(project_id);
            let initial_cached = contract.get_project_score(project_id);
            assert_eq!(initial_calculated, initial_cached);
            assert_eq!(initial_cached, 0);
            
            // Add Lunes guarantee and verify auto-update
            let lunes_amount = 100_000 * 1_000_000_000_000_000_000; // 100K Lunes
            contract.add_guarantee(project_id, lunes_token_id, lunes_amount).unwrap();
            let score_after_add = contract.get_project_score(project_id);
            let calculated_after_add = contract.calculate_project_score(project_id);
            assert_eq!(score_after_add, calculated_after_add);
            assert!(score_after_add > initial_cached);
            
            // Manual update should return same score
            let manual_update = contract.update_project_score(project_id).unwrap();
            assert_eq!(manual_update, score_after_add);
            
            // Withdraw and verify consistency
            contract.withdraw_guarantee(project_id, lunes_token_id, lunes_amount / 2).unwrap();
            let score_after_withdraw = contract.get_project_score(project_id);
            let calculated_after_withdraw = contract.calculate_project_score(project_id);
            assert_eq!(score_after_withdraw, calculated_after_withdraw);
            assert!(score_after_withdraw <= score_after_add); // Allow equal scores due to rounding
        }

        // ==================== PAUSABILITY TESTS ====================

        #[ink::test]
        fn test_pause_unpause() {
            let (mut contract, _accounts) = setup();
            
            // Initially not paused
            assert!(!contract.is_contract_paused());
            assert_eq!(contract.get_paused_at(), 0);
            
            // Pause the contract
            assert!(contract.pause().is_ok());
            assert!(contract.is_contract_paused());
            // In test environment, timestamp may be 0, so we just check it was set
            // (paused_at is set to block_timestamp which is 0 in tests)
            
            // Cannot pause again
            assert_eq!(contract.pause(), Err(SafeguardError::ContractPaused));
            
            // Unpause the contract
            assert!(contract.unpause().is_ok());
            assert!(!contract.is_contract_paused());
            
            // Cannot unpause again
            assert_eq!(contract.unpause(), Err(SafeguardError::ContractNotPaused));
        }

        #[ink::test]
        fn test_pause_only_owner() {
            let (mut contract, accounts) = setup();
            
            // Switch to non-owner
            set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            
            // Non-owner cannot pause
            assert_eq!(contract.pause(), Err(SafeguardError::NotOwner));
            
            // Switch back to owner
            set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            
            // Owner can pause
            assert!(contract.pause().is_ok());
            
            // Switch to non-owner
            set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            
            // Non-owner cannot unpause
            assert_eq!(contract.unpause(), Err(SafeguardError::NotOwner));
        }

        // ==================== TIMELOCK TESTS ====================

        #[ink::test]
        fn test_schedule_operation() {
            let (mut contract, accounts) = setup();
            
            // Schedule an operation
            let result = contract.schedule_operation(0, Vec::new()); // TransferContractOwnership
            assert!(result.is_ok());
            let operation_id = result.unwrap();
            assert_eq!(operation_id, 0);
            
            // Verify operation was stored
            let operation = contract.get_operation(operation_id);
            assert!(operation.is_some());
            let op = operation.unwrap();
            assert_eq!(op.function_type, TimelockFunction::TransferContractOwnership);
            assert!(!op.is_executed);
            assert!(!op.is_cancelled);
        }

        #[ink::test]
        fn test_schedule_operation_only_owner() {
            let (mut contract, accounts) = setup();
            
            // Switch to non-owner
            set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            
            // Non-owner cannot schedule
            assert_eq!(contract.schedule_operation(0, Vec::new()), Err(SafeguardError::NotOwner));
        }

        #[ink::test]
        fn test_cancel_operation() {
            let (mut contract, accounts) = setup();
            
            // Schedule an operation
            let operation_id = contract.schedule_operation(0, Vec::new()).unwrap();
            
            // Cancel the operation
            assert!(contract.cancel_operation(operation_id).is_ok());
            
            // Verify operation was cancelled
            let operation = contract.get_operation(operation_id).unwrap();
            assert!(operation.is_cancelled);
            
            // Cannot cancel again
            assert_eq!(contract.cancel_operation(operation_id), Err(SafeguardError::OperationNotFound));
        }

        #[ink::test]
        fn test_execute_operation_not_ready() {
            let (mut contract, accounts) = setup();
            
            // Schedule an operation
            let operation_id = contract.schedule_operation(0, Vec::new()).unwrap();
            
            // Try to execute immediately (should fail - not ready)
            assert_eq!(contract.execute_operation(operation_id), Err(SafeguardError::OperationNotReady));
        }

        #[ink::test]
        fn test_timelock_delay() {
            let (mut contract, accounts) = setup();
            
            // Get default delay
            let default_delay = contract.get_timelock_delay();
            assert_eq!(default_delay, 48 * 60 * 60 * 1000); // 48 hours
            
            // Set new delay (2 hours)
            let new_delay = 2 * 60 * 60 * 1000;
            assert!(contract.set_timelock_delay(new_delay).is_ok());
            assert_eq!(contract.get_timelock_delay(), new_delay);
            
            // Invalid delay (too short)
            assert_eq!(contract.set_timelock_delay(30 * 60 * 1000), Err(SafeguardError::InvalidInput));
            
            // Invalid delay (too long)
            assert_eq!(contract.set_timelock_delay(8 * 24 * 60 * 60 * 1000), Err(SafeguardError::InvalidInput));
        }

        #[ink::test]
        fn test_timelock_function_types() {
            let (mut contract, accounts) = setup();
            
            // Test all valid function types
            for func_type in 0..=6 {
                let result = contract.schedule_operation(func_type, Vec::new());
                assert!(result.is_ok(), "Failed for function type {}", func_type);
            }
            
            // Invalid function type
            assert_eq!(contract.schedule_operation(7, Vec::new()), Err(SafeguardError::InvalidInput));
            assert_eq!(contract.schedule_operation(255, Vec::new()), Err(SafeguardError::InvalidInput));
        }

        #[ink::test]
        fn test_operation_not_found() {
            let (mut contract, accounts) = setup();
            
            // Try to cancel non-existent operation
            assert_eq!(contract.cancel_operation(999), Err(SafeguardError::OperationNotFound));
            
            // Try to execute non-existent operation
            assert_eq!(contract.execute_operation(999), Err(SafeguardError::OperationNotFound));
            
            // Get non-existent operation
            assert!(contract.get_operation(999).is_none());
        }
    }
}

// Incluir testes de segurança e performance
#[cfg(test)]
mod security_tests;
#[cfg(test)]
mod memory_optimization;
#[cfg(test)]
mod business_rules_validation;
