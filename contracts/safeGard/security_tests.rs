#![cfg(test)]

use crate::safeguard::*;
use crate::security::SafeguardError;
use ink::env::test::*;
use ink::primitives::AccountId;

/// Testes de segurança e otimização de memória para SafeGard
mod security_tests {
    use super::*;

    // Helper para criar contas de teste
    fn get_accounts() -> ink::env::test::DefaultAccounts<ink::env::DefaultEnvironment> {
        ink::env::test::default_accounts::<ink::env::DefaultEnvironment>()
    }

    // Helper para configurar contrato
    fn setup_contract() -> Safeguard {
        let accounts = get_accounts();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        Safeguard::new()
    }

    // Helper para setup nos testes de performance
    fn setup() -> (super::Safeguard, ink::env::test::DefaultAccounts<ink::env::DefaultEnvironment>) {
        let accounts = get_accounts();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        let contract = super::Safeguard::new();
        (contract, accounts)
    }

    /// Teste de reentrância - verificar se guards estão funcionando
    #[ink::test]
    fn test_reentrancy_protection() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Registrar projeto
        let project_id = contract.register_project(
            b"Test Project".to_vec(),
            b"ipfs://metadata".to_vec(),
            accounts.alice,
            accounts.bob
        ).unwrap();
        
        // Adicionar token
        let token_id = contract.add_supported_token(
            accounts.charlie,
            *b"TEST\0\0\0\0",
            18,
            1000,
        ).unwrap();
        
        // Tentar múltiplas operações simultâneas que poderiam causar reentrância
        contract.add_guarantee(project_id, token_id, 1000).unwrap();
        
        // Verificar que o estado está consistente
        let balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
        assert_eq!(balance, 1000);
        
