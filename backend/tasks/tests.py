import pytest
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from datetime import datetime, timezone
from tasks.models import Task

@pytest.mark.django_db
def test_task_creation(task):
    """Ensure a task is properly created"""
    assert task.id is not None
    assert task.name == "Test Task"
    assert task.list.name == "Test list"
    assert task.done is False
    assert isinstance(str(task), str)
    assert str(task) == "Test Task"


@pytest.mark.django_db
def test_default_values(todo_list):
    """Checks that default values are properly initialized"""
    tsk  =  Task.objects.create(
        name = "Default Task",
        description = "Defaults test",
        due_at = datetime(2026, 1, 1, tzinfo = timezone.utc),
        list = todo_list
    )
    assert tsk.level == 0
    assert tsk.priority == 3
    assert tsk.done is False


@pytest.mark.django_db
def test_duplicate_fields(todo_list):
    """Ensuresz duplicate unique values raise an error"""
    Task.objects.create(
        name = "Duplicate",
        description = "First task",
        due_at = datetime(2026, 1, 1, tzinfo = timezone.utc),
        list = todo_list
    )
    with pytest.raises(IntegrityError):
        Task.objects.create(
            name = "Duplicate",
            description = "Second task",
            due_at = datetime(2026, 1, 2, tzinfo = timezone.utc),
            list = todo_list
        )

@pytest.mark.django_db
def test_missing_required_fields(todo_list):
    """Ensures the task is not created with missing non null fields"""
    tsk = Task(list = todo_list)
    with pytest.raises(ValidationError):
        tsk.full_clean()


@pytest.mark.django_db
def test_invalid_name(todo_list):
    """Ensures a name too loong raise an error"""
    tsk = Task(
        name = "x" * 100,
        description = "Too long name",
        due_at = datetime(2026, 1, 1, tzinfo = timezone.utc),
        list = todo_list,
    )
    with pytest.raises(ValidationError):
        tsk.full_clean()


@pytest.mark.django_db
def test_parent_child_relationship(todo_list):
    """Ensures parent taks can have a sub task"""
    parent = Task.objects.create(
        name = "Parent Task",
        description = "Parent task",
        due_at = datetime(2026, 1, 1, tzinfo = timezone.utc),
        list = todo_list
    )
    child  =  Task.objects.create(
        name = "Sub Task",
        description = "Chile task",
        level = 1,
        due_at = datetime(2026, 1, 2, tzinfo = timezone.utc),
        list = todo_list,
        parent = parent
    )
    assert child.parent == parent
    assert parent.subtasks.count() == 1
    assert parent.subtasks.first().name == "Sub Task"

@pytest.mark.django_db
def test_task_creation_with_category(todo_list, category):
    """Ensure a task is properly created"""
    tsk  =  Task.objects.create(
        name = "Default Task",
        description = "Defaults test",
        due_at = datetime(2026, 1, 1, tzinfo = timezone.utc),
        list = todo_list
    )
    tsk.categories.add(category)
    assert tsk.name == "Default Task"
    assert tsk.categories.first().name == "Test Category"
