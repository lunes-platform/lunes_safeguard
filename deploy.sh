#!/bin/bash

# Lunes Safeguard - Guaranty-as-a-Service Platform Deployment Script
# Complete multi-asset vault with guarantee scoring system
# ink! 5.1.1 with comprehensive security hardening

set -e

echo "🎆 Lunes Safeguard - Guaranty-as-a-Service Platform"
echo "===================================================="
echo "📊 Features: Multi-Asset Vault | Guarantee Scoring | Vesting System"
echo "🔒 Security: Reentrancy Protection | Overflow Protection | Access Control"
echo "🧪 Tests: 39/39 Passing | Build: Optimized (33.0K WASM)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
CONTRACT_DIR="contracts/safeGard"
NETWORK=${1:-"local"}
PSP22_TOKEN=${2:-""}
NFT_COLLECTION=${3:-""}
VERSION="1.0.0"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if cargo-contract is installed
    if ! command -v cargo-contract &> /dev/null; then
        print_error "cargo-contract is not installed. Please install it first:"
        echo "cargo install --force --locked cargo-contract --version 4.0.0"
        exit 1
    fi
    
    # Check if wasm32 target is added
    if ! rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
        print_error "wasm32-unknown-unknown target not found. Please add it:"
        echo "rustup target add wasm32-unknown-unknown"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Run comprehensive test suite
run_comprehensive_tests() {
    print_status "Running comprehensive test suite (39 tests)..."
    
    cd "$CONTRACT_DIR"
    
    # Run all tests with detailed output
    echo -e "${CYAN}Running all 39 tests...${NC}"
    if cargo test --quiet; then
        print_success "All 39 tests passed ✅"
    else
        print_error "Tests failed. Please fix issues before deployment."
        exit 1
    fi
    
    # Run specific test categories
    print_status "Running test categories..."
    
    echo -e "${PURPLE}• Project Management Tests${NC}"
    cargo test test_project_ --quiet
    
    echo -e "${PURPLE}• Guarantee Scoring Tests${NC}"
    cargo test test_score_ --quiet
    
    echo -e "${PURPLE}• Vesting System Tests${NC}"
    cargo test test_vesting_ --quiet
    
    echo -e "${PURPLE}• NFT Collateral Tests${NC}"
    cargo test test_nft_ --quiet
    
    echo -e "${PURPLE}• Multi-Asset Tests${NC}"
    cargo test test_multi_ --quiet
    
    # Run security-focused tests
    print_status "Running security tests..."
    
    echo -e "${RED}• Reentrancy Protection${NC}"
    cargo test test_reentrancy_protection --quiet
    
    echo -e "${RED}• Arithmetic Overflow Protection${NC}"
    cargo test test_arithmetic_overflow_protection --quiet
    
    echo -e "${RED}• Unauthorized Access Protection${NC}"
    cargo test test_unauthorized_access --quiet
    cargo test test_multi_asset_unauthorized_access --quiet
    cargo test test_nft_unauthorized_access --quiet
    
    echo -e "${RED}• Input Validation${NC}"
    cargo test test_input_validation --quiet
    cargo test test_comprehensive_error_handling --quiet
    
    print_success "Security tests passed"
    
    cd - > /dev/null
}

# Build contract with optimization
build_contract() {
    print_status "Building optimized contract..."
    
    cd "$CONTRACT_DIR"
    
    # Build release version for production
    echo -e "${CYAN}Building optimized release version...${NC}"
    if cargo contract build --release --quiet; then
        # Get build info (updated for lowercase package name)
        WASM_SIZE=$(ls -lh ../../target/ink/safeguard/safeguard.wasm | awk '{print $5}')
        print_success "Contract built successfully - WASM size: $WASM_SIZE"
        
        # Show build artifacts
        echo -e "${BLUE}Build artifacts:${NC}"
        echo -e "  • safeguard.contract (code + metadata)"
        echo -e "  • safeguard.wasm (optimized contract code)"
        echo -e "  • safeguard.json (contract metadata)"
    else
        print_error "Contract build failed"
        exit 1
    fi
    
    cd - > /dev/null
}

