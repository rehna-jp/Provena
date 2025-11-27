// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockDKG
 * @dev Mock DKG (Decentralized Knowledge Graph) contract for testing
 * @notice This simulates the DKG node functionality until your teammate's integration is ready
 * @dev In production, this will be replaced by actual OriginTrail DKG integration
 */
contract MockDKG {
    struct KnowledgeAsset {
        string ual;              // Universal Asset Locator
        string jsonLDHash;       // Hash of JSON-LD knowledge graph data
        address creator;
        uint256 timestamp;
        bool exists;
    }

    // productId => KnowledgeAsset
    mapping(string => KnowledgeAsset) public knowledgeAssets;
    
    // Track all created UALs
    string[] public allUALs;
    
    // Events
    event KnowledgeAssetCreated(
        string indexed productId,
        string ual,
        string jsonLDHash,
        address indexed creator,
        uint256 timestamp
    );
    
    event KnowledgeAssetUpdated(
        string indexed productId,
        string newJsonLDHash,
        uint256 timestamp
    );

    /**
     * @dev Create a new knowledge asset
     * @param _productId Unique product identifier
     * @param _jsonLD JSON-LD formatted data (as string)
     * @return ual The generated Universal Asset Locator
     */
    function createKnowledgeAsset(
        string memory _productId,
        string memory _jsonLD
    ) external returns (string memory ual) {
        require(!knowledgeAssets[_productId].exists, "Asset already exists");
        require(bytes(_productId).length > 0, "Empty product ID");
        require(bytes(_jsonLD).length > 0, "Empty JSON-LD");

        // Generate mock UAL (in production, this comes from OriginTrail DKG)
        ual = string(abi.encodePacked(
            "did:dkg:neuroweb:31337/0x",
            _toHexString(uint256(keccak256(abi.encodePacked(_productId, block.timestamp))))
        ));

        // Generate hash of JSON-LD data
        string memory jsonLDHash = _toHexString(uint256(keccak256(bytes(_jsonLD))));

        // Store knowledge asset
        knowledgeAssets[_productId] = KnowledgeAsset({
            ual: ual,
            jsonLDHash: jsonLDHash,
            creator: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        allUALs.push(ual);

        emit KnowledgeAssetCreated(_productId, ual, jsonLDHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Update existing knowledge asset with new data
     * @param _productId Product to update
     * @param _newJsonLD Updated JSON-LD data
     */
    function updateKnowledgeAsset(
        string memory _productId,
        string memory _newJsonLD
    ) external {
        require(knowledgeAssets[_productId].exists, "Asset does not exist");
        require(bytes(_newJsonLD).length > 0, "Empty JSON-LD");

        string memory newHash = _toHexString(uint256(keccak256(bytes(_newJsonLD))));
        knowledgeAssets[_productId].jsonLDHash = newHash;

        emit KnowledgeAssetUpdated(_productId, newHash, block.timestamp);
    }

    /**
     * @dev Get knowledge asset by product ID
     */
    function getKnowledgeAsset(string memory _productId) 
        external 
        view 
        returns (
            string memory ual,
            string memory jsonLDHash,
            address creator,
            uint256 timestamp,
            bool exists
        ) 
    {
        KnowledgeAsset memory asset = knowledgeAssets[_productId];
        return (
            asset.ual,
            asset.jsonLDHash,
            asset.creator,
            asset.timestamp,
            asset.exists
        );
    }

    /**
     * @dev Check if knowledge asset exists
     */
    function assetExists(string memory _productId) external view returns (bool) {
        return knowledgeAssets[_productId].exists;
    }

    /**
     * @dev Get UAL for a product
     */
    function getUAL(string memory _productId) external view returns (string memory) {
        require(knowledgeAssets[_productId].exists, "Asset does not exist");
        return knowledgeAssets[_productId].ual;
    }

    /**
     * @dev Get JSON-LD hash for a product
     */
    function getJsonLDHash(string memory _productId) external view returns (string memory) {
        require(knowledgeAssets[_productId].exists, "Asset does not exist");
        return knowledgeAssets[_productId].jsonLDHash;
    }

    /**
     * @dev Get total number of knowledge assets
     */
    function getTotalAssets() external view returns (uint256) {
        return allUALs.length;
    }

    /**
     * @dev Internal helper to convert uint256 to hex string
     */
    function _toHexString(uint256 value) internal pure returns (string memory) {
        bytes memory buffer = new bytes(64);
        for (uint256 i = 63; i >= 0 && i < 64; i--) {
            buffer[i] = _toHexChar(uint8(value & 0xf));
            value >>= 4;
            if (value == 0 && i == 0) break;
        }
        return string(buffer);
    }

    /**
     * @dev Internal helper to convert uint8 to hex char
     */
    function _toHexChar(uint8 value) internal pure returns (bytes1) {
        if (value < 10) {
            return bytes1(uint8(bytes1('0')) + value);
        } else {
            return bytes1(uint8(bytes1('a')) + value - 10);
        }
    }

    /**
     * @dev Helper function to create sample JSON-LD for testing
     * @param _productId Product ID
     * @param _productName Product name
     * @param _origin Origin location
     * @return Sample JSON-LD string
     */
    function generateSampleJsonLD(
        string memory _productId,
        string memory _productName,
        string memory _origin
    ) external view returns (string memory) {
        return string(abi.encodePacked(
            '{"@context":"https://schema.org/",',
            '"@type":"Product",',
            '"productID":"', _productId, '",',
            '"name":"', _productName, '",',
            '"origin":"', _origin, '",',
            '"timestamp":"', uint2str(block.timestamp), '"',
            '}'
        ));
    }

    /**
     * @dev Convert uint to string helper
     */
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}

/**
 * @title MockDKGIntegrationExample
 * @dev Example showing how to integrate MockDKG with TrustStaking
 */
contract MockDKGIntegrationExample {
    MockDKG public dkg;

    constructor(address _dkgAddress) {
        dkg = MockDKG(_dkgAddress);
    }

    /**
     * @dev Example: Create product in DKG and get UAL for staking
     */
    function createProductAndStake(
        string memory _productId,
        string memory _productName,
        string memory _origin
    ) external returns (string memory ual, string memory jsonLDHash) {
        // 1. Generate sample JSON-LD
        string memory jsonLD = dkg.generateSampleJsonLD(_productId, _productName, _origin);

        // 2. Create knowledge asset in DKG
        ual = dkg.createKnowledgeAsset(_productId, jsonLD);

        // 3. Get the hash
        jsonLDHash = dkg.getJsonLDHash(_productId);

        // 4. Now you can use ual and jsonLDHash to call TrustStaking.manufacturerStake()
        // trustStaking.manufacturerStake(_productId, amount, ual, jsonLDHash);
    }
}