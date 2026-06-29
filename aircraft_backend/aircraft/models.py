from django.db import models


class AircraftSearch(models.Model):
    n_number = models.CharField(max_length=20, primary_key=True)
    owner_name = models.TextField(null=True, blank=True)
    aircraft_manufacturer = models.TextField(null=True, blank=True)
    aircraft_model = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "aircraft_search"

    def __str__(self):
        return self.n_number