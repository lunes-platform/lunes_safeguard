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
        balance_yes: Balance,
        balance_no: Balance,
        vote: Mapping<AccountId, u64>,
        status_withdraw: bool, // if true, then the contract is active for withdraw and finish
        status: bool, // if true, then active for vote
        pair_psp22: Option<AccountId>,
        withdraw: Mapping<AccountId, Balance>,
        balance_permission: Balance,
        balance_withdraw_per_lunes: Balance,
        balance_reward: Balance,
    }
    #[derive(Debug, PartialEq, Clone, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct InfoContract {
        pub data_vote_end: u64,
        pub qtd_vote_yes: u64,
        pub qtd_vote_no: u64,
        pub balance_yes: Balance,
        pub balance_no: Balance,
        pub balance_reward: Balance,
        pub balance_permission: Balance,

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
            instance.balance_yes = 0u128;
            instance.balance_no = 0u128;
            instance.balance_permission = 0u128;
            instance.status_withdraw = false;
            instance.balance_withdraw_per_lunes = 0u128;
            instance.status = false;
            instance.vote = Mapping::default();
            instance.balance_reward = 0u128;
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
            let date_block = Self::env().block_timestamp() + 86399357u64; //1day

            if date_vote.is_some() {
                if date_vote.unwrap() < date_block {
                    return Err(PSP22Error::Custom(String::from("You have already voted")));
                }
                
            }
            self.vote.insert(&caller, &date_block);
            

            if _value == true {
                self.qtd_vote_yes += 1;
                self.balance_yes += balance;
            } else {
                self.qtd_vote_no += 1;
                self.balance_no += balance;
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
                self.balance_yes = 0u128;
                self.balance_no = 0u128;
                self.data_vote_end = 0u64;
                self.balance_permission = balance_min;
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
            let balance = Self::env().balance();
            let current_balance = balance
                .checked_sub(Self::env().minimum_balance())
                .unwrap_or_default();
            self.balance_reward = current_balance;
            Ok(())
        }
        
        #[ink(message)]
        pub fn get_qtd_votes(&mut self) -> Result<InfoContract, PSP22Error> {
            Ok(InfoContract {
                data_vote_end: self.data_vote_end,
                qtd_vote_yes: self.qtd_vote_yes,
                qtd_vote_no: self.qtd_vote_no,
                balance_yes: self.balance_yes,
                balance_no: self.balance_no,
                balance_reward: self.balance_reward,
                balance_permission: self.balance_permission,
            })
        }
        #[openbrush::modifiers(only_owner)]
        #[ink(message)]
        pub fn withdraw(&mut self, account: AccountId, balance: Balance) -> Result<Balance, PSP22Error> {
            if !self.status_withdraw {
                return Err(PSP22Error::Custom(String::from("Contract not active")));
            }

            if balance < self.balance_permission {
                return Err(PSP22Error::Custom(String::from("User don't have balance")));
            }
            let is_withdraw = self.withdraw.get(&account);
            if is_withdraw.is_some() {
                return Err(PSP22Error::Custom(String::from("User already withdraw")));
            }
            let psp22_contract_address = self.pair_psp22.unwrap();
            let token: contract_ref!(PSP22) = psp22_contract_address.into();
            let supply:i128 = token.total_supply() as i128;
            let value_per_token: i128 = self.balance_withdraw_per_lunes as i128;

            let amount_per_token: i128     = supply / value_per_token;

            let balance_user: i128 = balance as i128;            
            let balance_in_supply = balance_user / value_per_token;
            
            
            let balance_in_contract:i128 = self.balance_reward as i128;
            let parc_participation_in_contract = (balance_in_supply as f64 / amount_per_token as f64 ) * 100 as f64;
 
            
            let total_rewards = (( balance_in_contract as f64 * parc_participation_in_contract as f64) / 100 as f64) as Balance;
            if total_rewards < self.balance_permission {
                return Err(PSP22Error::Custom(String::from("User don't have sufficient balance")));
            }    

            Self::env()
                .transfer(account, total_rewards)
                .map_err(|_| PSP22Error::Custom(String::from("Transfer error")))?;
          
            self.withdraw.insert(&account, &total_rewards);
            Ok(total_rewards)
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
                balance_yes: 0u128,
                balance_no: 0u128,
                balance_reward: 0u128,
                balance_permission: 0u128,
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
