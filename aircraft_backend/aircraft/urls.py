from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("aircraft/<str:n_number>/", views.get_aircraft_by_tail, name="get_aircraft_by_tail"),
    path("search/", views.universal_search, name="universal_search"),
    path("search/typed/", views.search_aircraft, name="search_aircraft"),
    path("analytics/", views.analytics_dashboard, name="analytics_dashboard"),
]