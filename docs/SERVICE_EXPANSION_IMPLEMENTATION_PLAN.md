# G-Rides Service Expansion Implementation Plan

## Purpose

G-Rides is expanding from a car-rental application into a broader vehicle-services platform. The platform will support:

- Car rentals
- Vehicle maintenance, beginning with oil changes
- Motor spare-parts shopping
- Towing and roadside assistance
- Car insurance services

These services must be represented appropriately in the Customer, Car Owner, and Driver experiences without mixing their responsibilities or overcrowding their navigation.

This document is the working implementation roadmap for that expansion.

## Product Decision — Separate Role Workspaces

**Decision date:** August 19, 2026

G-Rides will use one account with separate role workspaces. Switching roles changes the entire workspace, including its home screen, primary navigation, terminology, data scope, and available actions.

The current rental-discovery interface is the **Customer workspace**. It must not be treated as a generic interface for all roles.

The stakeholder definitions are:

| Stakeholder | Meaning |
| --- | --- |
| Customer | Rents vehicles or purchases maintenance, parts, towing, and insurance services. |
| Car Owner | Lists and manages vehicles as a rental supplier or fleet business. |
| Driver | Provides chauffeur services and works with vehicles assigned by owners. |

The existing internal `renter` role must be migrated to `customer`. Renting becomes one customer activity rather than the name of the entire role.

## Product Direction

G-Rides should become a unified mobility and vehicle-services platform rather than a collection of unrelated features.

The main principles are:

1. Do not add one bottom-navigation tab per service.
2. Keep navigation stable within each role, while allowing different navigation between role workspaces.
3. Make the active workspace explicit and switch the complete workspace when the user changes roles.
4. Use a shared vehicle profile across rentals, maintenance, parts, towing, and insurance.
5. Keep urgent roadside assistance easy to reach.
6. Keep customer service records together in Activity, owner rental operations in Bookings, and driver work in Trips.
7. Build each service as a separate domain so rental logic does not become overloaded.

## Workspace Navigation

### Customer Workspace

The application screens built so far belong to this workspace.

```text
Home | Discover | Activity | Messages | Profile
```

#### Customer Home

- Multi-service launcher
- Nearby and recommended rental vehicles
- Active and upcoming customer activities
- Prominent roadside-assistance shortcut
- Personalised service recommendations

#### Customer Discover

```text
Cars | Maintenance | Parts | Towing | Insurance
```

Each category uses the interaction model appropriate to its service. Cars and towing rely heavily on maps, maintenance uses provider and appointment discovery, parts use a catalogue/store, and insurance uses quotation and policy flows.

#### Customer Activity

```text
All | Rentals | Services | Orders | Towing | Insurance
```

The existing Rentals screen and rental-detail flows remain inside the Rentals category.

#### Customer Profile

- Personal and security settings
- Role switching
- **My Vehicles** for personal vehicles used to request services
- Vehicle documents
- Payment methods
- Saved addresses
- Policies and emergency contacts

The word **Garage** must not be used as the primary customer-facing label.

### Car Owner Workspace

```text
Dashboard | Fleet | Bookings | Messages | Profile
```

#### Owner Dashboard

- Pending booking requests and actions required
- Active and upcoming rentals
- Fleet availability and maintenance alerts
- Earnings and performance summary
- Service shortcuts for fleet vehicles

#### Fleet

- Rental listings and vehicle status
- Pricing, availability, and listing controls
- Vehicle documents and verification
- Driver assignments
- Maintenance history
- Parts, towing, and insurance actions per vehicle

**Fleet** is the preferred primary label. **Garage** may be used as a secondary visual concept, but not as a substitute for clear fleet-management terminology.

#### Bookings

- Requested
- Confirmed
- Active
- Completed
- Canceled
- Payment and handover status

### Driver Workspace

```text
Dashboard | Trips | Vehicle | Messages | Profile
```

#### Driver Dashboard

- Online/offline availability
- New chauffeur requests
- Next scheduled trip
- Earnings and performance summary
- Urgent vehicle or roadside alerts

#### Trips

