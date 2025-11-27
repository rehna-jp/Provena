# DKG Integration Service Stubs

def publish_product_asset(product_json):
    """
    Publishes a product asset to the DKG system.
    In a real implementation, this would send product_json to the DKG and return the resulting UAL.
    Here, we mock the behavior by returning a dummy UAL.
    """
    # MOCK: Simulate publishing to DKG and generating a UAL
    import uuid
    ual = f"dkg:asset:{uuid.uuid4()}"
    return {"ual": ual}

def append_event_to_asset(ual, event_json):
    """
    Appends an event to an existing DKG asset identified by UAL.
    In a real implementation, this would send event_json to the DKG for the given UAL.
    Here, we mock the behavior by always returning success.
    """
    # MOCK: Simulate appending event to DKG asset
    return {"status": "success"}

def query_asset(ual):
    """
    Queries a DKG asset by its UAL.
    In a real implementation, this would fetch asset data from the DKG.
    Here, we mock the behavior by returning a dummy asset.
    """
    # MOCK: Simulate querying DKG asset
    dummy_asset = {
        "ual": ual,
        "data": {"info": "This is a mock DKG asset."}
    }
    return {"asset": dummy_asset}

def search_assets(query_params):
    """
    Searches for DKG assets matching the given query parameters.
    In a real implementation, this would query the DKG with the provided parameters.
    Here, we mock the behavior by returning a list of dummy assets.
    """
    # MOCK: Simulate searching DKG assets
    results = [
        {"ual": f"dkg:asset:mock-{i}", "data": {"info": f"Mock asset {i}"}} for i in range(1, 4)
    ]
    return {"results": results}
