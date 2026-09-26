from dataclasses import dataclass, field


@dataclass
class HazardGraph:
    edges: dict[str, set[str]] = field(default_factory=dict)

    def add_dependency(self, source: str, target: str) -> None:
        self.edges.setdefault(source, set()).add(target)

    def downstream(self, source: str) -> set[str]:
        visited: set[str] = set()
        pending = [source]
        while pending:
            node = pending.pop()
            for target in self.edges.get(node, set()):
                if target not in visited:
                    visited.add(target)
                    pending.append(target)
        return visited
