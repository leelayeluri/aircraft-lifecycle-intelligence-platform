from django.urls import path

from .views import get_aircraft_by_tail, search_aircraft, universal_search

urlpatterns = [
    path('aircraft/<str:n_number>/', get_aircraft_by_tail),
    path('search/', search_aircraft),
    path('search/all/', universal_search),
]