from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ListViewSet

router = DefaultRouter()
router.register(r"tasks", TaskViewSet)
router.register(r"lists", ListViewSet)
urlpatterns = router.urls
