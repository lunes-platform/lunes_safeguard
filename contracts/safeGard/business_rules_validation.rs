#[cfg(test)]
mod tests {
    use super::*;
    use ink::env::test::{default_accounts, set_caller};
    use crate::safeguard::*;

    #[ink::test]
    fn test_project_registration_with_metadata() {
        let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        
        let mut contract = Safeguard::new();
        
        let name = "Lunes Project".as_bytes().to_vec();
        let metadata_uri = "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco".as_bytes().to_vec();
        let token_contract = accounts.bob;
        let treasury_address = accounts.charlie;
        
        // Register project
        let result = contract.register_project(
            name.clone(),
            metadata_uri.clone(),
            token_contract,
            treasury_address
        );
        
        assert!(result.is_ok());
        let project_id = result.unwrap();
        assert_eq!(project_id, 0);
        
        // Verify next_project_id incremented
        assert_eq!(contract.get_next_project_id(), 1);
        
        // Verify data storage in get_project_info
        let info = contract.get_project_info(project_id).expect("Project should exist");
        assert_eq!(info.owner, accounts.alice);
        assert_eq!(info.metadata_uri, metadata_uri);
        assert_eq!(info.status, true); // Active
    }

    #[ink::test]
    fn test_multiple_registrations_and_iteration() {
        let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        
        let mut contract = Safeguard::new();
        
        let token_contract = accounts.bob;
        let treasury_address = accounts.charlie;
        
        // Register 3 projects
        for i in 1..=3 {
            let name = format!("Project {}", i).as_bytes().to_vec();
            let metadata = format!("ipfs://metadata{}", i).as_bytes().to_vec();
            contract.register_project(name, metadata, token_contract, treasury_address).unwrap();
        }
        
        // Verify total projects count
        let next_id = contract.get_next_project_id();
        assert_eq!(next_id, 3);
        
        // Frontend-like iteration
        let mut projects_found = 0;
        for i in 0..next_id {
            if let Some(info) = contract.get_project_info(i) {
                assert_eq!(info.id, i);
                projects_found += 1;
            }
        }
        assert_eq!(projects_found, 3);
    }

    #[ink::test]
    fn test_add_guarantee_rules() {
        let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        
        let mut contract = Safeguard::new();
        
        // 1. Setup a supported token
        let token_addr = accounts.django;
        let symbol = [b'L', b'U', b'N', b'E', b'S', 0, 0, 0];
        let min_amount = 1000;
        let token_id = contract.add_supported_token(token_addr, symbol, 18, min_amount).unwrap();
        
        // 2. Register project
        let project_id = contract.register_project(
            "Test".as_bytes().to_vec(),
            "ipfs://".as_bytes().to_vec(),
            accounts.bob,
            accounts.charlie
        ).unwrap();
        
        // 3. Add guarantee below minimum (should fail)
        let result = contract.add_guarantee(project_id, token_id, 500);
        assert!(result.is_err());
        
        // 4. Add valid guarantee
        let result = contract.add_guarantee(project_id, token_id, 1500);
        assert!(result.is_ok());
        
        // 5. Verify total guarantee and user balance (mock tracking)
        // Note: Real balance transfer logic is mocked in ink! unit tests unless using e2e
    }
}
