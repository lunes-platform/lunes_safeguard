#![cfg_attr(not(feature = "std"), no_std, no_main)]
#![warn(clippy::arithmetic_side_effects)]

#[openbrush::implementation(Ownable)]
#[openbrush::contract]
pub mod safe_guard {
    use ink::contract_ref;
    use openbrush::{
        contracts::{
            ownable::{
                self,
                only_owner,
            },
            reentrancy_guard,
            traits::psp22::PSP22Error,
        },
        traits::{
            Storage, String
        },
    };
    use ink::storage::Mapping;
    use psp22::PSP22;

    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct Safeguard {
        #[storage_field]
        guard: reentrancy_guard::Data,
        #[storage_field]
        ownable: ownable::Data,
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
    }
    #[derive(Debug, PartialEq, Clone, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct InfoContract {
        pub data_vote_end: u64,
        pub qtd_vote_yes: u64,
        pub qtd_vote_no: u64,
        pub pair_psp22: Option<AccountId>,
        pub status_withdraw: bool,

    }

    impl Safeguard {
        #[ink(constructor)]
        pub fn new(pair_psp22: Option<AccountId>) -> Self {
            let mut instance = Self::default();
            let caller = Self::env().caller();
            ownable::InternalImpl::_init_with_owner(&mut instance, caller);
            instance.pair_psp22 = pair_psp22;
            instance.qtd_vote_yes = 0u64;
            instance.qtd_vote_no = 0u64;
            instance.data_vote_end = 0u64;
            instance.vote = Mapping::default();
            instance.withdraw = Mapping::default();
            instance.id = 0u64;
            instance.status = false;
            instance.status_withdraw = false;
            instance.balance_permission = 0u128;
            instance.balance_withdraw_per_lunes = 0u128;
            instance
        }

        #[ink(message)]
        pub fn vote(&mut self, _value: bool) -> Result<(), PSP22Error> {
            // verificar na contrato psp22 se o usuario tem saldo
            // se tiver, votar
            if self.status == false || self.status_withdraw == true {
                return Err(PSP22Error::Custom(String::from("Contract not active")));
            }
            let caller = self.env().caller();
            let psp22_contract_address = self.pair_psp22.unwrap();
            let token: contract_ref!(PSP22) = psp22_contract_address.into();
            let balance = token.balance_of(caller);
            if balance < self.balance_permission {
                return Err(PSP22Error::Custom(String::from("User don't have sufficient balance")));
            }
            let date_vote = self.vote.get(&caller);

            if date_vote.is_some() {
                if date_vote.unwrap() == self.id {
                    return Err(PSP22Error::Custom(String::from("You have already voted")));
                }
                
            }
            self.vote.insert(&caller, &self.id);
            

            if _value == true {
                self.qtd_vote_yes += 1;
            } else {
                self.qtd_vote_no += 1;
            }
            Ok(())
        }
        #[openbrush::modifiers(only_owner)]
        #[ink(message)]
        pub fn vote_active(&mut self, _value: bool, balance_min: Balance) -> Result<(), PSP22Error> {

            if self.status_withdraw == true {
                return Err(PSP22Error::Custom(String::from("Contract not active")));
            }

            if _value == true {    
                self.qtd_vote_yes = 0u64;
                self.qtd_vote_no = 0u64;
                self.data_vote_end = 0u64;
                self.balance_permission = balance_min;
                self.id += 1;
            }else {
                self.data_vote_end = Self::env().block_timestamp();
            }
            self.status = _value;
            Ok(())
        }

        #[openbrush::modifiers(only_owner)]
        #[ink(message)]
        pub fn finish_and_active_withdraw(&mut self, balance_per_lunes: Balance) -> Result<(), PSP22Error> {
            if self.status_withdraw == true {
                return Err(PSP22Error::Custom(String::from("Contract not active")));
            }
            self.status_withdraw = true;
            self.balance_withdraw_per_lunes = balance_per_lunes;
            
            Ok(())
        }
        
        #[ink(message)]
        pub fn get_qtd_votes(&mut self) -> Result<InfoContract, PSP22Error> {
            Ok(InfoContract {
                data_vote_end: self.data_vote_end,
                qtd_vote_yes: self.qtd_vote_yes,
                qtd_vote_no: self.qtd_vote_no,
                pair_psp22: self.pair_psp22,
                status_withdraw: self.status_withdraw,
            })
        }
       /*  #[ink(message)]
        pub fn get_project(&mut self) -> Result<Option<AccountId>, PSP22Error> {
            Ok(self.pair_psp22)
        }
*/
        #[openbrush::modifiers(only_owner)]
        #[ink(message)]
        pub fn withdraw(&mut self, account: AccountId, amount: Balance) -> Result<Balance, PSP22Error> {
            if !self.status_withdraw {
                return Err(PSP22Error::Custom(String::from("Contract not active")));
            }

            if amount < self.balance_permission {
                return Err(PSP22Error::Custom(String::from("User don't have balance")));
            }
            let is_withdraw = self.withdraw.get(&account);
            if is_withdraw.is_some() {
                return Err(PSP22Error::Custom(String::from("User already withdraw")));
            }

            Self::env()
                .transfer(account, amount)
                .map_err(|_| PSP22Error::Custom(String::from("Transfer error")))?;
          
            self.withdraw.insert(&account, &amount);
            Ok(amount)
        }
    }
    #[cfg(test)]
    mod tests {
        use super::*;
        use ink:: env::test::default_accounts;

        #[ink::test]
        fn test_withdraw() {
            let accounts = default_accounts::<ink::env::DefaultEnvironment>();
            let mut safe_guard = Safeguard::new(None);
            assert_eq!(safe_guard.withdraw(accounts.alice,0), Ok(0));
        }
        

        #[ink::test]
        fn test_get_qtd_votes() {
            let mut safe_guard = Safeguard::new(None);
            assert_eq!(safe_guard.get_qtd_votes(), Ok(InfoContract {
                data_vote_end: 0u64,
                qtd_vote_yes: 0u64,
                qtd_vote_no: 0u64,
                pair_psp22: None,
                status_withdraw: false,                
            }));
        }

        #[ink::test]
        fn test_finish_and_active_withdraw() {
            let mut safe_guard = Safeguard::new(None);
            assert_eq!(safe_guard.finish_and_active_withdraw(100), Ok(()));
        }

        #[ink::test]
        fn test_vote_active() {
            let mut safe_guard = Safeguard::new(None);
            assert_eq!(safe_guard.vote_active(true, 100), Ok(()));
        }

        #[ink::test]
        fn test_vote() {
            let mut safe_guard = Safeguard::new(None);
            assert_eq!(safe_guard.vote(true), Ok(()));
        }
    }
}