- Available requests
- Accepted and scheduled trips
- Current trip
- Completed and canceled trips

#### Vehicle

- Assigned vehicle details
- Required documents and insurance visibility
- Issue reporting
- Maintenance and parts requests
- Roadside assistance
- Owner-approval status for expenses

### Shared Across Workspaces

Messages, account identity, security settings, payment settings, notifications, and support are shared at account level. Their content and actions remain role-aware.

Role switching must:

1. Change the complete bottom-navigation configuration.
2. Open the selected role's dashboard.
3. Scope data and actions to that role.
4. Preserve shared account information and message history.
5. Prevent a user from entering a workspace whose setup is incomplete.

## Customer Service Launcher

The Home screen should contain a prominent service launcher with:

1. Rent a car
2. Maintenance
3. Spare parts
4. Towing
5. Insurance

The oil-change service should live under **Maintenance** so G-Rides can later add tyres, batteries, diagnostics, repairs, detailing, and other vehicle services without another navigation redesign.

Towing should also have a highly visible **Roadside assistance** action because it is an urgent service.

## Role-Specific Service Responsibilities

Every service is represented across the three workspaces, but the permitted actions are different.

| Service | Customer | Car Owner | Driver |
| --- | --- | --- | --- |
| Rentals | Find, request, and manage rentals | List vehicles and manage rental requests | Accept and manage chauffeur jobs |
| Maintenance | Service a personal vehicle | Maintain individual cars or a fleet | Report issues and request authorized servicing |
| Spare parts | Purchase compatible parts | Purchase parts for fleet vehicles | Request parts for an assigned vehicle |
| Towing | Request roadside assistance | Dispatch towing for a fleet vehicle | Request help while driving an assigned vehicle |
| Insurance | Request quotes and manage policies | Insure individual vehicles or a fleet | View assigned-vehicle documents and report incidents |

### Role Behaviour Rules

- A user may have more than one configured role.
- Switching roles must replace the complete workspace while retaining the same account, messages, payment settings, and security configuration.
- Actions unavailable to a role must be hidden or clearly disabled with an explanation.
- Roles that have not completed setup must display a Set up action instead of pretending the workspace is ready.
- Driver requests that create owner expenses may require owner approval.

## Shared Vehicle Foundation and Role-Specific Naming

The underlying vehicle record is shared, but each workspace presents it differently:

| Workspace | User-facing label | Vehicle scope |
| --- | --- | --- |
| Customer | My Vehicles | Personal vehicles and eligible active rentals used to request services |
| Car Owner | Fleet | Owned rental listings and operational fleet vehicles |
| Driver | Assigned Vehicle or Assigned Vehicles | Vehicles explicitly assigned by an owner |

This shared vehicle foundation is a central dependency for the new services and must be established before individual verticals.

A vehicle profile should contain:

- Vehicle ID
- Owner or assigned user
- Make and model
- Year
- Category
- Registration number
- VIN or chassis number where appropriate
- Fuel type
- Transmission
- Mileage
- Images
- Insurance status
- Maintenance history
- Current driver assignment
- Required documents

The underlying model should support:

- Personal vehicles
- Rental fleet vehicles
- Vehicles assigned to drivers
- Vehicles temporarily associated with an active rental

The same vehicle record should power:

- Maintenance bookings
- Parts compatibility
- Towing requests
- Insurance quotations and policies
- Fleet management
- Driver issue reporting

Personal vehicle ownership does not automatically make a customer a G-Rides Car Owner. The Car Owner role is a supplier role that requires setup, verification, and permission to list vehicles for rent.

## Domain Separation

The following domains should have separate types, mock repositories, state, and eventual backend endpoints:

### Shared

- `UserVehicle`
- `ServiceProvider`
- `Address`
- `PaymentMethod`
- `Document`
- `ServiceNotification`

### Maintenance

- `MaintenanceService`
- `MaintenanceProvider`
- `MaintenanceQuote`
- `ServiceAppointment`
- `MaintenanceRecord`

### Spare Parts

- `PartCategory`
- `PartProduct`
- `VehicleCompatibility`
- `Cart`
- `CartItem`
- `PartsOrder`
- `DeliveryStatus`

