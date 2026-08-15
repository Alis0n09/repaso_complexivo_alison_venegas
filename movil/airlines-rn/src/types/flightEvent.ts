export type FlightEvent = {
  id: string;
  flight_id: number;       // Postgres
  event_type: string;   
  source: string;            
  note: string;
  created_at: string;
};