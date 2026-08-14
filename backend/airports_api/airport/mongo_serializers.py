from rest_framework import serializers

class AirlineSerializer(serializers.Serializer):                            # ServiceType = airline
    name = serializers.CharField(max_length=120)
    code = serializers.CharField(max_length=100)
    country = serializers.CharField(max_length=100)
    is_active = serializers.BooleanField(default=True)
    created_at = serializers.DateTimeField(required=False)

class EventType:
    CREATED = "CREATED"
    BOARDING_STARTED = "BOARDING_STARTED"
    DEPARTED = "DEPARTED"
    DELAYED = "DELAYED"
    CANCELLED = "CANCELLED"

    CHOICES = [
        (CREATED, "Creado"),
        (BOARDING_STARTED, "Abordo empezado"),
        (DEPARTED, "Salido"),
        (DELAYED, "Demorado"),
        (CANCELLED, "Cancelado"),
    ]

class Source:
    WEB = "WEB"
    MOBILE = "MOBILE"
    SYSTEM = "SYSTEM"

    CHOICES = [
        (WEB, "Web"),
        (MOBILE, "Mobile"),
        (SYSTEM, "System"),
    ]

class FlightEventSerializer(serializers.Serializer):                       #  VehicleService = flight_events 
    flight_id = serializers.IntegerField()        # ID de Vuelo (Postgres)
    event_type = serializers.ChoiceField(choices=EventType.CHOICES)    
    source = serializers.ChoiceField(choices=Source.CHOICES)     
    note = serializers.CharField(max_length=120)
    created_at = serializers.DateTimeField(required=False)
    