### Towing

- `TowRequest`
- `TowVehicle`
- `TowProvider`
- `TowQuote`
- `TowStatus`
- `TowLocationUpdate`

### Insurance

- `InsuranceProvider`
- `InsuranceQuoteRequest`
- `InsuranceQuote`
- `InsuranceApplication`
- `InsurancePolicy`
- `InsuranceClaim`

Rental-specific records must remain separate from these new service records.

## Service Workflows

### Towing and Roadside Assistance

```text
Select vehicle
  → Confirm current pickup location
  → Choose issue and destination
  → View estimate/provider availability
  → Confirm request
  → Track assigned tow vehicle
  → Message or call operator
  → Complete service and receive receipt
```

Core requirements:

- Current-location detection
- Manual location correction
- Vehicle and issue selection
- Route, distance, and ETA
- Live tow-vehicle tracking
- Provider status updates
- In-app communication
- Payment and receipt
- Emergency failure and cancellation states

### Maintenance

```text
Select vehicle
  → Choose maintenance service
  → Choose garage or mobile service
  → Select date and time
  → Review quote
  → Submit/confirm appointment
  → Track service status
  → Pay and receive maintenance record
```

Initial service catalogue:

- Oil and filter change
- Diagnostics
- Battery service
- Tyre service
- General inspection

### Spare-Parts Store

```text
Select vehicle or browse generally
  → Search/filter catalogue
  → Confirm compatibility
  → View product details
  → Add to cart
  → Choose delivery or pickup
  → Pay
  → Track order
```

Core requirements:

- Categories and search
- Vendor and product information
- Stock state
- Vehicle compatibility
- Cart and quantities
- Delivery addresses
- Checkout and payment
- Order tracking
- Returns and support

### Insurance

```text
Select vehicle
  → Enter driver/vehicle details
  → Request quotes
  → Compare plans
  → Select coverage
  → Upload required documents
  → Submit application
  → Pay through approved partner flow
  → Access policy and claims
```

Insurance must be implemented with licensed partners and should not imply that G-Rides itself is an insurer unless that is legally and operationally true.

## Provider and Partner Requirements

The customer-facing application depends on service providers even if their interfaces are not built immediately.

The platform must eventually support:

- Garages and mobile mechanics
- Spare-parts vendors
- Towing operators and dispatchers
- Licensed insurance partners

The business must decide whether each service is:

- Fulfilled directly by G-Rides
- A managed marketplace
- A referral or lead-generation service
- An external partner integration

Provider dashboards may be separate applications or web portals. The frontend data model should still account for provider availability, approval, pricing, status updates, messaging, and payouts.

## Implementation Phases

### Phase 0 — Product and Operational Decisions

- [x] Define Customer, Car Owner, and Driver as distinct workspaces.
- [x] Reserve My Vehicles for customers, Fleet for owners, and Assigned Vehicle for drivers.
- [ ] Define whether each service is direct, marketplace, referral, or partner-led.
- [ ] Define supported cities and service coverage.
- [ ] Define commissions, fees, cancellations, refunds, and payouts.
- [ ] Define towing response expectations and emergency escalation.
- [ ] Confirm insurance compliance and partner responsibilities.
- [ ] Define owner approval rules for driver-generated expenses.

### Phase 1 — Shared Navigation and Domain Foundation

- [x] Rename Explore to Discover.
- [x] Rename Rentals to Activity.
- [x] Preserve the existing customer rental flows within the new structure.
- [x] Add shared service-category constants and types.
- [x] Create independent mock repositories for each service domain.
- [x] Establish loading, empty, error, and unavailable states.
- [x] Create the initial permission matrix for the three roles.

### Phase 2 — Workspace Alignment and Shared Vehicle Foundation

