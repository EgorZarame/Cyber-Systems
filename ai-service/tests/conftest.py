import pytest

from app.model import ErrorClassifier


@pytest.fixture(scope="session")
def classifier():
    return ErrorClassifier().train()
