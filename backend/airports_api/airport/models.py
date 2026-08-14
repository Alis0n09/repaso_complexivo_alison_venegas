from django.db import models

class Gate(models.Model):                                   # MARCA = GATE
    code = models.CharField(max_length=10, unique=True, null =False)
    terminal = models.CharField(max_length=20, unique=True, null =False)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code

class Flight(models.Model):                               # VEHICULO = FLIGHT
    gate = models.ForeignKey(Gate, on_delete=models.PROTECT, related_name="flights")
    flight_number = models.CharField(max_length=20, null =False)
    destination = models.CharField(max_length=100, null =False)
    departure_time = models.DateTimeField(null=False, blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Programado"
        BOARDING = "BOARDING", "Embarquado"
        DEPARTED = "DEPARTED", "Salido"
        DELAYED = "DELAYED", "Demorado"
        CANCELLED = "CANCELLED", "Cancelado"

    status = models.CharField(max_length=20,choices=Status.choices,)

    def __str__(self):
        return f"{self.gate.code} {self.flight_number} ({self.destination}) {self.status} {self.departure_time} {self.created_at}"