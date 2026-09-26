from .hazard_graph import HazardGraph


def default_dependency_graph() -> HazardGraph:
    graph = HazardGraph()
    graph.add_dependency("flood", "road-network")
    graph.add_dependency("road-network", "hospital-access")
    graph.add_dependency("road-network", "shelter-access")
    return graph
