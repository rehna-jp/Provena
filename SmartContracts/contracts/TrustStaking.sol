// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;




import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20;



interface IReputationSystem {
    function updateReputation(address stakeholder, bool success, uint256 trustScore) external;
    function getStakingMultiplier(address stakeholder) external view returns (uint256);
    function initializeReputation(address _stakeholder) external;
}

interface IAIScoreOracleMinimal {
    // marker interface for address consistency
}

interface IEscrowDisputeHook {
    function onSlashed(string calldata productId, address guilty, uint256 amount) external;
}

contract TrustStaking is Ownable, ReentrancyGuard {
    IERC20 public immutable neuroToken;
    IReputationSystem public immutable reputationSystem;
    address public aiOracle;
    address public escrowDispute;

    enum StakeholderType { MANUFACTURER, DISTRIBUTOR, RETAILER }

    struct Stakeholder {
        StakeholderType sType;
        uint256 totalStaked;
        uint256 totalRewards;
        bool isRegistered;
    }

    struct ProductStake {
        string productId;
        address manufacturer;
        uint256 manufacturerStake;
        address[] distributors;
        mapping(address => uint256) distributorStakes;
        address[] retailers;
        mapping(address => uint256) retailerStakes;
        uint256 trustScore;
        bool isActive;
        bool rewardsDistributed;
        uint256 createdAt;
        bytes32 anomaliesHash;
        bytes32 verificationHash;
    }

    // FIXED: Changed from DKGData to DKGProduct for consistency
    struct DKGProduct {
        string ual;                    // Uniform Asset Locator from DKG
        string knowledgeAssetHash;     // Hash of JSON-LD data
        bool dkgVerified;
        uint256 dkgTimestamp;
    }
   
    mapping(string => ProductStake) private _productStakes;
    mapping(address => Stakeholder) public stakeholders;
    mapping(string => bool) public productExists;
    mapping(string => DKGProduct) public dkgProducts;

    uint256 public constant MIN_MANUFACTURER_STAKE = 100 * 1e18;
    uint256 public constant MIN_DISTRIBUTOR_STAKE = 50 * 1e18;
    uint256 public constant MIN_RETAILER_STAKE = 25 * 1e18;
    
    // ADDED: Configurable default trust score
    uint256 public defaultTrustScore = 85;

    event StakeholderRegistered(address indexed stakeholder, StakeholderType sType);
    event ProductStaked(string indexed productId, address indexed manufacturer, uint256 amount);
    event DistributorStaked(string indexed productId, address indexed distributor, uint256 amount);
    event RetailerStaked(string indexed productId, address indexed retailer, uint256 amount);
    event TrustScoreUpdated(string indexed productId, uint256 newScore, bytes32 anomaliesHash, bytes32 verificationHash);
    event RewardsDistributed(string indexed productId, uint256 manuPayout, uint256 distPayoutTotal, uint256 retailPayoutTotal);
    event StakeSlashed(string indexed productId, address indexed guilty, uint256 amount);
    event EscrowHookSet(address indexed escrow);
    event AIOracleSet(address indexed aiOracle);
    event KnowledgeAssetCreated(string indexed productId, string ual, string jsonLDHash);
    event CrossChainEvent(string indexed destinationChain, string indexed eventType, string data);
    event DKGVerificationComplete(string indexed productId, bool success);
    event DefaultTrustScoreUpdated(uint256 newScore); // ADDED

    constructor(address _neuroToken, address _reputationSystem) Ownable(msg.sender) {
        require(_neuroToken != address(0), "Invalid token address");
        require(_reputationSystem != address(0), "Invalid reputation address");
        neuroToken = IERC20(_neuroToken);
        reputationSystem = IReputationSystem(_reputationSystem);
        aiOracle = address(0);
    }

    function setAIOracle(address _aiOracle) external onlyOwner {
        require(_aiOracle != address(0), "Invalid AI Oracle address");
        require(aiOracle == address(0), "AI Oracle already set");
        aiOracle = _aiOracle;
        emit AIOracleSet(_aiOracle);
    }

    function setEscrowDispute(address _escrow) external onlyOwner {
        require(_escrow != address(0), "Invalid escrow address");
        escrowDispute = _escrow;
        emit EscrowHookSet(_escrow);
    }
    
    // ADDED: Allow owner to update default trust score
    function setDefaultTrustScore(uint256 _score) external onlyOwner {
        require(_score <= 100, "Score too high");
        require(_score >= 50, "Score too low");
        defaultTrustScore = _score;
        emit DefaultTrustScoreUpdated(_score);
    }

    function registerStakeholder(StakeholderType _sType) external {
        require(!stakeholders[msg.sender].isRegistered, "Already registered");
        stakeholders[msg.sender] = Stakeholder({
            sType: _sType,
            totalStaked: 0,
            totalRewards: 0,
            isRegistered: true
        });
        try reputationSystem.initializeReputation(msg.sender) {} catch {}
        emit StakeholderRegistered(msg.sender, _sType);
    }

    function manufacturerStake(
        string memory _productId, 
        uint256 _amount, 
        string memory _ual,
        string memory _jsonLDHash
    ) external nonReentrant {
        // ADDED: Input validation
        require(bytes(_productId).length > 0, "Empty product ID");
        require(bytes(_ual).length > 0, "Empty UAL");
        require(bytes(_jsonLDHash).length > 0, "Empty hash");
        
        uint256 minStake = (MIN_MANUFACTURER_STAKE * reputationSystem.getStakingMultiplier(msg.sender)) / 100;
        require(_amount >= minStake, "Below min stake");
        require(stakeholders[msg.sender].isRegistered, "Not registered");
        require(stakeholders[msg.sender].sType == StakeholderType.MANUFACTURER, "Not manufacturer");
        require(!productExists[_productId], "Product exists");

        dkgProducts[_productId] = DKGProduct({
            ual: _ual,
            knowledgeAssetHash: _jsonLDHash,
            dkgVerified: true,
            dkgTimestamp: block.timestamp
        });

        neuroToken.transferFrom(msg.sender, address(this), _amount);

        ProductStake storage p = _productStakes[_productId];
        p.productId = _productId;
        p.manufacturer = msg.sender;
        p.manufacturerStake = _amount;
        p.trustScore = defaultTrustScore; // CHANGED: Use configurable default
        p.isActive = true;
        p.createdAt = block.timestamp;
        productExists[_productId] = true;

        stakeholders[msg.sender].totalStaked += _amount;
        
        emit KnowledgeAssetCreated(_productId, _ual, _jsonLDHash);
        emit CrossChainEvent("neuroweb", "knowledge_asset_created", _ual);
        emit ProductStaked(_productId, msg.sender, _amount);
    }

    function distributorStake(string memory _productId, uint256 _amount) external nonReentrant {
        require(bytes(_productId).length > 0, "Empty product ID");
        uint256 minStake = (MIN_DISTRIBUTOR_STAKE * reputationSystem.getStakingMultiplier(msg.sender)) / 100;
        require(_amount >= minStake, "Below min stake");
        require(stakeholders[msg.sender].isRegistered, "Not registered");
        require(stakeholders[msg.sender].sType == StakeholderType.DISTRIBUTOR, "Not distributor");
        require(_productStakes[_productId].isActive, "Product not active");

        neuroToken.transferFrom(msg.sender, address(this), _amount);

        ProductStake storage p = _productStakes[_productId];
        if (p.distributorStakes[msg.sender] == 0) {
            p.distributors.push(msg.sender);
        }
        p.distributorStakes[msg.sender] += _amount;
        stakeholders[msg.sender].totalStaked += _amount;

        emit DistributorStaked(_productId, msg.sender, _amount);
        emit CrossChainEvent("acala", "payment_processed", string(abi.encodePacked(
            "product:", _productId, ",amount:", _amount
        )));
    }

    function retailerStake(string memory _productId, uint256 _amount) external nonReentrant {
        require(bytes(_productId).length > 0, "Empty product ID");
        uint256 minStake = (MIN_RETAILER_STAKE * reputationSystem.getStakingMultiplier(msg.sender)) / 100;
        require(_amount >= minStake, "Below min stake");
        require(stakeholders[msg.sender].isRegistered, "Not registered");
        require(stakeholders[msg.sender].sType == StakeholderType.RETAILER, "Not retailer");
        require(_productStakes[_productId].isActive, "Product not active");

        neuroToken.transferFrom(msg.sender, address(this), _amount);

        ProductStake storage p = _productStakes[_productId];
        if (p.retailerStakes[msg.sender] == 0) {
            p.retailers.push(msg.sender);
        }
        p.retailerStakes[msg.sender] += _amount;
        stakeholders[msg.sender].totalStaked += _amount;

        emit RetailerStaked(_productId, msg.sender, _amount);
    }

    function getDKGData(string memory _productId) external view returns (
        string memory ual,
        string memory knowledgeAssetHash,
        bool verified,
        uint256 timestamp
    ) {
        DKGProduct memory data = dkgProducts[_productId];
        return (data.ual, data.knowledgeAssetHash, data.dkgVerified, data.dkgTimestamp);
    }
    
    function verifyDKGAsset(string memory _productId) external view returns (bool) {
        return dkgProducts[_productId].dkgVerified;
    }

    function updateTrustScore(
        string calldata _productId,
        uint256 _newScore,
        bytes32 _anomaliesHash,
        bytes32 _verificationHash
    ) external {
        require(msg.sender == aiOracle, "Only oracle");
        require(aiOracle != address(0), "AI Oracle not set");
        require(dkgProducts[_productId].dkgVerified, "DKG verification required");
        require(_newScore <= 100, "Score too high");
        
        ProductStake storage p = _productStakes[_productId];
        require(p.isActive, "Product not active");
        
        p.trustScore = _newScore;
        p.anomaliesHash = _anomaliesHash;
        p.verificationHash = _verificationHash;
        
        emit TrustScoreUpdated(_productId, _newScore, _anomaliesHash, _verificationHash);
    }

    function distributeRewards(string memory _productId) external onlyOwner nonReentrant {
        ProductStake storage p = _productStakes[_productId];
        require(p.isActive, "Product not active");
        require(!p.rewardsDistributed, "Already distributed");

        uint256 manuPayout;
        uint256 distTotal;
        uint256 retailTotal;

        if (p.trustScore >= 90) {
            // High trust → +20% manufacturer, +10% others
            manuPayout = (p.manufacturerStake * 120) / 100; // OPTIMIZED
            neuroToken.transfer(p.manufacturer, manuPayout);
            stakeholders[p.manufacturer].totalRewards += manuPayout;

            // OPTIMIZED: Cache array length
            uint256 distCount = p.distributors.length;
            for (uint256 i = 0; i < distCount; ++i) {
                address d = p.distributors[i];
                uint256 stake = p.distributorStakes[d];
                uint256 reward = (stake * 110) / 100;
                neuroToken.transfer(d, reward);
                stakeholders[d].totalRewards += reward;
                distTotal += reward;
                reputationSystem.updateReputation(d, true, p.trustScore);
            }
            
            uint256 retailCount = p.retailers.length;
            for (uint256 i = 0; i < retailCount; ++i) {
                address r = p.retailers[i];
                uint256 stakeR = p.retailerStakes[r];
                uint256 rewardR = (stakeR * 110) / 100;
                neuroToken.transfer(r, rewardR);
                stakeholders[r].totalRewards += rewardR;
                retailTotal += rewardR;
                reputationSystem.updateReputation(r, true, p.trustScore);
            }
            
            reputationSystem.updateReputation(p.manufacturer, true, p.trustScore);

        } else if (p.trustScore >= 75) {
            // Return stake only
            manuPayout = p.manufacturerStake;
            neuroToken.transfer(p.manufacturer, p.manufacturerStake);
            
            uint256 distCount = p.distributors.length;
            for (uint256 i = 0; i < distCount; ++i) {
                address d = p.distributors[i];
                uint256 amt = p.distributorStakes[d];
                neuroToken.transfer(d, amt);
                distTotal += amt;
            }
            
            uint256 retailCount = p.retailers.length;
            for (uint256 i = 0; i < retailCount; ++i) {
                address r = p.retailers[i];
                uint256 amtR = p.retailerStakes[r];
                neuroToken.transfer(r, amtR);
                retailTotal += amtR;
            }

        } else {
            // Low trust → hold for potential dispute
            // No distribution
        }

        p.rewardsDistributed = true;
        p.isActive = false;
        emit RewardsDistributed(_productId, manuPayout, distTotal, retailTotal);
    }

    function slash(string calldata _productId, address _guilty, uint256 _amount) external nonReentrant {
        require(msg.sender == owner() || msg.sender == escrowDispute, "Only owner or escrow");
        require(_guilty != address(0), "Invalid guilty address");
        
        ProductStake storage p = _productStakes[_productId];
        require(!p.isActive, "Only after inactive or resolution");
        require(_amount > 0, "Zero amount");
        require(neuroToken.balanceOf(address(this)) >= _amount, "Insufficient balance");
        
        emit StakeSlashed(_productId, _guilty, _amount);
        
        if (escrowDispute != address(0)) {
            IEscrowDisputeHook(escrowDispute).onSlashed(_productId, _guilty, _amount);
        }

          // Burn 20%, send rest to escrow

        address BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
        uint256 burnAmount = _amount * 20 / 100;
        neuroToken.safeTransfer(BURN_ADDRESS, burnAmount);
        neuroToken.safeTransfer(escrowDispute, _amount - burnAmount);
        
        // Update reputation for guilty party
        reputationSystem.updateReputation(_guilty, false, 0);
    }

    // ── Getters ──
    function getDistributors(string memory _productId) external view returns (address[] memory) {
        return _productStakes[_productId].distributors;
    }

    function getRetailers(string memory _productId) external view returns (address[] memory) {
        return _productStakes[_productId].retailers;
    }

    function getDistributorStake(string memory _productId, address _dist) external view returns (uint256) {
        return _productStakes[_productId].distributorStakes[_dist];
    }

    function getRetailerStake(string memory _productId, address _retailer) external view returns (uint256) {
        return _productStakes[_productId].retailerStakes[_retailer];
    }

    function getProductMeta(string memory _productId) external view returns (
        address manufacturer,
        uint256 manufacturerStakeamount,
        uint256 trustScore,
        bool isActive,
        bool rewardsDistributed,
        uint256 createdAt,
        bytes32 anomaliesHash,
        bytes32 verificationHash
    ) {
        ProductStake storage p = _productStakes[_productId];
        return (
            p.manufacturer, 
            p.manufacturerStake, 
            p.trustScore, 
            p.isActive, 
            p.rewardsDistributed, 
            p.createdAt, 
            p.anomaliesHash, 
            p.verificationHash
        );
    }
}