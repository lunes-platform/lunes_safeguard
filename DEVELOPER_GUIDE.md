# Lunes Safeguard - Developer Guide

## 🏗️ Architecture Overview

The Lunes Safeguard contract implements a comprehensive **Guaranty-as-a-Service** platform with the following core components:

### Core Modules

1. **Project Management** - Multi-project support with individual governance
2. **Multi-Asset Vault** - PSP22 tokens and NFT collateral management
3. **Guarantee Scoring** - Normalized 0-100 scoring system
4. **Vesting System** - 5-year timestamp-based vesting
5. **Community Governance** - Decentralized voting for guarantee releases
6. **Security Layer** - Comprehensive protection mechanisms

## 📊 Storage Architecture

The contract uses a mapping-based storage layout for optimal gas efficiency:

```rust
// Project Management
project_owners: Mapping<ProjectId, AccountId>,
project_creation_timestamps: Mapping<ProjectId, u64>,
project_statuses: Mapping<ProjectId, bool>,

// Token Management
supported_tokens: Mapping<TokenId, TokenInfo>,
next_token_id: TokenId,

// Guarantee Tracking
user_guarantees: Mapping<(ProjectId, TokenId, AccountId), Balance>,
project_total_guarantees: Mapping<(ProjectId, TokenId), Balance>,

// NFT Collateral
supported_nft_collections: Mapping<NFTCollectionId, NFTCollectionInfo>,
nft_guarantees: Mapping<(ProjectId, NFTCollectionId, AccountId, NFTTokenId), Balance>,

// Scoring System
project_scores: Mapping<ProjectId, u8>,

// Governance
project_vote_end_times: Mapping<ProjectId, u64>,
project_votes: Mapping<(ProjectId, AccountId), bool>,
```

## 🎯 Guarantee Scoring Algorithm

### Implementation Details

The scoring system uses a three-component algorithm:

#### 1. Value-Based Scoring (0-70 points)

```rust
fn _calculate_value_score(&self, total_value: Balance) -> u32 {
    if total_value >= 1_000_000 * 1_000_000 { 70 }      // >= 1M LUSDT
    else if total_value >= 500_000 * 1_000_000 { 60 }   // >= 500K LUSDT
    else if total_value >= 100_000 * 1_000_000 { 50 }   // >= 100K LUSDT
    else if total_value >= 50_000 * 1_000_000 { 40 }    // >= 50K LUSDT
    else if total_value >= 10_000 * 1_000_000 { 30 }    // >= 10K LUSDT
    else if total_value >= 5_000 * 1_000_000 { 20 }     // >= 5K LUSDT
    else if total_value >= 1_000 * 1_000_000 { 10 }     // >= 1K LUSDT
    else if total_value > 0 { 5 }                        // Any guarantee
    else { 0 }
}
```

#### 2. Asset Diversity Bonus (0-15 points)

```rust
fn calculate_diversity_bonus(&self, project_id: ProjectId) -> u32 {
    let mut bonus = 0u32;
    
    // Check for PSP22 assets (5 points)
    if self.has_psp22_guarantees(project_id) {
        bonus += 5;
    }
    
    // Check for NFT assets (5 points)
    if self.has_nft_guarantees(project_id) {
        bonus += 5;
    }
    
    // Multiple PSP22 tokens (3 points)
    if self.count_psp22_tokens(project_id) > 1 {
        bonus += 3;
    }
    
    // Multiple NFT collections (2 points)
    if self.count_nft_collections(project_id) > 1 {
        bonus += 2;
    }
    
    bonus.min(15)
}
```

#### 3. Vesting Time Bonus (0-15 points)

```rust
fn _calculate_vesting_bonus(&self, project_id: ProjectId) -> u32 {
    if let Some(creation_timestamp) = self.project_creation_timestamps.get(project_id) {
        let current_timestamp = self.env().block_timestamp();
        let vesting_period = 5 * 365 * 24 * 60 * 60 * 1000u64; // 5 years in ms
        
        if current_timestamp >= creation_timestamp {
            let elapsed = current_timestamp - creation_timestamp;
            let bonus = elapsed.saturating_mul(15).saturating_div(vesting_period);
            bonus.min(15) as u32
        } else {
            0
        }
    } else {
        0
    }
}
```

## 🔒 Security Implementation

### Reentrancy Protection

The contract implements custom reentrancy guards:

```rust
// Check for active operations before state changes
if self.project_withdraw_statuses.get(project_id).unwrap_or(false) {
    return Err(SafeguardError::WithdrawalInProgress);
}

// Set guard before external calls
self.project_withdraw_statuses.insert(project_id, &true);

// External operations...

// Clear guard after completion
self.project_withdraw_statuses.insert(project_id, &false);
```

### Arithmetic Safety

All arithmetic operations use saturating math:

