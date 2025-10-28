import pytest
from lists.models import List
from tasks.models import Task
from datetime import datetime, timezone

### TASKS ###

@pytest.mark.django_db
def test_list_tasks(api_client, todo_list):
    """Tests tasks are properly retrieved

    Args:
        api_client (APIClient): simulates http request
        todo_list (List): a test list
    """
    Task.objects.create(
        name = "Task One",
        description = "API Test",
        priority = 1,
        due_at = datetime(2026, 1, 1, tzinfo=timezone.utc),
        list = todo_list
    )
    
    response = api_client.get("/api/tasks/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Task One"
    
@pytest.mark.django_db
def test_create_task(api_client, todo_list):
    """Tests task are properly created

    Args:
        api_client (APIClient): simulates http request
        todo_list (List): a test list
    """
    payload = {
        "name" : "Created via API",
        "description" : "Task created through API",
        "priority": 2,
        "due_at": "2026-01-01T00:00:00Z",
        "list": todo_list.id
    }

    response = api_client.post("/api/tasks/", payload, format="json")

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Created via API"
    assert Task.objects.count() == 1

@pytest.mark.django_db
def test_retrieve_task(api_client, todo_list):
    """tests one task is properly retrieved

    Args:
        api_client (APIClient): simulates http request
        todo_list (List): a test list
    """
    task = Task.objects.create(
        name = "View Task",
        description = "Retrieve test",
        priority = 3,
        due_at = datetime(2026, 1, 1, tzinfo=timezone.utc),
        list = todo_list
    )
    response = api_client.get(f"/api/tasks/{task.id}/")
    assert response.status_code == 200
    assert response.json()["name"] == "View Task"

@pytest.mark.django_db
def test_update_task(api_client, todo_list):
    """tests tasks are properly updated

    Args:
        api_client (APIClient): simulates http request
        todo_list (List): a test list
    """
    task = Task.objects.create(
        name = "To Update",
        description = "Old desc",
        priority = 1,
        due_at = datetime(2026, 1, 1, tzinfo=timezone.utc),
        list = todo_list
    )
    
    payload = {"description": "Updated desc"}
    response = api_client.patch(f"/api/tasks/{task.id}/", payload, format="json")
    assert response.status_code == 200
    assert response.json()["description"] == "Updated desc"

@pytest.mark.django_db
def test_delete_task(api_client, todo_list):
    """tests tasks are properly deleted

    Args:
        api_client (APIClient): simulates http request
        todo_list (List): a test list
    """
    task = Task.objects.create(
        name = "To Delete",
        description = "Delete test",
        priority = 1,
        due_at = datetime(2026, 1, 1, tzinfo=timezone.utc),
        list = todo_list
    )
    
    response = api_client.delete(f"/api/tasks/{task.id}/")
    
    assert response.status_code == 204
    assert Task.objects.count() == 0

@pytest.mark.django_db
def test_invalid_task_creation(api_client, todo_list):
    """tests invalid task creation is impossible

    Args:
        api_client (APIClient): simulates http request
        todo_list (List): a test list
    """
    # no name
    payload = {
        "description" : "Task created through API",
        "priority": 2,
        "due_at": "2026-01-01T00:00:00Z",
        "list": todo_list.id
    }

    response = api_client.post("/api/tasks/", payload, format="json")
    assert response.status_code == 400
    assert "name" in response.json()

### LISTS ###

@pytest.mark.django_db
def test_list_creation(api_client):
    """test list creation

    Args:
        api_client (APIClient): simulates http request
    """
    payload = {
        "public_token": "hashed_token_123",
        "name": "My API List",
        "description": "A list created via API",
        "priority": 1
    }
    
    response = api_client.post("/api/lists/", payload, format="json")
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "My API List"
    assert List.objects.count() == 1

@pytest.mark.django_db
def test_list_listing(api_client):
    """tests lists are properly retrived

    Args:
        api_client (APIClient): simulates http request
    """
    List.objects.create(
        public_token="token1",
        name="First List",
        description="List 1 desc"
    )
    List.objects.create(
        public_token="token2",
        name="Second List",
        description="List 2 desc"
    )

    response = api_client.get("/api/lists/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] in ["First List", "Second List"]

@pytest.mark.django_db
def test_list_retrieve(api_client):
    """tests a single list is properly retrieved

    Args:
        api_client (APIClient): simulates http request
    """
    
    lst = List.objects.create(
        public_token = "tokenX",
        name = "Single List",
        description = "Retrieve test"
    )

    response = api_client.get(f"/api/lists/{lst.id}/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Single List"
    assert data["public_token"] == "tokenX"


@pytest.mark.django_db
def test_list_update(api_client):
    """tests lists are properly updated

    Args:
        api_client (APIClient): simulates http request
    """
    lst = List.objects.create(
        public_token = "tokenY",
        name = "Updatable List",
        description = "Before update"
    )

    payload = {"description": "Updated description"}
    response = api_client.patch(f"/api/lists/{lst.id}/", payload, format="json")
    assert response.status_code == 200
    assert response.json()["description"] == "Updated description"


@pytest.mark.django_db
def test_list_delete(api_client):
    """tests list are properly deleteed

    Args:
        api_client (APIClient): simulates http request
    """
    lst = List.objects.create(
        public_token = "tokenZ",
        name = "Delete Me",
        description = "Will be deleted"
    )

    response = api_client.delete(f"/api/lists/{lst.id}/")
    assert response.status_code == 204
    assert List.objects.count() == 0


@pytest.mark.django_db
def test_invalid_list_creation(api_client):
    """tests invalid list creation is impossible

    Args:
        api_client (APIClient): simulates http request
    """
    # no name
    payload = {
        "public_token": "no_name_token",
        "description": "Should fail",
    }

    response = api_client.post("/api/lists/", payload, format="json")
    assert response.status_code == 400
    assert "name" in response.json()