- [x] Create reusable vehicle cards and vehicle-selection sheets.
- [x] Create reusable vehicle add/edit and document-management sheets.
- [x] Add shared models for personal, fleet, assigned, and active-rental relationships.
- [ ] Rename the internal `renter` role to `customer`.
- [ ] Introduce explicit Customer, Car Owner, and Driver workspace navigation configurations.
- [ ] Make role switching replace the complete workspace and open its dashboard.
- [ ] Present the existing Profile entry as **My Vehicles** in the Customer workspace.
- [ ] Remove Garage and fleet language from customer-facing copy.
- [ ] Limit Customer My Vehicles to personal vehicles and eligible active rentals.
- [ ] Route owner vehicle management to the future Fleet workspace.
- [ ] Route driver vehicle access to the future Assigned Vehicle workspace.
- [ ] Verify data isolation and permissions between all three vehicle scopes.

Phase 2 must be completed before new Customer Home work continues. Existing shared vehicle components should be adapted, not discarded.

### Phase 3 — Customer Home Service Hub

- [ ] Add the five-service launcher.
- [ ] Keep rental discovery prominent for customers.
- [ ] Add the Roadside assistance shortcut.
- [ ] Add customer activity summaries and recommendations.
- [ ] Add service-specific notification types.
- [ ] Ensure the Home layout scales to smaller devices.

### Phase 4 — Customer Discover and Activity Shells

- [ ] Add Cars, Maintenance, Parts, Towing, and Insurance to Discover.
- [ ] Add Rentals, Services, Orders, Towing, and Insurance to Activity.
- [ ] Create shared filtering, status, and search patterns.
- [ ] Add appropriate empty states for every category.
- [ ] Preserve bottom-navigation and safe-area behaviour.

### Phase 5 — Customer Towing MVP

- [ ] Build vehicle and issue selection.
- [ ] Build pickup and destination selection.
- [ ] Reuse the current location and map foundation.
- [ ] Add price/ETA estimation using mock data first.
- [ ] Add request confirmation and status tracking.
- [ ] Add live-map architecture hooks for provider tracking.
- [ ] Connect towing chat and notifications.
- [ ] Add payment, cancellation, completion, and receipt states.

### Phase 6 — Customer Maintenance MVP

- [ ] Build the maintenance-service catalogue.
- [ ] Build provider discovery and details.
- [ ] Build vehicle, location, date, and time selection.
- [ ] Build quote review and appointment confirmation.
- [ ] Add appointment status tracking.
- [ ] Add payment and receipt states.
- [ ] Add completed work to vehicle maintenance history.

### Phase 7 — Customer Spare-Parts Store MVP

- [ ] Build catalogue categories and search.
- [ ] Build product and vendor details.
- [ ] Add compatibility checks against My Vehicles.
- [ ] Build cart and quantity management.
- [ ] Build delivery/pickup selection.
- [ ] Build checkout and payment.
- [ ] Build order history and tracking.
- [ ] Add returns and support entry points.

### Phase 8 — Customer Insurance MVP

- [ ] Confirm licensed partner and API requirements.
- [ ] Build quote-request forms.
- [ ] Build quote comparison.
- [ ] Build document upload requirements.
- [ ] Build application status tracking.
- [ ] Build policy display and renewal reminders.
- [ ] Add claim initiation and tracking where supported.

### Phase 9 — Car Owner Workspace

- [ ] Build the owner navigation: Dashboard, Fleet, Bookings, Messages, and Profile.
- [ ] Build the owner dashboard and action-required summaries.
- [ ] Build Fleet as a dedicated operational workspace.
- [ ] Separate rental listings from personal vehicles.
- [ ] Add vehicle listing creation, pricing, availability, and verification.
- [ ] Add booking request approval, rejection, and handover workflows.
- [ ] Add earnings and performance summaries.
- [ ] Add fleet maintenance, parts, towing, and insurance actions.
- [ ] Add owner approval workflows for driver-generated expenses.
- [ ] Add owner-specific notifications, messages, and empty states.

### Phase 10 — Driver Workspace

- [ ] Build the driver navigation: Dashboard, Trips, Vehicle, Messages, and Profile.
- [ ] Build driver availability and chauffeur-request handling.
- [ ] Build scheduled, active, completed, and canceled trip flows.
- [ ] Build Assigned Vehicle with read-only owner-controlled details.
- [ ] Add vehicle issue reporting.
- [ ] Add authorized maintenance, parts, and towing requests.
- [ ] Add insurance-document visibility and incident reporting.
- [ ] Add owner-approval and request-status tracking.
- [ ] Add driver earnings and performance summaries.
- [ ] Add driver-specific notifications, messages, and empty states.

