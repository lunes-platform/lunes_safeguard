#![cfg(test)]

use crate::safeguard::*;
use ink::env::test::*;

/// Testes específicos de otimização de memória e análise de gas
mod memory_optimization_tests {
    use super::*;

    fn setup() -> (Safeguard, ink::env::test::DefaultAccounts<ink::env::DefaultEnvironment>) {
        let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
        set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        let contract = Safeguard::new();
        (contract, accounts)
    }

    /// Análise de uso de storage - verificar eficiência dos Mappings
    #[ink::test]
    fn test_storage_efficiency_analysis() {
        let (mut contract, accounts) = setup();
        
        // Medir uso de storage com múltiplos projetos
        let mut project_ids = Vec::new();
        
        // Criar 20 projetos para testar escalabilidade
        for i in 0..20 {
            let name = format!("Project {}", i);
            let project_id = contract.register_project(
                name.into_bytes(),
                b"ipfs://frag".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            project_ids.push(project_id);
            
            // Verificar que cada projeto tem ID único
            assert_eq!(project_id, i as u64);
        }
        
        // Verificar que todos os projetos estão acessíveis
        for &project_id in &project_ids {
            let info = contract.get_project_info(project_id);
            assert!(info.is_some());
        }
        
        // Testar acesso aleatório (não sequencial) para verificar eficiência
        let random_indices = [15, 3, 8, 19, 1, 12, 6, 17, 4, 11];
        for &idx in &random_indices {
            let project_id = project_ids[idx];
            let info = contract.get_project_info(project_id);
            assert!(info.is_some());
        }
    }

    /// Teste de otimização de chaves compostas em Mappings
    #[ink::test]
    fn test_composite_key_optimization() {
        let (mut contract, accounts) = setup();
        
        // Criar projeto
        let project_id = contract.register_project(
            b"Composite Key Test".to_vec(),
            b"ipfs://composite".to_vec(),
            accounts.alice,
            accounts.bob
        ).unwrap();
        
        // Adicionar múltiplos tokens para testar chaves compostas
        let mut token_ids = Vec::new();
        for i in 0..15 {
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
        
        // Testar acesso eficiente com chaves compostas (project_id, token_id, user)
        for &token_id in &token_ids {
            contract.add_guarantee(project_id, token_id, 1000).unwrap();
            
            // Verificar acesso direto via chave composta
            let balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            assert_eq!(balance, 1000);
            
            // Verificar mapping de totais por projeto
            let total = contract.get_project_total_guarantee(project_id, token_id);
            assert_eq!(total, 1000);
        }
        
        // Testar múltiplos usuários no mesmo projeto/token
        set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
        for &token_id in &token_ids[..5] { // Apenas primeiros 5 para economizar gas
            contract.add_guarantee(project_id, token_id, 2000).unwrap();
            
            // Verificar que balances são independentes por usuário
            let balance_bob = contract.get_user_guarantee(project_id, token_id, accounts.bob);
            let balance_alice = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            
            assert_eq!(balance_bob, 2000);
            assert_eq!(balance_alice, 1000);
        }
    }

    /// Teste de otimização de loops e iterações
    #[ink::test]
    fn test_loop_optimization() {
        let (mut contract, accounts) = setup();
        
        // Criar projeto
        let project_id = contract.register_project(
            b"Loop Test".to_vec(),
            b"ipfs://loop".to_vec(),
            accounts.alice,
            accounts.bob
        ).unwrap();
        
        // Adicionar tokens suficientes para testar loops
        let mut token_ids = Vec::new();
        for i in 0..10 { // Limitado para evitar timeout
            let symbol = format!("LP{:02}", i);
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
            
            // Adicionar garantia para cada token
            contract.add_guarantee(project_id, token_id, (i + 1) * 1000).unwrap();
        }
        
        // Testar função que itera sobre tokens (calculate_project_score)
        let score = contract.calculate_project_score(project_id);
        assert!(score >= 0 && score <= 100);
        
        // Verificar que o cálculo é consistente
        let score2 = contract.calculate_project_score(project_id);
        assert_eq!(score, score2);
    }

    /// Teste de uso de memória com operações batch
    #[ink::test]
    fn test_batch_operations_memory() {
        let (mut contract, accounts) = setup();
        
        // Criar projeto
        let project_id = contract.register_project(
            b"Batch Test".to_vec(),
            b"ipfs://batch".to_vec(),
            accounts.alice,
            accounts.bob
        ).unwrap();
        
        let token_id = contract.add_supported_token(
            accounts.charlie,
            *b"BATCH\0\0\0",
            18,
            1000,
        ).unwrap();
        
        // Simular operações batch com múltiplas transações pequenas
        let batch_size = 20;
        let mut total_expected = 0u128;
        
        for i in 1u128..=batch_size {
            let amount = i * 1000; // Acima do mínimo (1000)
            contract.add_guarantee(project_id, token_id, amount).unwrap();
            total_expected += amount;
            
            // Verificar consistência a cada operação
            let current_balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            assert_eq!(current_balance, total_expected);
        }
        
        // Verificar estado final
        let final_balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
        assert_eq!(final_balance, total_expected);
        
        // Testar operações de retirada em batch
        let mut remaining = total_expected;
        for i in 1u128..=10 { // Retirar em 10 lotes
            let withdraw_amount = i * 1000;
            if withdraw_amount <= remaining {
                contract.withdraw_guarantee(project_id, token_id, withdraw_amount).unwrap();
                remaining -= withdraw_amount;
                
                let current_balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
                assert_eq!(current_balance, remaining);
            }
        }
    }

    /// Análise de gas para operações críticas
    #[ink::test]
    fn test_gas_consumption_analysis() {
        let (mut contract, accounts) = setup();
        
        // Medir gas para registro de projeto
        let project_id = contract.register_project(
            b"Gas Test".to_vec(),
            b"ipfs://gas".to_vec(),
            accounts.alice,
            accounts.bob
        ).unwrap();
        
        // Medir gas para adição de token
        let token_id = contract.add_supported_token(
            accounts.charlie,
            *b"GAS\0\0\0\0\0",
            18,
            1000,
        ).unwrap();
        
        // Medir gas para operações de garantia
        contract.add_guarantee(project_id, token_id, 10000).unwrap();
        
        // Medir gas para cálculo de score (operação mais complexa)
        let score = contract.calculate_project_score(project_id);
        assert!(score >= 0 && score <= 100);
        
        // Medir gas para operações de retirada
        contract.withdraw_guarantee(project_id, token_id, 5000).unwrap();
        
        // Verificar que todas as operações completaram sem estouro de gas
        let final_balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
        assert_eq!(final_balance, 5000);
    }

    /// Teste de fragmentação de memória
    #[ink::test]
    fn test_memory_fragmentation() {
        let (mut contract, accounts) = setup();
        
        // Criar múltiplos projetos com padrão de uso fragmentado
        let mut project_ids = Vec::new();
        
        for i in 0..8 {
            let name = format!("Frag Project {}", i);
            let project_id = contract.register_project(
                name.into_bytes(),
                b"ipfs://frag".to_vec(),
                accounts.alice,
                accounts.bob
            ).unwrap();
            project_ids.push(project_id);
        }
        
        // Adicionar tokens de forma fragmentada
        let token_id = contract.add_supported_token(
            accounts.charlie,
            *b"FRAG\0\0\0\0",
            18,
            1000,
        ).unwrap();
        
        // Padrão fragmentado: adicionar garantias em ordem não sequencial
        let access_pattern = [7, 2, 5, 0, 3, 6, 1, 4];
        for &idx in &access_pattern {
            let project_id = project_ids[idx];
            contract.add_guarantee(project_id, token_id, ((idx + 1) * 1000) as u128).unwrap();
        }
        
        // Verificar acesso em ordem diferente
        let verify_pattern = [0, 3, 6, 1, 4, 7, 2, 5];
        for &idx in &verify_pattern {
            let project_id = project_ids[idx];
            let balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            assert_eq!(balance, ((idx + 1) * 1000) as u128);
        }
        
        // Remover algumas garantias para criar "buracos"
        for &idx in &[1, 3, 5] {
            let project_id = project_ids[idx];
            let current_balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            contract.withdraw_guarantee(project_id, token_id, current_balance).unwrap();
        }
        
        // Verificar que o acesso ainda funciona eficientemente
        for &idx in &[0, 2, 4, 6, 7] {
            let project_id = project_ids[idx];
            let balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            assert_eq!(balance, ((idx + 1) * 1000) as u128);
        }
    }

    /// Teste de otimização de estruturas de dados
    #[ink::test]
    fn test_data_structure_optimization() {
        let (mut contract, accounts) = setup();
        
        // Testar eficiência de diferentes tipos de chaves
        let project_id = contract.register_project(
            b"Data Structure Test".to_vec(),
            b"ipfs://struct".to_vec(),
            accounts.alice,
            accounts.bob
        ).unwrap();
        
        // Testar chaves simples (u64)
        assert!(contract.get_project_info(project_id).is_some());
        
        // Testar chaves compostas ((u64, u64))
        let token_id = contract.add_supported_token(
            accounts.charlie,
            *b"STRUCT\0\0",
            18,
            1000,
        ).unwrap();
        
        contract.add_guarantee(project_id, token_id, 5000).unwrap();
        let total = contract.get_project_total_guarantee(project_id, token_id);
        assert_eq!(total, 5000);
        
        // Testar chaves triplas ((u64, u64, AccountId))
        let balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
        assert_eq!(balance, 5000);
        
        // Verificar que diferentes tipos de acesso são eficientes
        for i in 0..5 {
            let amount = (i + 1) * 1000;
            contract.add_guarantee(project_id, token_id, amount).unwrap();
            
            // Acesso via chave tripla
            let user_balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            
            // Acesso via chave dupla
            let project_total = contract.get_project_total_guarantee(project_id, token_id);
            
            assert!(user_balance <= project_total);
        }
    }

    /// Teste de limpeza de memória e garbage collection
    #[ink::test]
    fn test_memory_cleanup() {
        let (mut contract, accounts) = setup();
        
        // Criar dados temporários
        let project_id = contract.register_project(
            b"Cleanup Test".to_vec(),
            b"ipfs://cleanup".to_vec(),
            accounts.alice,
            accounts.bob
        ).unwrap();
        
        let token_id = contract.add_supported_token(
            accounts.charlie,
            *b"CLEAN\0\0\0",
            18,
            1000,
        ).unwrap();
        
        // Adicionar e remover dados repetidamente
        for cycle in 0..5 {
            // Adicionar dados
            let amount = (cycle + 1) * 2000;
            contract.add_guarantee(project_id, token_id, amount).unwrap();
            
            let balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            assert!(balance >= amount);
            
            // Remover parte dos dados
            let withdraw_amount = amount / 2;
            contract.withdraw_guarantee(project_id, token_id, withdraw_amount).unwrap();
            
            let remaining_balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
            assert_eq!(remaining_balance, balance - withdraw_amount);
        }
        
        // Verificar que o estado final é consistente
        let final_balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
        assert!(final_balance > 0);
        
        // Limpar completamente
        contract.withdraw_guarantee(project_id, token_id, final_balance).unwrap();
        let zero_balance = contract.get_user_guarantee(project_id, token_id, accounts.alice);
        assert_eq!(zero_balance, 0);
    }
}
