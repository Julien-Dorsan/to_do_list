import pytest
from rest_framework.test import APIClient
from datetime import datetime, timezone
from lists.models import List
from tasks.models import Task

@pytest.fixture
def todo_list():
    """creates a list

    Returns:
        List: a test list
    """
    return List.objects.create(
        public_token = "hashed_token",
        name = "Test list",
        description = "test description",
        priority = 2
    )
    
@pytest.fixture
def task(todo_list):
    """creates a test task

    Args:
        todo_list (List): a test list

    Returns:
        Task: a test task
    """
    return Task.objects.create(
        name = "Test Task",
        description = "Testing task creation",
        level = 1,
        priority = 2,
        due_at = datetime(2026, 1, 1, tzinfo = timezone.utc),
        list = todo_list
    )
    
@pytest.fixture
def api_client():
    """creates a test api client

    Returns:
        APIClient: an api client for http(s) requests
    """
    return APIClient()