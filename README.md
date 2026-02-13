# Lunes Safeguard - Guaranty-as-a-Service Platform

### Purpose

Comprehensive **Guaranty-as-a-Service** smart contract for the Lunes blockchain ecosystem. This advanced platform enables multi-project guarantee management with multi-asset collateral support, community governance, and intelligent scoring systems.

### ✨ Key Features

- **🏛️ Multi-Project Architecture** - Support for unlimited projects with individual governance
- **💎 Multi-Asset Collateral** - PSP22 tokens and NFT (PSP34) guarantee support
- **📊 Intelligent Scoring** - Normalized 0-100 guarantee scoring with multiple factors
- **⏰ Vesting System** - 5-year vesting period with timestamp-based validation
- **🗳️ Community Governance** - Decentralized voting for guarantee releases
- **🔒 Security Hardened** - Following OpenZeppelin audit recommendations
- **🛡️ Reentrancy Protection** - Comprehensive security guards
- **📈 Real-time Updates** - Automatic score updates on guarantee changes
- **🎯 Event Transparency** - Complete event emission for all operations

### Architecture

- **[ink! 5.1.1](https://github.com/paritytech/ink/tree/v5.1.1)** - Latest stable ink! framework
- **[PSP22 Standard](https://github.com/w3f/PSPs/blob/master/PSPs/psp-22.md)** - Token collateral integration
- **[PSP34 Standard](https://github.com/w3f/PSPs/blob/master/PSPs/psp-34.md)** - NFT collateral support
- **Security Audited** - Following [OpenZeppelin recommendations](https://blog.openzeppelin.com/security-review-ink-cargo-contract)

### License

Apache 2.0

## 📊 Guarantee Scoring System

The Lunes Safeguard implements a comprehensive **0-100 normalized scoring system** that evaluates project reliability based on multiple factors:

### Score Components

#### 1. Value-Based Scoring (0-90 points)
Tiered scoring based on total guarantee value using LUSDT as reference:
- **≥ 1M LUSDT**: 90 points (maximum base score)
- **≥ 500K LUSDT**: 80 points
- **≥ 100K LUSDT**: 70 points
- **≥ 50K LUSDT**: 60 points
- **≥ 10K LUSDT**: 50 points
- **≥ 5K LUSDT**: 40 points
- **≥ 1K LUSDT**: 30 points
- **Any guarantee**: 10 points (minimum)

#### 2. Asset Diversity Bonus (0-15 points)
Encourages portfolio diversification:
- **5 points**: Having PSP22 token assets
- **5 points**: Having NFT assets
- **3 points**: Multiple PSP22 tokens
- **2 points**: Multiple NFT collections
- **Maximum**: 15 points total

#### 3. Vesting Time Bonus (0-15 points)
Rewards long-term commitment:
- **Linear bonus**: Based on project age and 5-year vesting period
- **Full bonus**: 15 points for completed vesting
- **Proportional**: Gradual increase over time

### Scoring API

```rust
// Calculate real-time project score
pub fn calculate_project_score(&self, project_id: ProjectId) -> u8

// Get cached score (with fallback to calculation)
pub fn get_project_score(&self, project_id: ProjectId) -> u8

// Update and cache project score
pub fn update_project_score(&mut self, project_id: ProjectId) -> Result<u8, SafeguardError>
```

**Automatic Updates**: Scores are automatically recalculated on all guarantee operations.

## 🏗️ How to use - Contracts

### 🚀 Implementation Status

✅ **MIGRATED TO INK! 5.1.1** - OpenBrush dependencies removed  
✅ **Multi-Asset Vault** - PSP22 + NFT collateral support  
✅ **Guarantee Scoring** - Normalized 0-100 scoring system  
✅ **Vesting System** - 5-year timestamp-based vesting  
✅ **Community Governance** - Decentralized voting mechanism  
✅ **Security Hardened** - Following OpenZeppelin best practices  
✅ **Test Coverage** - 39/39 tests passing (100%)  
✅ **Production Ready** - Optimized WASM build (33.0K)  

### 📋 Prerequisites

1. Install Rust and ink! 5.1.1 environment:
```sh
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install ink! CLI
cargo install --force --locked cargo-contract --version 4.0.0

# Add WebAssembly target
rustup target add wasm32-unknown-unknown
```

2. Clone and setup:
```sh
git clone <repository-url>
cd lunes_safeguard
```

### 💫 Build

Run this command in the contract folder:

```sh
cd contracts/safeGard
cargo contract build
```

### 🧪 Run Tests

```sh
# Run all tests (39 tests)
cargo test

# Run specific test categories
cargo test test_project_  # Project management tests
cargo test test_score_    # Guarantee scoring tests
cargo test test_vesting_  # Vesting system tests
cargo test test_nft_      # NFT collateral tests
cargo test test_multi_    # Multi-asset tests

# Run with output
cargo test -- --nocapture
```

### 🔍 Security Testing

```sh
# Test reentrancy protection
cargo test test_reentrancy_protection

# Test arithmetic overflow protection
cargo test test_arithmetic_overflow_protection

# Test unauthorized access
cargo test test_unauthorized_access
cargo test test_multi_asset_unauthorized_access
cargo test test_nft_unauthorized_access

# Test input validation
cargo test test_input_validation
cargo test test_comprehensive_error_handling
```

### 🌐 Integration Testing

First start your local node. Recommended [lunes-node](https://github.com/lunes-platform/lunes-nightly) v0.13.0

```sh
# Start local node
./lunes-node --dev --tmp

# Run integration tests
cargo test test_complete_governance_workflow
cargo test test_multi_asset_portfolio_scoring
cargo test test_vesting_and_governance_integration
```

### 🚀 Deployment

```sh
# Build optimized release
cargo contract build --release

# Deploy to local testnet
cargo contract instantiate \
  --constructor new \
  --args "Some(0x...)" \
  --suri //Alice \
  --salt $(date +%s)

# Deploy to Lunes testnet
cargo contract instantiate \
  --constructor new \
  --args "Some(PSP22_TOKEN_ADDRESS)" \
  --url wss://testnet.lunes.io \
  --suri "your-seed-phrase"
```

## 📖 API Reference

### Project Management

```rust
// Register a new project
pub fn register_project(&mut self, pair_psp22: Option<AccountId>) -> Result<ProjectId, SafeguardError>

// Emergency pause/unpause project
pub fn emergency_pause_project(&mut self, project_id: ProjectId) -> Result<(), SafeguardError>
```

### Token Management

```rust
// Add supported PSP22 token
pub fn add_supported_token(&mut self, token_address: AccountId, lusdt_value: Balance) -> Result<TokenId, SafeguardError>

// Get token information
pub fn get_token_info(&self, token_id: TokenId) -> Option<TokenInfo>
```

### Guarantee Operations

```rust
// Add guarantee to project
pub fn add_guarantee(&mut self, project_id: ProjectId, token_id: TokenId, amount: Balance) -> Result<(), SafeguardError>

// Donate to project guarantee pool
pub fn donate_to_guarantee(&mut self, project_id: ProjectId, token_id: TokenId, amount: Balance) -> Result<(), SafeguardError>

// Withdraw guarantee
pub fn withdraw_guarantee(&mut self, project_id: ProjectId, token_id: TokenId, amount: Balance) -> Result<(), SafeguardError>

// Get user guarantee balance
pub fn get_user_guarantee(&self, project_id: ProjectId, token_id: TokenId, account: AccountId) -> Balance

// Get project total guarantees
pub fn get_project_total_guarantees(&self, project_id: ProjectId, token_id: TokenId) -> Balance
```

### NFT Collateral

```rust
// Add NFT collection
pub fn add_nft_collection(&mut self, collection_address: AccountId, valuation_method: NFTValuationMethod, base_value: Balance) -> Result<NFTCollectionId, SafeguardError>

// Deposit NFT as guarantee
pub fn deposit_nft_guarantee(&mut self, project_id: ProjectId, collection_id: NFTCollectionId, nft_token_id: NFTTokenId) -> Result<(), SafeguardError>

// Withdraw NFT guarantee
pub fn withdraw_nft_guarantee(&mut self, project_id: ProjectId, collection_id: NFTCollectionId, nft_token_id: NFTTokenId) -> Result<(), SafeguardError>

// Get NFT guarantee value
pub fn get_nft_guarantee_value(&self, project_id: ProjectId, collection_id: NFTCollectionId, account: AccountId, nft_token_id: NFTTokenId) -> Balance
```

### Vesting & Governance

```rust
// Request guarantee release (after 5-year vesting)
pub fn request_guarantee_release(&mut self, project_id: ProjectId) -> Result<(), SafeguardError>

// Vote on guarantee release
pub fn vote(&mut self, project_id: ProjectId, approve: bool) -> Result<(), SafeguardError>

// Check if vesting period is met
pub fn is_vesting_period_met(&self, project_id: ProjectId) -> bool

// Get remaining vesting time
pub fn get_remaining_vesting_time(&self, project_id: ProjectId) -> Option<u64>
```

### Scoring System

```rust
// Calculate project score (0-100)
pub fn calculate_project_score(&self, project_id: ProjectId) -> u8

// Get cached project score
pub fn get_project_score(&self, project_id: ProjectId) -> u8

// Update project score
pub fn update_project_score(&mut self, project_id: ProjectId) -> Result<u8, SafeguardError>
```

## 💡 Usage Examples

### Basic Project Setup

```rust
// 1. Register project
let project_id = contract.register_project(Some(psp22_token_address))?;

// 2. Add supported tokens
let token_id = contract.add_supported_token(token_address, 1_000_000)?; // 1 LUSDT value

// 3. Add guarantee
contract.add_guarantee(project_id, token_id, 10_000 * 1_000_000)?; // 10K tokens

// 4. Check score
let score = contract.get_project_score(project_id); // Returns 0-100
```

### Multi-Asset Portfolio

```rust
// Add multiple token types
let lusdt_id = contract.add_supported_token(lusdt_address, 1_000_000)?;
let lunes_id = contract.add_supported_token(lunes_address, 500_000)?;

// Add NFT collection
let nft_collection_id = contract.add_nft_collection(
    nft_address, 
    NFTValuationMethod::FixedValue, 
    5_000_000 // 5 LUSDT per NFT
)?;

// Create diversified guarantee
contract.add_guarantee(project_id, lusdt_id, 50_000 * 1_000_000)?;
contract.add_guarantee(project_id, lunes_id, 100_000 * 1_000_000)?;
contract.deposit_nft_guarantee(project_id, nft_collection_id, 1)?;

// Score will include diversity bonus
let score = contract.get_project_score(project_id);
```

### Governance Workflow

```rust
// After 5-year vesting period
if contract.is_vesting_period_met(project_id) {
    // Request release
    contract.request_guarantee_release(project_id)?;
    
    // Community votes (7-day period)
    contract.vote(project_id, true)?; // Approve
    
    // After voting period, withdraw if approved
    if contract.vote_active(project_id) == false {
        contract.withdraw_guarantee(project_id, token_id, amount)?;
    }
}
```

## 📚 Documentation

- **[Migration Guide](./MIGRATION_GUIDE.md)** - Complete migration documentation
- **[Security Modules](./contracts/safeGard/security.rs)** - Custom security implementations
- **[Integration Tests](./contracts/safeGard/integration_tests.rs)** - Comprehensive test suite

## 🔒 Security Features

### ✅ Implemented Protections

- **Reentrancy Guards** - Custom implementation preventing recursive calls
- **Overflow Protection** - Checked arithmetic operations
- **Access Control** - Robust ownership and permission system
- **Input Validation** - Comprehensive validation for all inputs
- **Storage Security** - Manual storage keys preventing layout overlap
- **Event Transparency** - Complete event emission for monitoring

### 🛡️ Security Audit Compliance

Following [OpenZeppelin Security Review](https://blog.openzeppelin.com/security-review-ink-cargo-contract):

- ❌ **Custom Selectors Avoided** - Prevents proxy selector clashing
- ✅ **Manual Storage Keys** - Prevents storage layout overlap
- ✅ **Reentrancy Protection** - Custom guard implementation
- ✅ **Arithmetic Safety** - Checked operations throughout
- ✅ **Input Validation** - Comprehensive validation layer