### Phase 11 — Provider and Partner Operations

- [ ] Decide whether provider tools live in separate mobile apps or web portals.
- [ ] Define garage and mobile-mechanic onboarding and fulfilment tools.
- [ ] Define spare-parts vendor catalogue and order-management tools.
- [ ] Define towing operator availability, dispatch, and tracking tools.
- [ ] Define licensed-insurance-partner integration and servicing tools.
- [ ] Define partner permissions, payouts, reporting, and support escalation.

### Phase 12 — Backend and Production Readiness

- [ ] Replace mock repositories with API-backed services.
- [ ] Add authentication and role authorization.
- [ ] Add real payment-provider integrations.
- [ ] Add real-time status and location updates.
- [ ] Add provider assignment and dispatch.
- [ ] Add push notifications.
- [ ] Add analytics and funnel tracking.
- [ ] Add offline, retry, and failure recovery.
- [ ] Add audit logging for payments, insurance, and role approvals.
- [ ] Complete accessibility, performance, and security reviews.

## Cross-Cutting UI Standards

Every new flow must follow the established G-Rides interface conventions:

- Use global theme colors and typography.
- Use shared horizontal screen gutters.
- Prefer reusable cards, chips, buttons, sheets, and empty states.
- Use icons from the project image assets where suitable.
- Respect top and bottom safe areas.
- Keep primary actions close to the safe-area bottom.
- Use custom sheets and menus rather than generic device dialogs.
- Support Android hardware back and iOS edge-swipe where applicable.
- Provide loading, empty, validation, error, offline, and success states.
- Make urgent actions visually prominent without using alarming styling unnecessarily.
- Keep the active role/workspace visible wherever a user could otherwise confuse customer and provider actions.
- Never expose owner or driver operational controls inside the Customer workspace.
- Use role-specific terminology consistently: My Vehicles, Fleet, and Assigned Vehicle.

## Frontend Architecture Guidance

Until a backend is available:

1. Define stable TypeScript domain models.
2. Keep mock data in dedicated domain files.
3. Place data access behind repository or service interfaces.
4. Keep server-generated concepts such as quotes, provider assignment, and payment confirmation clearly mocked.
5. Never present a simulated request or payment as genuinely completed.
6. Keep navigation callbacks and domain state centralized so API integration does not require rewriting screens.

## Definition of Done for Each Service

A service vertical is not considered complete until it includes:

- Entry point from Home and Discover
- Role-appropriate visibility and permissions
- Primary user workflow
- Detail/status screen
- Activity history integration
- Notifications
- Messages/support entry point
- Loading state
- Empty state
- Error and unavailable states
- Cancellation or recovery flow
- Safe-area and gesture support
- TypeScript and platform-build validation

## Definition of Done for Each Workspace

A role workspace is not considered complete until it includes:

- Its own approved bottom-navigation configuration
- A role-specific dashboard
- Correctly scoped data and actions
- Clear workspace identity and terminology
- Setup and verification gates
- Role-specific notifications and messages
- Loading, empty, error, and permission-denied states
- Correct behaviour after switching into and out of the workspace
- No leakage of another role's operational controls or private data
- Safe-area, back-gesture, accessibility, and platform-build validation

## Current Starting Point

The next implementation work must be:

1. Complete Phase 2 workspace alignment.
2. Rename the internal Renter role to Customer.
3. Change the current Garage presentation into Customer **My Vehicles**.
4. Add role-specific navigation configuration and full-workspace switching.
5. Continue with the Customer Home service launcher.
6. Expand Customer Discover and Activity.
7. Implement Customer Towing as the first new service vertical.
8. Build the Car Owner and Driver workspaces as dedicated products in their scheduled phases.

This sequence protects the existing Customer experience from owner and driver operational complexity while retaining shared components, account state, messages, notifications, payments, and service-domain models.
