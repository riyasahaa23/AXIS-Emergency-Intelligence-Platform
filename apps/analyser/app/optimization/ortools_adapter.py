from app.models.resource import Resource, ResourceAllocation

from .allocation import allocate


def optimize(resources: list[Resource], requests: dict[str, int]) -> list[ResourceAllocation]:
    """Use OR-Tools when installed; otherwise retain the safe greedy fallback."""
    try:
        from ortools.linear_solver import pywraplp  # type: ignore[import-not-found]
    except ImportError:
        return allocate(resources, requests)

    solver = pywraplp.Solver.CreateSolver("SCIP")
    if solver is None:
        return allocate(resources, requests)
    variables = {
        resource.id: solver.IntVar(0, resource.available, resource.id)
        for resource in resources
    }
    for resource in resources:
        solver.Add(variables[resource.id] <= requests.get(resource.kind, 0))
    solver.Maximize(solver.Sum(variables.values()))
    solver.Solve()
    return [
        ResourceAllocation(
            resource_id=resource.id,
            requested=max(0, requests.get(resource.kind, 0)),
            allocated=int(variables[resource.id].solution_value()),
            unmet=max(0, requests.get(resource.kind, 0) - int(variables[resource.id].solution_value())),
        )
        for resource in resources
    ]
