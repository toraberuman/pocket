# Pocket Trip Field Matrix

Last updated: 2026-04-29

This document defines the expected editor fields for each trip item category and subcategory.

## Shared Fields

These fields are available for all trip items unless otherwise noted.

- `dayDate`
- `startTime`
- `endTime`
- `category`
- `subcategory`
- `name`
- `nativeName`
- `mapsUrl`
- `address`
- `phone`
- `websiteUrl`
- `reservationUrl`
- `notes`
- `amount`
- `currency`
- `paymentMethod`
- `cardLabel`
- `reservationStatus`
- `imageUrl`

## Legend

- `Required`: should be filled when creating the item.
- `Optional`: useful but not required.
- `Auto`: can be auto-filled from external data later.

## Transport

### Flight

Required:

- `dayDate`
- `subcategory`
- `detail.flightNumber`

Optional:

- `paymentMethod`
- `cardLabel`
- `amount`
- `currency`
- `notes`
- `detail.seat`
- `detail.cabinClass`
- `detail.bookingReference`
- `detail.baggage`
- `detail.checkInUrl`

Auto:

- `name`
- `startTime`
- `endTime`
- `detail.airline`
- `detail.carrierCode`
- `detail.fromAirportCode`
- `detail.fromAirportName`
- `detail.fromTerminal`
- `detail.toAirportCode`
- `detail.toAirportName`
- `detail.toTerminal`
- `detail.scheduledDeparture`
- `detail.scheduledArrival`
- `detail.estimatedDeparture`
- `detail.estimatedArrival`
- `detail.status`
- `detail.gate`
- `detail.lastSyncedAt`

### Train

Required:

- `dayDate`
- `subcategory`
- `detail.fromStation`
- `detail.toStation`

Optional:

- `startTime`
- `endTime`
- `amount`
- `currency`
- `notes`
- `detail.trainNumber`
- `detail.trainType`
- `detail.carriageClass`
- `detail.carNumber`
- `detail.seat`
- `detail.platform`
- `detail.durationMinutes`
- `detail.distanceKm`
- `detail.operator`

### Taxi

Required:

- `dayDate`
- `subcategory`
- `detail.fromName`
- `detail.toName`

Optional:

- `startTime`
- `endTime`
- `amount`
- `currency`
- `paymentMethod`
- `cardLabel`
- `notes`
- `detail.provider`
- `detail.pickupPoint`
- `detail.dropoffPoint`
- `detail.durationMinutes`
- `detail.distanceKm`
- `detail.bookingCode`

### Drive

Required:

- `dayDate`
- `subcategory`
- `detail.fromName`
- `detail.toName`

Optional:

- `startTime`
- `endTime`
- `amount`
- `currency`
- `notes`
- `detail.durationMinutes`
- `detail.distanceKm`
- `detail.parkingName`
- `detail.parkingFee`
- `detail.rentalCarCompany`
- `detail.navigationUrl`
- `detail.tollFee`
- `detail.fuelFee`

### Walk

Required:

- `dayDate`
- `subcategory`
- `detail.fromName`
- `detail.toName`

Optional:

- `startTime`
- `endTime`
- `detail.durationMinutes`
- `detail.distanceKm`
- `detail.routeNotes`

### Bus, Metro, Ferry, Transfer

Required:

- `dayDate`
- `subcategory`
- `detail.fromName`
- `detail.toName`

Optional:

- `startTime`
- `endTime`
- `amount`
- `currency`
- `notes`
- `detail.operator`
- `detail.routeName`
- `detail.durationMinutes`
- `detail.distanceKm`
- `detail.platformOrStop`
- `detail.seat`
- `detail.bookingCode`

## Stay

### Stay

Required:

- `dayDate`
- `subcategory`
- `name`

Optional:

- `nativeName`
- `mapsUrl`
- `address`
- `phone`
- `websiteUrl`
- `reservationUrl`
- `amount`
- `currency`
- `paymentMethod`
- `cardLabel`
- `reservationStatus`
- `notes`
- `detail.checkIn`
- `detail.checkOut`
- `detail.roomType`
- `detail.roomInfo`
- `detail.meals`
- `detail.bookingReference`
- `detail.bookingPlatform`
- `detail.rooms`

Suggested structured room fields:

- `detail.rooms[].label`
- `detail.rooms[].name`
- `detail.rooms[].size`
- `detail.rooms[].roomInfoUrl`
- `detail.rooms[].facilityUrl`

## Restaurant

### Restaurant

Required:

- `dayDate`
- `subcategory`
- `name`

Optional:

- `nativeName`
- `mapsUrl`
- `address`
- `phone`
- `websiteUrl`
- `reservationUrl`
- `startTime`
- `endTime`
- `amount`
- `currency`
- `paymentMethod`
- `cardLabel`
- `reservationStatus`
- `notes`
- `detail.reservationTime`
- `detail.partySize`
- `detail.cuisine`
- `detail.orderItems`

Suggested order item fields:

- `detail.orderItems[].name`
- `detail.orderItems[].nativeName`
- `detail.orderItems[].unitPrice`
- `detail.orderItems[].currency`
- `detail.orderItems[].quantity`
- `detail.orderItems[].subtotal`

## Sight, Shopping, Experience, Other

Required:

- `dayDate`
- `subcategory`
- `name`

Optional:

- `nativeName`
- `mapsUrl`
- `address`
- `phone`
- `websiteUrl`
- `reservationUrl`
- `startTime`
- `endTime`
- `amount`
- `currency`
- `paymentMethod`
- `cardLabel`
- `reservationStatus`
- `notes`
- `detail.openingHours`
- `detail.ticketType`
- `detail.purchaseItems`
- `detail.durationMinutes`

## I18n Note

Visible category and subcategory names must come from locale dictionaries. Database values should use stable codes such as `transport`, `flight`, `stay`, and `restaurant`.
