from pathlib import Path
from uuid import uuid4

from app.config import settings


class LocalStorage:
    def __init__(self, base_path: str | Path | None = None) -> None:
        configured_path = base_path or settings.storage_path

        configured = Path(configured_path)
        if not configured.is_absolute():
            configured = Path(__file__).resolve().parents[3] / configured
        self.base_path = configured.resolve()

        self.directories = {
            "uploads": self.base_path / "uploads",
            "extracted": self.base_path / "extracted",
            "evidence": self.base_path / "evidence",
            "reports": self.base_path / "reports",
            "temporary": self.base_path / "temporary",
        }

        for directory in self.directories.values():
            directory.mkdir(parents=True, exist_ok=True)

    def save_bytes(
        self,
        data: bytes,
        category: str,
        filename: str,
    ) -> str:
        if category not in self.directories:
            raise ValueError(f"Unsupported storage category: {category}")

        safe_filename = Path(filename).name

        destination = (
            self.directories[category]
            / f"{uuid4().hex}_{safe_filename}"
        )

        destination.write_bytes(data)

        return str(destination.relative_to(self.base_path))

    def read_bytes(self, relative_path: str) -> bytes:
        path = self._resolve_path(relative_path)
        return path.read_bytes()

    def exists(self, relative_path: str) -> bool:
        path = self._resolve_path(relative_path)
        return path.is_file()

    def delete(self, relative_path: str) -> None:
        path = self._resolve_path(relative_path)

        if path.is_file():
            path.unlink()

    def resolve_path(self, relative_path: str) -> Path:
        return self._resolve_path(relative_path)

    def _resolve_path(self, relative_path: str) -> Path:
        path = (self.base_path / relative_path).resolve()

        if self.base_path not in path.parents:
            raise ValueError("Invalid storage path")

        return path
