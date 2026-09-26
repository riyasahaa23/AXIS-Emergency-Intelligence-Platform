from app.models.resource import Resource, ResourceAllocation


def allocate(resources: list[Resource], requests: dict[str, int]) -> list[ResourceAllocation]:
    allocations: list[ResourceAllocation] = []
    for resource in resources:
        requested = max(0, requests.get(resource.kind, 0))
        allocated = min(resource.available, requested)
        allocations.append(ResourceAllocation(resource_id=resource.id, requested=requested, allocated=allocated, unmet=requested - allocated))
    return allocations
