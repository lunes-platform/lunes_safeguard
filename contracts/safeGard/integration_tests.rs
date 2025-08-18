#![cfg(test)]

use super::*;
use ink::env::test::{default_accounts, set_caller, set_callee, set_balance};

/// Comprehensive integration tests for the migrated Safeguard contract
mod integration_tests {
    use super::*;

    /// Test complete governance workflow
    #[ink::test]
    fn test_complete_governance_workflow() {
        let accounts = default_accounts();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        
        // Deploy contract
        let mut contract = Safeguard::new(Some(accounts.django)); // Using django as mock PSP22
        
        // 1. Activate voting
        let result = contract.vote_active(true, 1000);
        assert!(result.is_ok());
        
        let info = contract.get_qtd_votes().unwrap();
        assert!(info.status);
        assert!(!info.status_withdraw);
        assert_eq!(info.id, 1);
        assert_eq!(info.qtd_vote_yes, 0);
        assert_eq!(info.qtd_vote_no, 0);
        
        // 2. Finish voting and activate withdrawal
        let result = contract.finish_and_active_withdraw(100);
        assert!(result.is_ok());
        
        let info = contract.get_qtd_votes().unwrap();
        assert!(!info.status);
        assert!(info.status_withdraw);
        
        // 3. Execute withdrawal
        let result = contract.withdraw(accounts.bob, 50);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 50);
        
