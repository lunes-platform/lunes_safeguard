#![cfg_attr(not(feature = "std"), no_std)]
#![allow(clippy::cast_possible_truncation)]

use ink::primitives::AccountId;
use ink::prelude::{string::String, vec::Vec};
use scale::{Decode, Encode};

pub type Balance = u128;

/// PSP22 Error types based on the official standard
#[derive(Debug, PartialEq, Eq, Clone, Encode, Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum PSP22Error {
    /// Custom error type for implementation-based errors
    Custom(String),
    /// Returned when not enough balance to fulfill a request is available
    InsufficientBalance,
    /// Returned when not enough allowance to fulfill a request is available
    InsufficientAllowance,
    /// Returned when recipient's address is zero
    ZeroRecipientAddress,
    /// Returned when sender's address is zero  
    ZeroSenderAddress,
    /// Returned when safe transfer check fails
    SafeTransferCheckFailed(String),
}

impl From<PSP22Error> for ink::LangError {
    fn from(_error: PSP22Error) -> Self {
        ink::LangError::CouldNotReadInput
    }
}

/// PSP22 Events based on the official standard
#[derive(Debug, PartialEq, Eq, Clone, Encode, Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum PSP22Event {
    /// Event emitted when a token transfer occurs
    Transfer {
        from: Option<AccountId>,
        to: Option<AccountId>, 
        value: Balance,
    },
    /// Event emitted when an approval occurs
    Approval {
        owner: AccountId,
        spender: AccountId,
        value: Balance,
    },
}

/// PSP22 trait definition based on the official Polkadot Standard Proposal
#[ink::trait_definition]
pub trait PSP22 {
    /// Returns the total token supply
    #[ink(message)]
    fn total_supply(&self) -> Balance;

    /// Returns the account balance for the specified `owner`
    /// Returns `0` if the account is non-existent
    #[ink(message)]
    fn balance_of(&self, owner: AccountId) -> Balance;

    /// Returns the amount which `spender` is still allowed to withdraw from `owner`
    /// Returns `0` if no allowance has been set
    #[ink(message)]
    fn allowance(&self, owner: AccountId, spender: AccountId) -> Balance;

    /// Transfers `value` amount of tokens from the caller's account to account `to`
    /// with additional `data` in unspecified format
    /// 
    /// On success a `Transfer` event is emitted
    /// 
    /// # Errors
    /// 
    /// Reverts with error `InsufficientBalance` if there are not enough tokens on
    /// the caller's account Balance
    /// 
    /// Reverts with error `ZeroSenderAddress` if sender's address is zero
    /// 
    /// Reverts with error `ZeroRecipientAddress` if recipient's address is zero
    #[ink(message)]
    fn transfer(
        &mut self,
        to: AccountId,
        value: Balance,
        data: Vec<u8>,
    ) -> Result<(), PSP22Error>;

    /// Transfers `value` tokens on the behalf of `from` to the account `to`
    /// with additional `data` in unspecified format
    /// 
    /// This can be used to allow a contract to transfer tokens on one's behalf and/or
    /// to charge fees in sub-currencies, for example
    /// 
    /// On success a `Transfer` event is emitted
    /// 
    /// # Errors
    /// 
    /// Reverts with `InsufficientAllowance` error if there are not enough tokens allowed
    /// for the caller to withdraw from `from`
    /// 
    /// Reverts with `InsufficientBalance` error if there are not enough tokens on
    /// the account Balance of `from`
    /// 
    /// Reverts with error `ZeroSenderAddress` if sender's address is zero
    /// 
    /// Reverts with error `ZeroRecipientAddress` if recipient's address is zero
    #[ink(message)]
    fn transfer_from(
        &mut self,
        from: AccountId,
        to: AccountId,
        value: Balance,
        data: Vec<u8>,
    ) -> Result<(), PSP22Error>;

    /// Allows `spender` to withdraw from the caller's account multiple times, up to
    /// the `value` amount
    /// 
    /// If this function is called again it overwrites the current allowance with `value`
    /// 
    /// An `Approval` event is emitted
    #[ink(message)]
    fn approve(&mut self, spender: AccountId, value: Balance) -> Result<(), PSP22Error>;

    /// Atomically increases the allowance granted to `spender` by the caller
    /// 
    /// An `Approval` event is emitted
    /// 
    /// # Errors
    /// 
    /// Reverts with error `ZeroSenderAddress` if sender's address is zero
    /// 
    /// Reverts with error `ZeroRecipientAddress` if recipient's address is zero
    #[ink(message)]
    fn increase_allowance(
        &mut self,
        spender: AccountId,
        delta_value: Balance,
    ) -> Result<(), PSP22Error>;

    /// Atomically decreases the allowance granted to `spender` by the caller
    /// 
    /// An `Approval` event is emitted
    /// 
    /// # Errors
    /// 
    /// Reverts with error `InsufficientAllowance` if there are not enough tokens allowed
    /// by owner for `spender`
    /// 
    /// Reverts with error `ZeroSenderAddress` if sender's address is zero
    /// 
    /// Reverts with error `ZeroRecipientAddress` if recipient's address is zero
    #[ink(message)]
    fn decrease_allowance(
        &mut self,
        spender: AccountId,
        delta_value: Balance,
    ) -> Result<(), PSP22Error>;
}

/// PSP22 Metadata trait for additional token information
#[ink::trait_definition]
pub trait PSP22Metadata {
    /// Returns the token name
    #[ink(message)]
    fn token_name(&self) -> Option<String>;

    /// Returns the token symbol
    #[ink(message)]
    fn token_symbol(&self) -> Option<String>;

    /// Returns the token decimals
    #[ink(message)]
    fn token_decimals(&self) -> u8;
}

/// PSP22 Mintable trait for tokens that can be minted
#[ink::trait_definition]
pub trait PSP22Mintable {
    /// Mint `amount` tokens to `account`
    #[ink(message)]
    fn mint(&mut self, account: AccountId, amount: Balance) -> Result<(), PSP22Error>;
}

/// PSP22 Burnable trait for tokens that can be burned
#[ink::trait_definition]  
pub trait PSP22Burnable {
    /// Burn `amount` tokens from `account`
    #[ink(message)]
    fn burn(&mut self, account: AccountId, amount: Balance) -> Result<(), PSP22Error>;

    /// Burn `amount` tokens from the caller's account
    #[ink(message)]
    fn burn_from_caller(&mut self, amount: Balance) -> Result<(), PSP22Error>;
}
