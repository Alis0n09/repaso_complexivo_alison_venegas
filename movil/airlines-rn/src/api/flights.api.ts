import type { Paginated } from "../types/drf";
import type { Flight } from "../types/flight";
import { http } from "./http";

export async function listFlightsApi(): Promise<Paginated<Flight> | Flight[]> {
  const { data } = await http.get<Paginated<Flight> | Flight[]>("/api/flights/");
  return data;
}