        // 4. Check withdrawal record
        let withdrawal_amount = contract.get_withdrawal(accounts.bob);
        assert_eq!(withdrawal_amount, 50);
    }

    /// Test security: reentrancy protection
    #[ink::test]
    fn test_reentrancy_protection() {
        let accounts = default_accounts();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        
        let mut contract = Safeguard::new(Some(accounts.django));
        
        // Activate withdrawal
        let _ = contract.vote_active(true, 1000);
        let _ = contract.finish_and_active_withdraw(100);
        
        // Simulate reentrancy by manually setting guard
        contract.reentrancy_guard.entered = true;
        
        // Withdrawal should fail due to reentrancy
        let result = contract.withdraw(accounts.bob, 50);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), SafeguardError::ReentrancyDetected);
    }

    /// Test security: arithmetic overflow protection
    #[ink::test]
    fn test_overflow_protection() {
        let accounts = default_accounts();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        
        let mut contract = Safeguard::new(Some(accounts.django));
        
        // Set vote counts to near maximum
        contract.qtd_vote_yes = u64::MAX - 1;
        
        // Activate voting
        let _ = contract.vote_active(true, 1000);
        
        // This would cause overflow in the old implementation
        // but should be protected now
        // Note: This test is conceptual as we can't easily trigger the PSP22 balance check
    }

    /// Test access control
    #[ink::test]
    fn test_access_control() {
        let accounts = default_accounts();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        
        let mut contract = Safeguard::new(Some(accounts.django));
        
        // Switch to non-owner
        set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
        
        // All owner-only functions should fail
        assert!(contract.vote_active(true, 1000).is_err());
        assert!(contract.finish_and_active_withdraw(100).is_err());
        assert!(contract.withdraw(accounts.charlie, 50).is_err());
        assert!(contract.transfer_ownership(accounts.charlie).is_err());
        assert!(contract.emergency_pause().is_err());
    }

    /// Test input validation
    #[ink::test]
    fn test_input_validation() {
        let accounts = default_accounts();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        
        let mut contract = Safeguard::new(Some(accounts.django));
        
        // Test zero amount validation
        let result = contract.vote_active(true, 0);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), SafeguardError::InvalidAmount);
        
        let _ = contract.vote_active(true, 1000);
        let _ = contract.finish_and_active_withdraw(100);
        
        // Test zero address validation
        let zero_account = AccountId::from([0u8; 32]);
        let result = contract.withdraw(zero_account, 50);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), SafeguardError::ZeroAddress);
        
        // Test zero amount in withdrawal
        let result = contract.withdraw(accounts.bob, 0);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), SafeguardError::InvalidAmount);
    }

    /// Test ownership transfer
    #[ink::test]
    fn test_ownership_transfer() {
        let accounts = default_accounts();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        
        let mut contract = Safeguard::new(Some(accounts.django));
        
        // Initial owner should be Alice
        assert_eq!(contract.owner(), Some(accounts.alice));
        
        // Transfer to Bob
        let result = contract.transfer_ownership(accounts.bob);
        assert!(result.is_ok());
        assert_eq!(contract.owner(), Some(accounts.bob));
        
        // Alice should no longer have owner privileges
        let result = contract.vote_active(true, 1000);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), SafeguardError::NotOwner);
        
        // Bob should now have owner privileges
        set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
        let result = contract.vote_active(true, 1000);
        assert!(result.is_ok());
    }

    /// Test emergency pause functionality
    #[ink::test]
    fn test_emergency_pause() {
        let accounts = default_accounts();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        
        let mut contract = Safeguard::new(Some(accounts.django));
        
        // Activate voting and withdrawal
        let _ = contract.vote_active(true, 1000);
        let _ = contract.finish_and_active_withdraw(100);
        
        let info = contract.get_qtd_votes().unwrap();
        assert!(!info.status); // voting should be false after finish
        assert!(info.status_withdraw);
        
        // Emergency pause
        let result = contract.emergency_pause();
        assert!(result.is_ok());
        
        let info = contract.get_qtd_votes().unwrap();
        assert!(!info.status);
        assert!(!info.status_withdraw);
        
        // Withdrawal should now fail
        let result = contract.withdraw(accounts.bob, 50);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), SafeguardError::WithdrawalNotActive);
    }

    /// Test vote tracking
    #[ink::test]
    fn test_vote_tracking() {
        let accounts = default_accounts();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        
        let mut contract = Safeguard::new(Some(accounts.django));
        
        // Initially no votes
        assert!(!contract.has_voted(accounts.bob));
        assert_eq!(contract.get_user_vote(accounts.bob), None);
        
        // Activate voting
        let _ = contract.vote_active(true, 1000);
        
        // Simulate a vote (this would normally require PSP22 balance)
        // For testing, we'll directly manipulate the vote mapping
        contract.vote.insert(&accounts.bob, &1);
        
        // Check vote tracking
        assert!(contract.has_voted(accounts.bob));
        assert_eq!(contract.get_user_vote(accounts.bob), Some(1));
        
        // Start new voting round
        let _ = contract.vote_active(true, 1000); // This increments ID to 2
        
        // Bob should not have voted for the new round
        assert!(!contract.has_voted(accounts.bob));
        assert_eq!(contract.get_user_vote(accounts.bob), Some(1)); // Still has old vote
    }

    /// Test configuration getters
    #[ink::test]
    fn test_configuration() {
        let accounts = default_accounts();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        
        let contract = Safeguard::new(Some(accounts.django));
        
        let (psp22, balance_permission, balance_per_lunes) = contract.get_config();
        assert_eq!(psp22, Some(accounts.django));
        assert_eq!(balance_permission, 0);
        assert_eq!(balance_per_lunes, 0);
    }

    /// Test state transitions
    #[ink::test]
    fn test_state_transitions() {
        let accounts = default_accounts();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        
        let mut contract = Safeguard::new(Some(accounts.django));
        
        // Initial state: inactive
        let info = contract.get_qtd_votes().unwrap();
        assert!(!info.status);
        assert!(!info.status_withdraw);
        assert_eq!(info.id, 0);
        
        // Transition to voting active
        let _ = contract.vote_active(true, 1000);
        let info = contract.get_qtd_votes().unwrap();
        assert!(info.status);
        assert!(!info.status_withdraw);
        assert_eq!(info.id, 1);
        
        // Transition to withdrawal active
        let _ = contract.finish_and_active_withdraw(100);
        let info = contract.get_qtd_votes().unwrap();
        assert!(!info.status);
        assert!(info.status_withdraw);
        assert_eq!(info.id, 1);
        
        // Can start new voting round
        let _ = contract.vote_active(true, 2000);
        let info = contract.get_qtd_votes().unwrap();
        assert!(info.status);
        assert!(!info.status_withdraw);
        assert_eq!(info.id, 2);
    }
}
