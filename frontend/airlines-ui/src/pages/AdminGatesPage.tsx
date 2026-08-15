import { useEffect, useState } from "react";
import {
  Container, Paper, Typography, TextField, Button, Stack,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Alert
} from "@mui/material";
import { FormControlLabel, Checkbox, Switch } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { type Gate, listGatesApi, createGateApi, updateGateApi, deleteGateApi } from "../api/gates.api";

export default function AdminGatesPage() {
  const [items, setItems] = useState<Gate[]>([]);
  const [code, setCode] = useState("");
  const [terminal, setTerminal] = useState("");
  const [is_available, setIsAvailable] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const data = await listGatesApi();
      setItems(data.results); // DRF paginado
    } catch {
      setError("No se pudo cargar gates. ¿Login? ¿Token admin?");
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      setError("");
      if (!code.trim()) return setError("Codigo requerido");

      if (editId) await updateGateApi(editId, code.trim(), terminal.trim(), is_available);
      else await createGateApi(code.trim(), terminal.trim(), is_available);

      setCode("");
      setTerminal("");
      setIsAvailable(true);
      setEditId(null);
      await load();
    } catch {
      setError("No se pudo guardar gate. ¿Token admin?");
    }
  };

  const startEdit = (g: Gate) => {
    setEditId(g.id);
    setCode(g.code);
    setTerminal(g.terminal);
    setIsAvailable(g.is_available);

  };

  const remove = async (id: number) => {
    try {
      setError("");
      await deleteGateApi(id);
      await load();
    } catch {
      setError("No se pudo eliminar gate. ¿Vehículos asociados? ¿Token admin?");
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Admin Puertas embarque (Privado)</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="Codigo" value={code} onChange={(e) => setCode(e.target.value)} fullWidth />
          <TextField label="Terminal" value={terminal} onChange={(e) => setTerminal(e.target.value)} fullWidth />
            <FormControlLabel
                control={
                <Switch checked={is_available} onChange={(e) => setIsAvailable(e.target.checked)} />
                }
                label={is_available ? "SI" : "NO"}
            />
           
          <Button variant="contained" onClick={save}>{editId ? "Actualizar" : "Crear"}</Button>
          <Button variant="outlined" onClick={() => { setCode(""); setTerminal(""); setIsAvailable(true) ;setEditId(null); }}>Limpiar</Button>
          <Button variant="outlined" onClick={load}>Refrescar</Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Codigo</TableCell>
              <TableCell>Terminal</TableCell>
              <TableCell>Disponible</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((g) => (
              <TableRow key={g.id}>
                <TableCell>{g.id}</TableCell>
                <TableCell>{g.code}</TableCell>
                <TableCell>{g.terminal}</TableCell>
                <TableCell>{g.is_available}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => startEdit(g)}><EditIcon /></IconButton>
                  <IconButton onClick={() => remove(g.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}