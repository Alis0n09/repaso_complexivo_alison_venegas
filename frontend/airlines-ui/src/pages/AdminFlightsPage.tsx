import { useEffect, useState } from "react";
import {
  Container, Paper, Typography, TextField, Button, Stack,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Alert,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { type Gate, listGatesApi } from "../api/gates.api";
import { type Flight, listFlightsAdminApi, createFlightApi, updateFlightApi, deleteFlightApi } from "../api/flights.api";

export default function AdminFlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [error, setError] = useState("");

  const [editId, setEditId] = useState<number | null>(null);
  const [gate, setGate] = useState<number>(0);
  const [flight_number, setFlightNumber] = useState("");
  const [destination, setDestination] = useState("");
  const [departure_time, setDepartureTime] = useState("");
  const [status, setStatus] = useState("");
  const [color, setColor] = useState("");

  const load = async () => {
    try {
      setError("");
      const data = await listFlightsAdminApi();
      setFlights(data.results); // DRF paginado
    } catch {
      setError("No se pudo cargar vuelos. ¿Login? ¿Token admin?");
    }
  };

  const loadGates = async () => {
    try {
      const data = await listGatesApi();
      setGates(data.results); // DRF paginado
      if (!gate && data.results.length > 0) setGate(data.results[0].id);
    } catch {
      // si falla, no bloquea la pantalla
    }
  };

  useEffect(() => { load(); loadGates(); }, []);

  const save = async () => {
    try {
      setError("");
      if (!gate) return setError("Seleccione una puerta de embarque");
      if (!flight_number.trim() || !destination.trim()) return setError("Numero de vuelo y destino son requeridos");

      const payload = {
        gate: Number(gate),
        flight_number: flight_number.trim(),
        destination: destination.trim(),
        departure_time: departure_time,
        status: status,

      };

      if (editId) await updateFlightApi(editId, payload);
      else await createFlightApi(payload as any);

      setEditId(null);
      setFlightNumber("");
      setDestination("");
      setDepartureTime("");
      setStatus("")
      await load();
    } catch {
      setError("No se pudo guardar vuelos. ¿Token admin?");
    }
  };

  const startEdit = (f: Flight) => {
    setEditId(f.id);
    setGate(f.gate);
    setFlightNumber(f.flight_number);
    setDestination(f.destination);
    setDepartureTime(f.departure_time);
    setStatus(f.status)
  };

  const remove = async (id: number) => {
    try {
      setError("");
      await deleteFlightApi(id);
      await load();
    } catch {
      setError("No se pudo eliminar vuelo. ¿Token admin?");
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Admin Vuelos (Privado)</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2} sx={{ mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>

            <FormControl sx={{ width: 260 }}>
              <InputLabel id="gate-label">Gate</InputLabel>
              <Select
                labelId="gate-label"
                label="Gate"
                value={gate}
                onChange={(e) => setGate(Number(e.target.value))}
              >
                {gates.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.code} (#{m.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="Numero de Vuelo" value={flight_number} onChange={(e) => setFlightNumber(e.target.value)} fullWidth />
            <TextField label="Destino" value={destination} onChange={(e) => setDestination(e.target.value)} sx={{ width: 160 }} />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="hora de llegada" value={departure_time} onChange={(e) => setDepartureTime(e.target.value)} sx={{ width: 220 }} />
            <FormControl sx={{ width: 260 }}>
                <InputLabel id="status-label">Estado</InputLabel>
                <Select
                    labelId="status-label"
                    label="Estado"
                    value={status}
                    onChange={(e) => setStatus(String(e.target.value))}
                >
                    <MenuItem value="SCHEDULED">Programado</MenuItem>
                    <MenuItem value="BOARDING">Embarquado</MenuItem>
                    <MenuItem value="DEPARTED">Salido</MenuItem>
                    <MenuItem value="DELAYED">Demorado</MenuItem>
                    <MenuItem value="CANCELLED">Cancelado</MenuItem>

                </Select>
            </FormControl>

            <Button variant="contained" onClick={save}>{editId ? "Actualizar" : "Crear"}</Button>
            <Button variant="outlined" onClick={() => { setEditId(null); setFlightNumber(""); setDestination(""); setDepartureTime(""); setStatus("");}}>Limpiar</Button>
            <Button variant="outlined" onClick={() => { load(); loadGates(); }}>Refrescar</Button>
          </Stack>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Puerta de desembarque</TableCell>
              <TableCell>Numero de vuelo</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Hora de llegada</TableCell>
              <TableCell>EStado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flights.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.id}</TableCell>
                <TableCell>{f.gate_code ?? f.gate}</TableCell>
                <TableCell>{f.flight_number}</TableCell>
                <TableCell>{f.destination}</TableCell>
                <TableCell>{f.departure_time}</TableCell>
                <TableCell>{f.status}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => startEdit(f)}><EditIcon /></IconButton>
                  <IconButton onClick={() => remove(f.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}