from django.db.models import Q, Count
from django.shortcuts import render

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import AircraftSearch
from .serializers import AircraftSearchSerializer


def home(request):
    return render(request, "aircraft/home.html")


@api_view(["GET"])
def get_aircraft_by_tail(request, n_number):
    aircraft = AircraftSearch.objects.filter(
        n_number__iexact=n_number
    ).first()

    if aircraft is None:
        return Response(
            {"error": "Aircraft not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = AircraftSearchSerializer(aircraft)
    return Response(serializer.data)


@api_view(["GET"])
def search_aircraft(request):
    search_type = request.GET.get("type")
    query = request.GET.get("q")

    if not search_type or not query:
        return Response(
            {"error": "Please provide type and q"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if search_type == "owner":
        results = AircraftSearch.objects.filter(owner_name__icontains=query)[:20]

    elif search_type == "manufacturer":
        results = AircraftSearch.objects.filter(
            aircraft_manufacturer__icontains=query
        )[:20]

    elif search_type == "model":
        results = AircraftSearch.objects.filter(aircraft_model__icontains=query)[:20]

    else:
        return Response(
            {"error": "Invalid type. Use owner, manufacturer, or model"},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = AircraftSearchSerializer(results, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def universal_search(request):
    query = request.GET.get("q")

    if not query:
        return Response(
            {"error": "Please provide search query using ?q="},
            status=status.HTTP_400_BAD_REQUEST
        )

    exact_match = AircraftSearch.objects.filter(n_number__iexact=query)

    if exact_match.exists():
        serializer = AircraftSearchSerializer(exact_match, many=True)
        return Response({
            "query": query,
            "search_type": "exact_tail_number",
            "count": len(serializer.data),
            "results": serializer.data
        })

    results = AircraftSearch.objects.filter(
        Q(n_number__icontains=query) |
        Q(owner_name__icontains=query) |
        Q(aircraft_manufacturer__icontains=query) |
        Q(aircraft_model__icontains=query)
    )[:50]

    serializer = AircraftSearchSerializer(results, many=True)

    return Response({
        "query": query,
        "search_type": "universal",
        "count": len(serializer.data),
        "results": serializer.data
    })


@api_view(["GET"])
def analytics_dashboard(request):
    total_aircraft = AircraftSearch.objects.count()

    top_manufacturers = (
        AircraftSearch.objects
        .exclude(aircraft_manufacturer__isnull=True)
        .exclude(aircraft_manufacturer__exact="")
        .values("aircraft_manufacturer")
        .annotate(value=Count("aircraft_manufacturer"))
        .order_by("-value")[:10]
    )

    top_models = (
        AircraftSearch.objects
        .exclude(aircraft_model__isnull=True)
        .exclude(aircraft_model__exact="")
        .values("aircraft_model")
        .annotate(value=Count("aircraft_model"))
        .order_by("-value")[:10]
    )

    top_owners = (
        AircraftSearch.objects
        .exclude(owner_name__isnull=True)
        .exclude(owner_name__exact="")
        .values("owner_name")
        .annotate(value=Count("owner_name"))
        .order_by("-value")[:10]
    )

    return Response({
        "source": "FAA Aircraft Registry imported into PostgreSQL",
        "accuracy_note": "These charts use only real records currently stored in the PostgreSQL aircraft_search table. Flight hours, distance, and maintenance values are not included because they are not available in the FAA registry dataset.",
        "total_aircraft": total_aircraft,
        "top_manufacturers": [
            {
                "name": item["aircraft_manufacturer"].strip(),
                "value": item["value"]
            }
            for item in top_manufacturers
        ],
        "top_models": [
            {
                "name": item["aircraft_model"].strip(),
                "value": item["value"]
            }
            for item in top_models
        ],
        "top_owners": [
            {
                "name": item["owner_name"].strip(),
                "value": item["value"]
            }
            for item in top_owners
        ],
    })