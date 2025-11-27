// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ReputationSystem is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    enum TrustLevel { NEW, BASIC, TRUSTED, VERIFIED_PARTNER, PREMIUM }

    struct Reputation {
        uint256 score;              // 0-100
        TrustLevel level;
        uint256 successfulProducts;
        uint256 flaggedProducts;
        uint256 lastUpdated;
    }

    mapping(address => Reputation) public reputations;
    mapping(address => bool) public authorizedUpdaters;

    // Thresholds
    uint256 public constant PREMIUM_THRESHOLD = 95;
    uint256 public constant VERIFIED_THRESHOLD = 90;
    uint256 public constant TRUSTED_THRESHOLD = 80;
    uint256 public constant BASIC_THRESHOLD = 60;

    event ReputationUpdated(address indexed stakeholder, uint256 newScore, TrustLevel newLevel);
    event TrustLevelChanged(address indexed stakeholder, TrustLevel oldLevel, TrustLevel newLevel);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        authorizedUpdaters[initialOwner] = true;
    }

    // Required for UUPS
    function _authorizeUpgrade(address) internal override onlyOwner {}

    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    function initializeReputation(address _stakeholder) external onlyAuthorized {
        if (reputations[_stakeholder].lastUpdated != 0) return; // idempotent

        reputations[_stakeholder] = Reputation({
            score: 50,
            level: TrustLevel.NEW,
            successfulProducts: 0,
            flaggedProducts: 0,
            lastUpdated: block.timestamp
        });

        emit ReputationUpdated(_stakeholder, 50, TrustLevel.NEW);
    }

    function updateReputation(
        address _stakeholder,
        bool _success,
        uint256 _trustScore
    ) external onlyAuthorized {
        Reputation storage rep = reputations[_stakeholder];
        if (rep.lastUpdated == 0) {
            // lazy init if not present
            reputations[_stakeholder] = Reputation({
                score: 50,
                level: TrustLevel.NEW,
                successfulProducts: 0,
                flaggedProducts: 0,
                lastUpdated: block.timestamp
            });
            rep = reputations[_stakeholder];
        }

        TrustLevel oldLevel = rep.level;

        if (_success && _trustScore >= 90) {
            rep.score = _calculateNewScore(rep.score, 5);
            rep.successfulProducts += 1;
        } else if (_success) {
            rep.score = _calculateNewScore(rep.score, 2);
            rep.successfulProducts += 1;
        } else if (_trustScore < 75) {
            rep.score = _calculateNewScore(rep.score, -10);
            rep.flaggedProducts += 1;
        }

        rep.level = _calculateTrustLevel(rep.score);
        rep.lastUpdated = block.timestamp;

        emit ReputationUpdated(_stakeholder, rep.score, rep.level);
        if (oldLevel != rep.level) {
            emit TrustLevelChanged(_stakeholder, oldLevel, rep.level);
        }
    }

    function applyFraudPenalty(address _stakeholder) external onlyAuthorized {
        Reputation storage rep = reputations[_stakeholder];
        if (rep.lastUpdated == 0) {
            reputations[_stakeholder] = Reputation({
                score: 20,
                level: TrustLevel.NEW,
                successfulProducts: 0,
                flaggedProducts: 1,
                lastUpdated: block.timestamp
            });
            rep = reputations[_stakeholder];
        }

        TrustLevel oldLevel = rep.level;

        rep.score = _calculateNewScore(rep.score, -30);
        rep.flaggedProducts += 1;
        rep.level = _calculateTrustLevel(rep.score);
        rep.lastUpdated = block.timestamp;

        emit ReputationUpdated(_stakeholder, rep.score, rep.level);
        emit TrustLevelChanged(_stakeholder, oldLevel, rep.level);
    }

    function _calculateNewScore(uint256 current, int256 change) internal pure returns (uint256) {
        if (change > 0) {
            return current + uint256(change) > 100 ? 100 : current + uint256(change);
        } else {
            return current < uint256(-change) ? 0 : current - uint256(-change);
        }
    }

    function _calculateTrustLevel(uint256 score) internal pure returns (TrustLevel) {
        if (score >= PREMIUM_THRESHOLD) return TrustLevel.PREMIUM;
        if (score >= VERIFIED_THRESHOLD) return TrustLevel.VERIFIED_PARTNER;
        if (score >= TRUSTED_THRESHOLD) return TrustLevel.TRUSTED;
        if (score >= BASIC_THRESHOLD) return TrustLevel.BASIC;
        return TrustLevel.NEW;
    }

    function getStakingMultiplier(address _stakeholder) external view returns (uint256) {
        TrustLevel level = reputations[_stakeholder].level;
        if (level == TrustLevel.PREMIUM) return 50;        // 50% of required stake
        if (level == TrustLevel.VERIFIED_PARTNER) return 75; // 75%
        return 100;                                         // full price
    }

    function authorizeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
    }

    function getReputation(address _stakeholder) external view returns (
        uint256 score,
        TrustLevel level,
        uint256 successfulProducts,
        uint256 flaggedProducts,
        uint256 lastUpdated
    ) {
        Reputation memory rep = reputations[_stakeholder];
        return (rep.score, rep.level, rep.successfulProducts, rep.flaggedProducts, rep.lastUpdated);
    }
}