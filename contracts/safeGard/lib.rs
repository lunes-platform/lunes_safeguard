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
        storage::Mapping,
        traits::{
            Storage,
            String,
        },
    };
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
        vote: Mapping<AccountId, bool>,
        status_withdraw: bool, // if true, then the contract is active for withdraw and finish

        status: bool, // if true, then active for vote
        pair_psp22: Option<AccountId>,
        withdraw: Mapping<AccountId, Balance>,
    }
    #[derive(Debug, PartialEq, Clone, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct InfoContract {
        pub data_vote_end: u64,
        pub qtd_vote_yes: u64,
        pub qtd_vote_no: u64,
        pub balance_yes: Balance,
        pub balance_no: Balance,
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
            instance.status_withdraw = false;
            instance.status = false;
            instance.vote = Mapping::default();
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
            if balance == 0u128 {
                return Err(PSP22Error::Custom(String::from("User don't have balance")));
            }
            let qtd_vote = self.vote.get(&caller);
            if qtd_vote.is_some() {
                return Err(PSP22Error::Custom(String::from("You have already voted")));
            }
            self.vote.insert(&caller, &_value);

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
        pub fn vote_active(&mut self, _value: bool) -> Result<(), PSP22Error> {
            if self.status_withdraw == true {
                return Err(PSP22Error::Custom(String::from("Contract not active")));
            }
            if _value == true {
                self.vote = Mapping::default();
                self.qtd_vote_yes = 0u64;
                self.qtd_vote_no = 0u64;
                self.balance_yes = 0u128;
                self.balance_no = 0u128;
                self.data_vote_end = 0u64;
            }else {
                self.data_vote_end = Self::env().block_timestamp();
            }
            self.status = _value;
            Ok(())
        }

        #[openbrush::modifiers(only_owner)]
        #[ink(message)]
        pub fn finish_and_active_withdraw(&mut self) -> Result<(), PSP22Error> {
            if self.status_withdraw == true {
                return Err(PSP22Error::Custom(String::from("Contract not active")));
            }
            self.status_withdraw = true;
            Ok(())
        }
        #[ink(message)]
        pub fn get_vote(&mut self, accontid: AccountId) -> Result<bool, PSP22Error> {
            let votes = self.vote.get(&accontid);
            if votes.is_none() {
                return Err(PSP22Error::Custom(String::from("No votes")));
            }
            self.status_withdraw = true;
            Ok(votes.unwrap())
        }
        #[ink(message)]
        pub fn get_qtd_votes(&mut self) -> Result<InfoContract, PSP22Error> {
            Ok(InfoContract {
                data_vote_end: self.data_vote_end,
                qtd_vote_yes: self.qtd_vote_yes,
                qtd_vote_no: self.qtd_vote_no,
                balance_yes: self.balance_yes,
                balance_no: self.balance_no,
            })
        }
        #[ink(message)]
        pub fn withdraw(&mut self) -> Result<(), PSP22Error> {
            if !self.status_withdraw {
                return Err(PSP22Error::Custom(String::from("Contract not active")));
            }
            let caller = self.env().caller();

            let psp22_contract_address = self.pair_psp22.unwrap();
            let token: contract_ref!(PSP22) = psp22_contract_address.into();
            let balance = token.balance_of(caller);
            if balance == 0u128 {
                return Err(PSP22Error::Custom(String::from("User don't have balance")));
            }
            let is_withdraw = self.withdraw.get(&caller);
            if is_withdraw.is_some() {
                return Err(PSP22Error::Custom(String::from("User already withdraw")));
            }
            let supply = token.total_supply();
            let balance = Self::env().balance();
            let current_balance = balance
                .checked_sub(Self::env().minimum_balance())
                .unwrap_or_default();

            let porcent = ((balance * 100) / supply) as u128;

            let total_withdraw = ((current_balance * porcent) / 100u128) as u128;
            Self::env()
                .transfer(caller, total_withdraw)
                .map_err(|_| PSP22Error::Custom(String::from("Tranfer error")))?;

            self.withdraw.insert(&caller, &total_withdraw);
            Ok(())
        }
    }
    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::test::default_accounts;

        #[ink::test]
        fn test_withdraw() {
            let mut safe_guard = Safeguard::new(None);
            assert_eq!(safe_guard.withdraw(), Ok(()));
        }
        #[ink::test]
        fn test_get_vote() {
            let accounts = default_accounts::<ink::env::DefaultEnvironment>();
            let mut safe_guard = Safeguard::new(None);
            assert_eq!(safe_guard.get_vote(accounts.alice), Ok(false));
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
            }));
        }

        #[ink::test]
        fn test_finish_and_active_withdraw() {
            let mut safe_guard = Safeguard::new(None);
            assert_eq!(safe_guard.finish_and_active_withdraw(), Ok(()));
        }

        #[ink::test]
        fn test_vote_active() {
            let mut safe_guard = Safeguard::new(None);
            assert_eq!(safe_guard.vote_active(true), Ok(()));
        }

        #[ink::test]
        fn test_vote() {
            let mut safe_guard = Safeguard::new(None);
            assert_eq!(safe_guard.vote(true), Ok(()));
        }
    }
}
