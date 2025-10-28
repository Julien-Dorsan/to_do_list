import pytest
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from categories.models import Category


@pytest.mark.django_db
def test_create_category():
    """Tests category createion"""
    cat = Category.objects.create(
        name = "Category",
        description = "I am a category",
        color = "#FF5733"
    )
    assert cat.id is not None
    assert cat.name == "Category"
    assert cat.color == "#FF5733"
    assert isinstance(str(cat), str)
    assert str(cat) == "Category"

@pytest.mark.django_db
def test_unique_name_constraint():
    """tests that categories names are unique"""
    Category.objects.create(
        name = "duplicate",
        description = "Physical activities",
        color = "#00FF00"
        )

    with pytest.raises(IntegrityError):
        Category.objects.create(
            name = "duplicate",
            description = "Duplicate name",
            color = "#0000FF"
            )

@pytest.mark.django_db
def test_missing_required_fields():
    """Tests that a category without name can't be created"""
    cat = Category(
        description = "Missing name field",
        color = "#AAAAAA"
        )
    with pytest.raises(ValidationError):
        cat.full_clean()

@pytest.mark.django_db
def test_name_too_long():
    """Tests category's invalid name"""
    cat = Category(
        name = "n" * 100,
        description = "Name too long",
        color = "#123456"
        )
    with pytest.raises(ValidationError):
        cat.full_clean()

@pytest.mark.django_db
def test_invalid_color_code():
    """Tests that color format is only hexadecimal"""
    with pytest.raises(ValidationError):
        cat = Category(
            name = "InvalidColor",
            description = "Bad color format",
            color = "red"
            )
        cat.full_clean()