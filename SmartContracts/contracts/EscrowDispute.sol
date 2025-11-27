// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

interface ITrustStakingMeta {
    function getProductMeta(string calldata _productId) external view returns (
        address manufacturer,
        uint256 manufacturerStake,
        uint256 trustScore,
        bool isActive,
        bool rewardsDistributed,
        uint256 createdAt,
        bytes32 anomaliesHash,
        bytes32 verificationHash
    );
    function slash(string calldata _productId, address _guilty, uint256 _amount) external;
}

contract EscrowDispute is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    IERC20 public neuroToken;
    ITrustStakingMeta public trustStaking;

    enum DisputeStatus { NONE, OPEN, RESOLVED_FRAUD , RESOLVED_HONEST}

    struct Dispute {
        string productId;
        address raisedBy;
        string evidenceHash;
        uint256 openedAt;
        uint256 expiresAt;
        DisputeStatus status;
        address guiltyParty;
        uint256 slashedAmount;
    }

    uint256 public constant DISPUTE_WINDOW = 14 days;
    uint256 public constant DISPUTE_FEE = 5 * 1e18; // optional anti-spam

    mapping(string => Dispute) public disputes;

    event DisputeOpened(string indexed productId, address indexed raiser, string evidenceHash);
    event DisputeResolved(string indexed productId, DisputeStatus outcome, address indexed winner, uint256 amount);
    event EscrowReleased(string indexed productId, uint256 amountReleased);
    event SlashedNotified(string indexed productId, address indexed guiltyParty, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _neuroToken, address _trustStaking, address _owner) public initializer {
        __Ownable_init(_owner);
        __UUPSUpgradeable_init();
        neuroToken = IERC20(_neuroToken);
        trustStaking = ITrustStakingMeta(_trustStaking);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function openDispute(string memory _productId, string memory _evidenceHash) external {
        Dispute storage d = disputes[_productId];
        require(d.status == DisputeStatus.NONE, "Dispute exists");

        (, , uint256 trustScore, bool isActive, bool rewardsDistributed, , , ) =
            trustStaking.getProductMeta(_productId);

        require(trustScore < 75 && !isActive, "Cannot dispute"); // Allow for held states post-distribution
        // optional fee disabled in MVP
        // neuroToken.transferFrom(msg.sender, address(this), DISPUTE_FEE);

        d.productId = _productId;
        d.raisedBy = msg.sender;
        d.evidenceHash = _evidenceHash;
        d.openedAt = block.timestamp;
        d.expiresAt = block.timestamp + DISPUTE_WINDOW;
        d.status = DisputeStatus.OPEN;

        emit DisputeOpened(_productId, msg.sender, _evidenceHash);
    }

    function onSlashed(string calldata productId, address guilty, uint256 amount) external {
    require(msg.sender == address(trustStaking), "Only staking");
    // Distribute if needed; for now, emit
    emit SlashedNotified(productId, guilty, amount);
}

    function resolveDispute(
        string memory _productId,
        address _guiltyParty,
        uint256 _slashedAmount
    ) external onlyOwner {
        Dispute storage d = disputes[_productId];
        require(d.status == DisputeStatus.OPEN, "Not open");
        require(block.timestamp <= d.expiresAt, "Dispute expired");

        if (_guiltyParty != address(0) && _slashedAmount > 0) {
            d.status = DisputeStatus.RESOLVED_FRAUD;
            d.guiltyParty = _guiltyParty;
            d.slashedAmount = _slashedAmount;
            // delegate slashing to staking contract which holds funds
            trustStaking.slash(_productId, _guiltyParty, _slashedAmount);
            emit DisputeResolved(_productId, DisputeStatus.RESOLVED_FRAUD, d.raisedBy, _slashedAmount);
        } else {
            d.status = DisputeStatus.RESOLVED_HONEST;
            emit DisputeResolved(_productId, DisputeStatus.RESOLVED_HONEST, address(0), 0);
        }
    }

    function releaseEscrow(string memory _productId) external {
        Dispute storage d = disputes[_productId];
        require(d.status == DisputeStatus.OPEN, "Not open");
        require(block.timestamp > d.expiresAt, "Still in window");

        d.status = DisputeStatus.RESOLVED_HONEST;
        emit EscrowReleased(_productId, 0);
    }

    function getDispute(string memory _productId) external view returns (Dispute memory) {
        return disputes[_productId];
    }
}