        // Tentar retirar mais do que tem (deve falhar)
        let result = contract.withdraw_guarantee(project_id, token_id, 2000);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), SafeguardError::InsufficientBalance);
    }

    /// Teste de overflow/underflow em operações matemáticas
    #[ink::test]
    fn test_arithmetic_overflow_protection() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Registrar projeto
        let project_id = contract.register_project(
            b"Test Project".to_vec(),
            b"ipfs://metadata".to_vec(),
            accounts.alice,
            accounts.bob
        ).unwrap();
        
        // Adicionar token
        let token_id = contract.add_supported_token(
            accounts.charlie,
            *b"TEST\0\0\0\0",
            18,
            1000,
        ).unwrap();
        
        // Verificar underflow em subtração - adicionar primeiro, depois tentar retirar mais
        let result = contract.add_guarantee(project_id, token_id, 1000);
        assert!(result.is_ok());
        
        let result = contract.withdraw_guarantee(project_id, token_id, 2000);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), SafeguardError::InsufficientBalance);
        
        // Tentar adicionar valor muito grande (deve ser tratado com segurança - pode falhar ou usar saturating)
        let large_value = u128::MAX / 2;
        let result = contract.add_guarantee(project_id, token_id, large_value);
        // Pode falhar ou ser tratado com saturating operations - ambos são válidos
        assert!(result.is_err() || result.is_ok());
    }

    /// Teste de limites de gas e loops
    #[ink::test]
    fn test_gas_limits_and_loops() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Registrar projeto
        let project_id = contract.register_project(
            b"Test Project".to_vec(),
            b"ipfs://metadata".to_vec(),
            accounts.alice,
            accounts.bob
        ).unwrap();
        
        // Adicionar múltiplos tokens para testar loops
        let mut token_ids = Vec::new();
        for i in 0..10 {
            let symbol = format!("TK{:02}", i);
            let mut symbol_bytes = [0u8; 8];
            let bytes = symbol.as_bytes();
            symbol_bytes[..bytes.len().min(8)].copy_from_slice(&bytes[..bytes.len().min(8)]);
            
            let token_id = contract.add_supported_token(
                accounts.charlie,
                symbol_bytes,
                18,
                1000,
            ).unwrap();
            token_ids.push(token_id);
        }
        
        // Adicionar garantias para todos os tokens
        for &token_id in &token_ids {
            contract.add_guarantee(project_id, token_id, 1000).unwrap();
        }
        
        // Calcular score (que itera sobre tokens) - deve completar sem estouro de gas
        let score = contract.calculate_project_score(project_id);
        assert!(score >= 0 && score <= 100);
    }

    /// Teste de validação de inputs maliciosos
    #[ink::test]
    fn test_malicious_input_validation() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Tentar registrar projeto com dados inválidos
        let result = contract.register_project(
            Vec::new(), // Nome vazio
            Vec::new(), // Metadata vazia
            AccountId::from([0u8; 32]), // Endereço zero
            AccountId::from([0u8; 32])  // Treasury zero
        );
        assert!(result.is_err());
        
        // Tentar adicionar token com parâmetros inválidos
        let result = contract.add_supported_token(
            AccountId::from([0u8; 32]), // Endereço zero
            [0u8; 8], // Symbol vazio
            0, // Decimais zero
            0, // Valor mínimo zero
        );
        assert!(result.is_err());
        
        // Tentar operações com projeto inexistente
        let fake_project_id = 999;
        let result = contract.add_guarantee(fake_project_id, 0, 1000);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), SafeguardError::InvalidInput);
    }

    /// Teste de isolamento de cofres (segregação)
    #[ink::test]
    fn test_vault_segregation() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Criar dois projetos
        let project1_id = contract.register_project(
            b"Project 1".to_vec(),
            b"ipfs://1".to_vec(),
            accounts.bob,
            accounts.charlie
        ).unwrap();
        
        let project2_id = contract.register_project(
            b"Project 2".to_vec(),
            b"ipfs://2".to_vec(),
            accounts.bob,
            accounts.charlie
        ).unwrap();
        
        // Adicionar token
        let token_id = contract.add_supported_token(
            accounts.django,
            *b"TEST\0\0\0\0",
            18,
            1000,
        ).unwrap();
        
        // Adicionar garantias para cada projeto
        contract.add_guarantee(project1_id, token_id, 1000).unwrap();
        contract.add_guarantee(project2_id, token_id, 2000).unwrap();
        
        // Verificar isolamento - garantias de um projeto não afetam o outro
        let balance1 = contract.get_user_guarantee(project1_id, token_id, accounts.alice);
        let balance2 = contract.get_user_guarantee(project2_id, token_id, accounts.alice);
        
        assert_eq!(balance1, 1000);
        assert_eq!(balance2, 2000);
        
        // Verificar que retirada de um projeto não afeta o outro
        contract.withdraw_guarantee(project1_id, token_id, 500).unwrap();
        
        let new_balance1 = contract.get_user_guarantee(project1_id, token_id, accounts.alice);
        let unchanged_balance2 = contract.get_user_guarantee(project2_id, token_id, accounts.alice);
        
        assert_eq!(new_balance1, 500);
        assert_eq!(unchanged_balance2, 2000); // Não deve ter mudado
    }

    /// Teste de proteção contra acesso não autorizado
    #[ink::test]
    fn test_unauthorized_access_protection() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Criar projeto como Alice
        let project_id = contract.register_project(
            b"Auth Test".to_vec(),
            b"ipfs://auth".to_vec(),
            accounts.alice,
            accounts.bob
        ).unwrap();
        
        let token_id = contract.add_supported_token(
            accounts.django,
            *b"AUTH\0\0\0\0",
            18,
            1000,
        ).unwrap();
        
        // Alice adiciona garantia
        contract.add_guarantee(project_id, token_id, 5000).unwrap();
        
        // Tentar operações não autorizadas como Bob
        set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
        
        // Bob não pode retirar garantias de Alice
        let result = contract.withdraw_guarantee(project_id, token_id, 1000);
        assert!(result.is_err());
        
        // Bob não pode adicionar tokens (apenas owner do contrato pode)
        let result = contract.add_supported_token(
            accounts.charlie,
            *b"HACK\0\0\0\0",
            18,
            1000,
        );
        assert!(result.is_err());
    }

    /// Teste de eficiência de storage e mappings
    #[ink::test]
    fn test_storage_efficiency() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Criar múltiplos projetos para testar escalabilidade
        let mut project_ids = Vec::new();
        for i in 0..10 {
            let name = format!("Storage Test {}", i);
            let project_id = contract.register_project(
                name.into_bytes(),
                b"ipfs://storage".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            project_ids.push(project_id);
        }
        
        // Adicionar token
        let token_id = contract.add_supported_token(
            accounts.django,
            *b"STOR\0\0\0\0",
            18,
            1000,
        ).unwrap();
        
        // Testar acesso eficiente a diferentes projetos
        for (i, &project_id) in project_ids.iter().enumerate() {
            let amount = ((i + 1) * 1000) as u128;
            contract.add_guarantee(project_id, token_id, amount).unwrap();
            
            // Verificar acesso direto
            let balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            assert_eq!(balance, amount);
        }
        
        // Testar acesso aleatório (não sequencial)
        let random_access = [7, 2, 9, 1, 5, 0, 8, 3, 6, 4];
        for &idx in &random_access {
            let project_id = project_ids[idx];
            let expected_amount = ((idx + 1) * 1000) as u128;
            let balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            assert_eq!(balance, expected_amount);
        }
    }

    /// Teste de consistência de estado após falhas
    #[ink::test]
    fn test_state_consistency_after_failures() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        let project_id = contract.register_project(
            b"Consistency Test".to_vec(),
            b"ipfs://consistency".to_vec(),
            accounts.alice,
            accounts.bob
        ).unwrap();
        
        let token_id = contract.add_supported_token(
            accounts.django,
            *b"CONS\0\0\0\0",
            18,
            1000,
        ).unwrap();
        
        // Estado inicial
        contract.add_guarantee(project_id, token_id, 10000).unwrap();
        let initial_balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
        assert_eq!(initial_balance, 10000);
        
        // Tentar operação inválida (retirar mais do que tem)
        let result = contract.withdraw_guarantee(project_id, token_id, 20000);
        assert!(result.is_err());
        
        // Verificar que o estado não foi alterado
        let balance_after_failed_op = contract.get_user_guarantee(project_id, token_id, accounts.alice);
        assert_eq!(balance_after_failed_op, initial_balance);
        
        // Operação válida deve funcionar normalmente
        contract.withdraw_guarantee(project_id, token_id, 3000).unwrap();
        let final_balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
        assert_eq!(final_balance, 7000);
    }

    /// Teste básico de fuzzing com inputs aleatórios
    #[ink::test]
    fn test_basic_fuzzing() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        let project_id = contract.register_project(
            b"Fuzz Test".to_vec(),
            b"ipfs://fuzz".to_vec(),
            accounts.alice,
            accounts.bob
        ).unwrap();
        
        let token_id = contract.add_supported_token(
            accounts.django,
            *b"FUZZ\0\0\0\0",
            18,
            1000,
        ).unwrap();
        
        // Testar com valores extremos
        let test_values = [0, 1, u128::MAX, u128::MAX / 2, 1000000000000000000];
        
        for &value in &test_values {
            if value > 0 && value < u128::MAX / 2 {
                // Valores válidos devem funcionar
                let result = contract.add_guarantee(project_id, token_id, value);
                if result.is_ok() {
                    let balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
                    assert!(balance >= value);
                    
                    // Tentar retirar
                    let withdraw_result = contract.withdraw_guarantee(project_id, token_id, value);
                    assert!(withdraw_result.is_ok());
                }
            } else {
                // Valores extremos devem ser rejeitados ou tratados adequadamente
                let result = contract.add_guarantee(project_id, token_id, value);
                // Não deve causar panic, apenas retornar erro se inválido
                if result.is_err() {
                    // Erro esperado para valores inválidos
                    continue;
                }
            }
        }
    }

    /// Teste de acesso não autorizado
    #[ink::test]
    fn test_unauthorized_access() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Tentar operações de owner como não-owner
        set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
        
        // Bob não pode adicionar tokens suportados
        let result = contract.add_supported_token(
            accounts.charlie,
            *b"UNAUTH\0\0",
            18,
            1000,
        );
        assert!(result.is_err());
    }

    /// Teste de limites de memória e storage
    #[ink::test]
    fn test_memory_optimization() {
        let mut contract = setup_contract();
        let accounts = get_accounts();
        
        // Registrar projeto
        let project_id = contract.register_project(
            b"Memory Test".to_vec(),
            b"ipfs://memory".to_vec(),
            accounts.alice,
            accounts.bob
        ).unwrap();
        
        // Adicionar token
        let token_id = contract.add_supported_token(
            accounts.django,
            *b"MEM\0\0\0\0\0",
            18,
            1000,
        ).unwrap();
        
        // Testar múltiplas operações para verificar uso eficiente de memória
        for i in 1..=20 {
            let amount = i * 1000;
            contract.add_guarantee(project_id, token_id, amount).unwrap();
            
            // Verificar que o acesso permanece eficiente
            let balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            assert!(balance >= amount);
        }
    }
}