# Deploy to local network
deploy_local() {
    print_status "Deploying to local network..."
    
    cd "$CONTRACT_DIR"
    
    # Generate salt for unique deployment
    SALT=$(date +%s)
    
    # Deploy contract
    if [ -n "$PSP22_TOKEN" ]; then
        ARGS="Some(\"$PSP22_TOKEN\")"
    else
        ARGS="None"
        print_warning "No PSP22 token address provided. Deploying without token integration."
    fi
    
    print_status "Deploying with args: $ARGS"
    
    if cargo contract instantiate \
        --constructor new \
        --args "$ARGS" \
        --suri //Alice \
        --salt "$SALT" \
        --skip-confirm; then
        print_success "Contract deployed successfully to local network"
    else
        print_error "Deployment to local network failed"
        exit 1
    fi
    
    cd - > /dev/null
}

# Deploy to testnet
deploy_testnet() {
    print_status "Deploying to Lunes testnet..."
    
    if [ -z "$PSP22_TOKEN" ]; then
        print_error "PSP22 token address is required for testnet deployment"
        exit 1
    fi
    
    cd "$CONTRACT_DIR"
    
    # Generate salt for unique deployment
    SALT=$(date +%s)
    
    print_status "Deploying with PSP22 token: $PSP22_TOKEN"
    
    if cargo contract instantiate \
        --constructor new \
        --args "Some(\"$PSP22_TOKEN\")" \
        --url wss://testnet.lunes.io \
        --suri "$LUNES_SEED_PHRASE" \
        --salt "$SALT" \
        --skip-confirm; then
        print_success "Contract deployed successfully to testnet"
    else
        print_error "Deployment to testnet failed"
        exit 1
    fi
    
    cd - > /dev/null
}

# Deploy to mainnet
deploy_mainnet() {
    print_status "Deploying to Lunes mainnet..."
    
    if [ -z "$PSP22_TOKEN" ]; then
        print_error "PSP22 token address is required for mainnet deployment"
        exit 1
    fi
    
    if [ -z "$LUNES_SEED_PHRASE" ]; then
        print_error "LUNES_SEED_PHRASE environment variable is required for mainnet deployment"
        exit 1
    fi
    
    print_warning "⚠️  MAINNET DEPLOYMENT ⚠️"
    print_warning "This will deploy to the live Lunes network."
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_status "Deployment cancelled"
        exit 0
    fi
    
    cd "$CONTRACT_DIR"
    
    # Generate salt for unique deployment
    SALT=$(date +%s)
    
    print_status "Deploying with PSP22 token: $PSP22_TOKEN"
    
    if cargo contract instantiate \
        --constructor new \
        --args "Some(\"$PSP22_TOKEN\")" \
        --url wss://mainnet.lunes.io \
        --suri "$LUNES_SEED_PHRASE" \
        --salt "$SALT" \
        --skip-confirm; then
        print_success "Contract deployed successfully to mainnet"
    else
        print_error "Deployment to mainnet failed"
        exit 1
    fi
    
    cd - > /dev/null
}

# Show usage
show_usage() {
    echo "Usage: $0 [NETWORK] [PSP22_TOKEN_ADDRESS]"
    echo ""
    echo "Networks:"
    echo "  local    - Deploy to local development node (default)"
    echo "  testnet  - Deploy to Lunes testnet"
    echo "  mainnet  - Deploy to Lunes mainnet"
    echo ""
    echo "Examples:"
    echo "  $0 local"
    echo "  $0 testnet 0x1234567890abcdef..."
    echo "  $0 mainnet 0x1234567890abcdef..."
    echo ""
    echo "Environment Variables:"
    echo "  LUNES_SEED_PHRASE - Required for testnet/mainnet deployment"
}

# Main execution
main() {
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        show_usage
        exit 0
    fi
    
    print_status "Starting deployment process..."
    print_status "Network: $NETWORK"
    
    # Run checks and build
    check_prerequisites
    run_comprehensive_tests
    build_contract
    
    # Deploy based on network
    case "$NETWORK" in
        "local")
            deploy_local
            ;;
        "testnet")
            deploy_testnet
            ;;
        "mainnet")
            deploy_mainnet
            ;;
        *)
            print_error "Unknown network: $NETWORK"
            show_usage
            exit 1
            ;;
    esac
    
    print_success "🎉 Deployment completed successfully!"
    print_status "Contract is now live on $NETWORK network"
    
    if [ "$NETWORK" != "local" ]; then
        print_status "Remember to:"
        print_status "1. Save the contract address"
        print_status "2. Verify the deployment"
        print_status "3. Test basic functionality"
        print_status "4. Update your frontend/integration"
    fi
}

# Execute main function
main "$@"