```rust
// Safe addition
let new_balance = current_balance.saturating_add(amount);

// Safe subtraction with validation
if current_balance < amount {
    return Err(SafeguardError::InsufficientBalance);
}
let new_balance = current_balance.saturating_sub(amount);
```

### Access Control

Multi-layered permission system:

```rust
// Contract owner operations
fn ensure_owner(&self) -> Result<(), SafeguardError> {
    if self.env().caller() != self.owner {
        return Err(SafeguardError::Unauthorized);
    }
    Ok(())
}

// Project owner operations
fn ensure_project_owner(&self, project_id: ProjectId) -> Result<(), SafeguardError> {
    let caller = self.env().caller();
    if self.project_owners.get(project_id) != Some(caller) {
        return Err(SafeguardError::Unauthorized);
    }
    Ok(())
}
```

## 🧪 Testing Strategy

### Test Categories

1. **Unit Tests** - Individual function testing
2. **Integration Tests** - End-to-end workflow testing
3. **Security Tests** - Attack vector validation
4. **Edge Case Tests** - Boundary condition testing

### Key Test Patterns

```rust
#[ink::test]
fn test_guarantee_scoring_integration() {
    let (mut contract, accounts) = setup();
    
    // Setup multi-asset portfolio
    let project_id = contract.register_project(None).unwrap();
    let token_id = contract.add_supported_token(accounts.alice, 1_000_000).unwrap();
    
    // Test scoring progression
    let initial_score = contract.get_project_score(project_id);
    assert_eq!(initial_score, 0);
    
    // Add guarantee and verify score update
    contract.add_guarantee(project_id, token_id, 10_000 * 1_000_000).unwrap();
    let updated_score = contract.get_project_score(project_id);
    assert!(updated_score > initial_score);
    
    // Verify automatic score updates
    let calculated_score = contract.calculate_project_score(project_id);
    assert_eq!(updated_score, calculated_score);
}
```

## 🚀 Deployment Guide

### Build Process

```bash
# Development build
cargo contract build

# Optimized release build
cargo contract build --release

# Verify build artifacts
ls -la target/ink/Safeguard/
```

### Deployment Steps

1. **Prepare Environment**
```bash
# Install dependencies
cargo install --force --locked cargo-contract --version 4.0.0

# Verify node connection
cargo contract info --url wss://testnet.lunes.io
```

2. **Deploy Contract**
```bash
# Upload code
cargo contract upload --suri "your-seed-phrase" --url wss://testnet.lunes.io

# Instantiate contract
cargo contract instantiate \
  --constructor new \
  --args "Some(PSP22_TOKEN_ADDRESS)" \
  --suri "your-seed-phrase" \
  --url wss://testnet.lunes.io \
  --salt $(date +%s)
```

3. **Verify Deployment**
```bash
# Check contract state
cargo contract call \
  --contract CONTRACT_ADDRESS \
  --message get_owner \
  --suri "your-seed-phrase" \
  --url wss://testnet.lunes.io
```

## 📈 Performance Optimization

### Gas Optimization Techniques

1. **Storage Efficiency**
   - Use individual mappings instead of nested structs
   - Minimize storage reads/writes
   - Cache frequently accessed values

2. **Computation Optimization**
   - Pre-calculate constants
   - Use saturating arithmetic
   - Minimize external calls

3. **Memory Management**
   - Avoid unnecessary clones
   - Use references where possible
   - Optimize data structures

### Build Size Optimization

The contract achieves significant WASM size reduction:
- **Original**: 77.2K
- **Optimized**: 33.0K (57% reduction)

## 🔧 Maintenance Guidelines

### Code Quality Standards

1. **Documentation** - All public functions must have comprehensive docs
2. **Testing** - Minimum 95% test coverage required
3. **Security** - All external calls must have reentrancy protection
4. **Performance** - Gas usage must be optimized for production

### Update Procedures

1. **Version Control** - Use semantic versioning
2. **Testing** - Full test suite must pass
3. **Security Review** - External audit for major changes
4. **Deployment** - Staged rollout with monitoring

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Check ink! version compatibility
   - Verify dependency versions
   - Clear target directory

2. **Test Failures**
   - Verify account setup
   - Check timestamp dependencies
   - Validate test data

3. **Deployment Issues**
   - Confirm network connectivity
   - Verify account balance
   - Check constructor arguments

### Debug Tools

```bash
# Verbose build output
cargo contract build --verbose

# Test with output
cargo test -- --nocapture

# Check contract metadata
cargo contract info --contract CONTRACT_ADDRESS
```

## 📚 Additional Resources

- [ink! Documentation](https://use.ink/)
- [PSP Standards](https://github.com/w3f/PSPs)
- [Lunes Platform](https://lunes.io)
- [OpenZeppelin Security](https://blog.openzeppelin.com/security-review-ink-cargo-contract)
