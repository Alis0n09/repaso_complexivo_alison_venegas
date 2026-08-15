import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { listAirlinesApi } from "../api/airlines.api";
import { createFlightEventApi, deleteFlightEventApi, listFlightEventsApi } from "../api/flightEvents.api";
import { listFlightsApi } from "../api/flights.api";

import RadioGroup from "@/components/RadioGroup";
import type { Airline } from "../types/airline";
import { toArray } from "../types/drf";
import type { Flight } from "../types/flight";
import type { FlightEvent } from "../types/flightEvent";


function serviceTypeLabel(st: Airline): string {
  return st.name;
}

function parseOptionalNumber(input: string): { value?: number; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { value: undefined };
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) return { error: "Cost debe ser numérico" };
  return { value: parsed };
}

export default function FlightEventsScreen() {
  const [flight_events, setFlightEvents] = useState<FlightEvent[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [costInput, setCostInput] = useState("");

  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null);

  const [event_type, setEventType] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadAll = async (): Promise<void> => {
    try {
      setErrorMessage("");

      const [flight_eventsData, flightsData, airlinesData] = await Promise.all([
        listFlightEventsApi(),
        listFlightsApi(),
        listAirlinesApi(),
      ]);

      const flight_eventsList = toArray(flight_eventsData);
      const flightsList = toArray(flightsData);
      const airlinesList = toArray(airlinesData);

      setFlightEvents(flight_eventsList);
      setFlights(flightsList);
      setAirlines(airlinesList);

      if (selectedFlightId === null && flightsList.length) setSelectedFlightId(flightsList[0].id);
    } catch {
      setErrorMessage("No se pudo cargar info. ¿Token? ¿baseURL? ¿backend encendido?");
    }
  };

  useEffect(() => { loadAll(); }, []);

  const createService = async (): Promise<void> => {
    try {
      setErrorMessage("");

      if (selectedFlightId === null) return setErrorMessage("Seleccione un vehículo");

      const trimmedNote = note.trim() ? note.trim() : undefined;
      const { value: parsedCost, error } = parseOptionalNumber(costInput);
      if (error) return setErrorMessage(error);

      // NO enviar fecha, backend la toma actual
      const created = await createFlightEventApi({
        flight_id: selectedFlightId,
        event_type: event_type,
        source: source,
        note: trimmedNote,
      });

      setFlightEvents((prev) => [created, ...prev]);
      setEventType("");
      setSource("");
      setNote("");
      setCostInput("");
    } catch {
      setErrorMessage("No se pudo crear flight event");
    }
  };

  const removeService = async (id: string): Promise<void> => {
    try {
      setErrorMessage("");
      await deleteFlightEventApi(id);
      setFlightEvents((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setErrorMessage("No se pudo eliminar flight event");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={flight_events}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Flight Events</Text>
            {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

            <Text style={styles.label}>Vuelo</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={selectedFlightId ?? ""}
                onValueChange={(value) => setSelectedFlightId(Number(value))}
                dropdownIconColor="#58a6ff"
                style={styles.picker}
              >
                {flights.map((v) => (
                  <Picker.Item key={v.id} label={v.flight_number} value={v.id} />
                ))}
              </Picker>
            </View>

            <RadioGroup
              label="Tipo de evento"
              value={event_type}
              onChange={setEventType}
              options={[
                { label: "Creado", value: "CREATED" },
                { label: "Abordo empezado", value: "BOARDING_STARTED" },
                { label: "Salido", value: "DEPARTED" },
                { label: "Demorado", value: "DELAYED" },
                { label: "Cancelado", value: "CANCELLED" },
              ]}
            />

            <RadioGroup
              label="Recurso"
              value={source}
              onChange={setSource}
              options={[
                { label: "Web", value: "WEB" },
                { label: "Mobile", value: "MOBILE" },
                { label: "System", value: "SYSTEM" },
              ]}
            />

            <Text style={styles.label}>Notas</Text>
            <TextInput
              placeholder="40"
              placeholderTextColor="#8b949e"
              value={note}
              onChangeText={setNote}
              style={styles.input}
            />

            <Pressable onPress={createService} style={[styles.btn, { marginBottom: 12 }]}>
              <Text style={styles.btnText}>Crear (sin enviar fecha)</Text>
            </Pressable>

            <Pressable onPress={loadAll} style={[styles.btn, { marginBottom: 12 }]}>
              <Text style={styles.btnText}>Refrescar</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.rowText} numberOfLines={1}>Vuelo ID: {item.flight_id}</Text>
              <Text style={styles.rowSub} numberOfLines={1}>Tipo de servicio: {item.event_type}</Text>
              {item.source !== undefined && <Text style={styles.rowSub} numberOfLines={1}>Recurso {item.source}</Text>}
              {!!item.note && <Text style={styles.rowSub} numberOfLines={1}>Notas: {item.note}</Text>}
              {!!item.created_at && <Text style={styles.rowSub} numberOfLines={1}>Fecha: {item.created_at}</Text>}
            </View>

            <Pressable onPress={() => removeService(item.id)}>
              <Text style={styles.del}>Eliminar</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117", padding: 16 },
  title: { color: "#58a6ff", fontSize: 22, fontWeight: "800", marginBottom: 10 },
  error: { color: "#ff7b72", marginBottom: 10 },
  label: { color: "#8b949e", marginBottom: 6, marginTop: 6 },

  pickerWrap: {
    backgroundColor: "#161b22",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#30363d",
    marginBottom: 10,
    overflow: "hidden",
  },
  picker: { color: "#c9d1d9" },

  input: {
    backgroundColor: "#161b22",
    color: "#c9d1d9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#30363d",
  },

  btn: { backgroundColor: "#21262d", borderColor: "#58a6ff", borderWidth: 1, padding: 12, borderRadius: 8 },
  btnText: { color: "#58a6ff", textAlign: "center", fontWeight: "700" },
  list: { flex: 1 },

  row: {
    backgroundColor: "#161b22",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  rowText: { color: "#c9d1d9", fontWeight: "800" },
  rowSub: { color: "#8b949e", marginTop: 2 },
  del: { color: "#ff7b72", fontWeight: "800" },
});