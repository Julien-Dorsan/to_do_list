import pytest
from lists.models import List
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError

@pytest.mark.django_db
def test_list_creation(todo_list):
    """Ensures the list has been properly created"""
    assert todo_list.id is not None
    assert todo_list.name == "Test list"
    assert todo_list.priority == 2
    assert isinstance(str(todo_list), str)

@pytest.mark.django_db
def test_default_values():
    """Ensures default values are properly initialized"""
    lst = List.objects.create(
        public_token="token123",
        name="Another List",
        description="Testing defaults"
    )
    assert lst.priority == 3
    assert lst.created_at is not None
    assert lst.updated_at is not None
    
@pytest.mark.django_db
def test_invalid_name():
    """Ensures invalid values raise an error"""
    lst = List(
        public_token = "hashed_token_",
        name = "n" * 100,
        description = "too long name"
        )
    with pytest.raises(ValidationError):
        lst.full_clean()

@pytest.mark.django_db
def test_missing_required_fields():
    """Ensures an incomplete query raises an error"""
    lst = List(
        description = "No list name provided"
        )
    with pytest.raises(ValidationError):
        lst.full_clean()


@pytest.mark.django_db
def test_duplicate_fields():
    """Ensures a second list with duplicate unique fields cannot be created"""
    List.objects.create(
        public_token = "hashed_token_123",
        name = "duplicate list",
        description = "test description",
        priority = 2
    )

    with pytest.raises(IntegrityError):
        List.objects.create(
            public_token="hashed_token_123",
            name="another list",
            description="duplicate test",
        )