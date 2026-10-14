import { createContext, useContext, useState, type ReactNode } from 'react';
import type { RentalRecord } from '../types/rental';
import type { MaintenanceProvider, MaintenanceServiceType } from '../types/maintenance';
import { MOCK_MAINTENANCE_PROVIDERS } from '../constants/mockMaintenance';

export type MaintenanceQuote = {
  id: string;
  work: string;
  labour: { label: string; amountXaf: number }[];
  visitAt: string;
  duration: string;
};
export const maintenanceStatusLabels = {
  requested: 'Awaiting garage response', quoted: 'Quote ready to review',
  confirmed: 'Visit confirmed', in_progress: 'Service in progress', quote_declined: 'Quote declined',
} as const;
export const maintenanceServiceLabels: Record<MaintenanceServiceType, string> = {
  oil_and_filter_change: 'Oil & filter change', diagnostics: 'Diagnostics', inspection: 'Inspection', battery_service: 'Battery service', tyre_service: 'Tyre service',
};

export type MaintenanceBooking = {
  id: string;
  reference: string;
  createdAt: string;
  garage: MaintenanceProvider;
  rental: RentalRecord;
  service: MaintenanceServiceType;
  issue: string;
  preferredDate: string;
  status: keyof typeof maintenanceStatusLabels;
  quote?: MaintenanceQuote;
  decidedAt?: string;
  checkedInAt?: string;
  startedAt?: string;
  updates?: { id: string; at: string; title: string; message: string }[];
};
type Flow = {
  activeRentals: RentalRecord[];
  requests: MaintenanceBooking[];
  submit: (input: Pick<MaintenanceBooking, 'garage' | 'rental' | 'service' | 'issue' | 'preferredDate'>) => MaintenanceBooking;
  openActivity: () => void;
  decideQuote: (id: string, decision: 'approve' | 'decline') => void;
};
const Context = createContext<Flow | undefined>(undefined);
export function MaintenanceFlowProvider({ rentals, onOpenActivity, children }: { rentals: RentalRecord[]; onOpenActivity: () => void; children: ReactNode }) {
  const [requests, setRequests] = useState<MaintenanceBooking[]>(() => {
    const rental = rentals.find(item => item.status === 'active');
    if (!rental) return [];
    const visit = new Date();
    visit.setDate(visit.getDate() + 2);
    visit.setHours(10, 0, 0, 0);
    // Sample garage response for the UI preview; no real garage has issued a quote.
    const quoteExample: MaintenanceBooking = { id: 'maintenance-demo-quote', reference: 'MNT-1042', createdAt: new Date().toISOString(), garage: MOCK_MAINTENANCE_PROVIDERS[0], rental,
      service: 'diagnostics', issue: 'The engine warning light is on. Please check the cause before replacing any parts.',
      preferredDate: `${visit.getFullYear()}-${String(visit.getMonth() + 1).padStart(2, '0')}-${String(visit.getDate()).padStart(2, '0')}`,
      status: 'quoted', quote: { id: 'quote-demo-1042', work: 'Scan the vehicle for fault codes, inspect the reported issue and explain the findings. No replacement parts are included.',
        labour: [{ label: 'Diagnostic scan', amountXaf: 10000 }, { label: 'Inspection and findings report', amountXaf: 5000 }], visitAt: visit.toISOString(), duration: 'About 1 hour' } };
    const ago = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString();
    const today = new Date();
    const ongoing: MaintenanceBooking = { ...quoteExample, id: 'maintenance-demo-progress', reference: 'MNT-1041',
      createdAt: ago(1440), status: 'in_progress', decidedAt: ago(120), checkedInAt: ago(35), startedAt: ago(25),
      preferredDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
      quote: { ...quoteExample.quote!, id: 'quote-demo-1041', visitAt: ago(35) },
      updates: [
        { id: 'diagnostic-started', at: ago(25), title: 'Diagnostic scan started', message: 'We are checking the fault codes and inspecting the reported warning light. No parts are being replaced.' },
        { id: 'vehicle-received', at: ago(35), title: 'Vehicle received', message: `Your ${rental.vehicle.brand} ${rental.vehicle.model} has been checked in. The team has reviewed your approved work.` },
      ],
    };
    return [quoteExample, ongoing];
  });
  const decideQuote: Flow['decideQuote'] = (id, decision) => setRequests(current => current.map(request =>
    request.id === id && request.status === 'quoted' && request.quote
      ? { ...request, status: decision === 'approve' ? 'confirmed' : 'quote_declined', decidedAt: new Date().toISOString() }
      : request));
  const submit: Flow['submit'] = input => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const request: MaintenanceBooking = { ...input, id: `maintenance-${id}`, reference: `MNT-${id.slice(-7).toUpperCase()}`, createdAt: new Date().toISOString(), status: 'requested' };
    setRequests(current => [request, ...current]);
    return request;
  };
  return <Context.Provider value={{ activeRentals: rentals.filter(rental => rental.status === 'active'), requests, submit, decideQuote, openActivity: onOpenActivity }}>{children}</Context.Provider>;
}
export function useMaintenanceFlow() {
  const flow = useContext(Context);
  if (!flow) throw new Error('MaintenanceFlowProvider is required');
  return flow;
}
