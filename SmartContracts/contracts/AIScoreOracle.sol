// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol"; // CHANGED: Use non-upgradeable ECDSA
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

interface ITrustStakingOracleReceiver {
    function updateTrustScore(
        string calldata productId,
        uint256 trustScore,
        bytes32 anomaliesHash,
        bytes32 verificationHash
    ) external;
}

interface ITrustStakingDKG {
        function verifyDKGAsset(string memory _productId) external view returns (bool);
        function getDKGData(string memory _productId) external view returns (string memory, string memory, bool, uint256);
    }

contract AIScoreOracle is Initializable, EIP712Upgradeable, UUPSUpgradeable, OwnableUpgradeable {
    using ECDSA for bytes32; // ADDED: Using directive for ECDSA

    string private constant _NAME = "AIScoreOracle";
    string private constant _VERSION = "1";

    // EIP-712 typehash: avoid dynamic arrays, use hashes
    bytes32 private constant REPORT_TYPEHASH = keccak256(
        "ReportTrustScore(string productId,uint256 trustScore,bytes32 anomaliesHash,bytes32 verificationHash,uint256 deadline)"
    );

    struct VerificationResult {
        string productId;
        uint256 trustScore;
        bytes32 anomaliesHash;
        bytes32 verificationHash;
        uint256 timestamp;
        address verifiedBy;
    }

    address public trustStakingContract;

    mapping(address => bool) public authorizedAI;
    mapping(address => uint256) public aiPerformance;
    mapping(string => VerificationResult) public verifications;

    event TrustScoreReported(string indexed productId, uint256 trustScore, address indexed aiAgent);
    event AIAuthorized(address indexed aiAgent);
    event AIRevoked(address indexed aiAgent);

    modifier onlyAuthorizedAI() {
        require(authorizedAI[msg.sender], "Not authorized AI");
        _;
    }

    

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _trustStaking, address _owner) public initializer {
        __EIP712_init(_NAME, _VERSION);
        __UUPSUpgradeable_init();
        __Ownable_init(_owner);
        trustStakingContract = _trustStaking;
        authorizedAI[_owner] = true;
        aiPerformance[_owner] = 100;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function authorizeAI(address _aiAgent) external onlyOwner {
        authorizedAI[_aiAgent] = true;
        if (aiPerformance[_aiAgent] == 0) {
            aiPerformance[_aiAgent] = 100;
        }
        emit AIAuthorized(_aiAgent);
    }

    function revokeAI(address _aiAgent) external onlyOwner {
        authorizedAI[_aiAgent] = false;
        emit AIRevoked(_aiAgent);
    }

    function reportTrustScore(
        string memory _productId,
        uint256 _trustScore,
        bytes32 _anomaliesHash,
        bytes32 _verificationHash,
        uint256 _deadline,
        bytes memory _signature
    ) external onlyAuthorizedAI {
        require(_trustScore <= 100, "Score > 100");
        require(block.timestamp <= _deadline, "Signature expired");
        require(trustStakingContract != address(0), "TrustStaking contract not set");
        
        bool dkgVerified = ITrustStakingDKG(trustStakingContract).verifyDKGAsset(_productId);
        require(dkgVerified, "Product not verified in DKG");

        bytes32 structHash = keccak256(abi.encode(
            REPORT_TYPEHASH,
            keccak256(bytes(_productId)),
            _trustScore,
            _anomaliesHash,
            _verificationHash,
            _deadline
        ));

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(_signature); // CHANGED: Use ECDSA.recover from using directive
        require(authorizedAI[signer], "Invalid AI signature");

        verifications[_productId] = VerificationResult({
            productId: _productId,
            trustScore: _trustScore,
            anomaliesHash: _anomaliesHash,
            verificationHash: _verificationHash,
            timestamp: block.timestamp,
            verifiedBy: signer
        });

        ITrustStakingOracleReceiver(trustStakingContract).updateTrustScore(
            _productId,
            _trustScore,
            _anomaliesHash,
            _verificationHash
        );

        // Reward good AI
        if (_anomaliesHash == bytes32(0) && _trustScore >= 90) {
            uint256 next = aiPerformance[signer] + 2;
            aiPerformance[signer] = next > 200 ? 200 : next;
        }

        emit TrustScoreReported(_productId, _trustScore, signer);
    }

    function getVerification(string memory _productId) external view returns (
        uint256 trustScore,
        bytes32 anomaliesHash,
        bytes32 verificationHash,
        uint256 timestamp,
        address verifiedBy
    ) {
        VerificationResult memory result = verifications[_productId];
        return (
            result.trustScore,
            result.anomaliesHash,
            result.verificationHash,
            result.timestamp,
            result.verifiedBy
        );
    }

    function getAIPerformance(address _aiAgent) external view returns (uint256) {
        return aiPerformance[_aiAgent];
    }
}