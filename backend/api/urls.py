from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ListViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r"tasks", TaskViewSet)
router.register(r"lists", ListViewSet)
router.register(r"categories", CategoryViewSet)
urlpatterns = router.urls
