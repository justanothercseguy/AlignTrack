# AlignTrack API Documentation

Base URL: `http://localhost:5000/api`

All endpoints except `/auth/register` and `/auth/login` require authentication via Bearer token.

## Authentication

### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "displayName": "Jane"
}

Response 201:
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "...",
      "email": "user@example.com",
      "displayName": "Jane",
      "timezone": "Asia/Kolkata",
      "treatmentSettings": { ... },
      "notificationPreferences": { ... }
    }
  }
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response 200:
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": { ... }
  }
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": { "user": { ... } }
}
```

### Update Profile
```
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "Jane Doe",
  "timezone": "America/New_York"
}
```

### Change Password
```
POST /auth/change-password
Authorization: Bearer <token>

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Delete Account
```
DELETE /auth/account
Authorization: Bearer <token>

{
  "password": "confirmpassword"
}
```

---

## Aligner Sets

### List All Sets
```
GET /aligner-sets
Authorization: Bearer <token>

Query params: ?status=current&sort=setNumber

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "setNumber": 1,
      "label": "Set 1",
      "plannedStartDate": "2026-10-11",
      "actualStartDate": "2026-10-11",
      "plannedDurationDays": 10,
      "plannedChangeDate": "2026-10-21",
      "actualChangeDate": "2026-10-24",
      "wearTimeTargetOverride": null,
      "status": "completed",
      "notes": "First set, mild pressure",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### Create Set
```
POST /aligner-sets
Authorization: Bearer <token>

{
  "setNumber": 1,
  "label": "Set 1",
  "plannedStartDate": "2026-10-11",
  "actualStartDate": "2026-10-11",
  "plannedDurationDays": 10,
  "status": "current",
  "notes": "Starting treatment"
}
```

### Update Set
```
PUT /aligner-sets/:id
Authorization: Bearer <token>

{
  "plannedDurationDays": 14,
  "notes": "Extended by orthodontist"
}
```

### Confirm Aligner Change
```
POST /aligner-sets/:id/confirm-change
Authorization: Bearer <token>

{
  "actualChangeDate": "2026-10-24",
  "nextSetNumber": 2,
  "nextSetPlannedDuration": 10,
  "nextSetActualStartDate": "2026-10-24"
}

Response 200:
{
  "success": true,
  "data": {
    "completedSet": { ... },
    "nextSet": { ... }
  }
}
```

### Generate Plan
```
POST /aligner-sets/generate-plan
Authorization: Bearer <token>

{
  "startDate": "2026-10-11",
  "totalSets": 20
}
```

### Recalculate Future Sets
```
PUT /aligner-sets/:id/recalculate
Authorization: Bearer <token>
```

---

## Wear Sessions

### Start Session
```
POST /wear-sessions/start
Authorization: Bearer <token>

{
  "timezone": "Asia/Kolkata"
}

Response 201:
{
  "success": true,
  "data": {
    "_id": "...",
    "startTime": "2026-10-21T10:00:00.000Z",
    "endTime": null,
    "isActive": true,
    "timezone": "Asia/Kolkata"
  }
}
```

### Stop Session
```
POST /wear-sessions/stop
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "session": { ... },
    "dailySummary": {
      "date": "2026-10-21",
      "totalMinutes": 480,
      "totalHours": 8.0,
      "targetHours": 18,
      "remainingHours": 10,
      "extraHours": 0,
      "targetMet": false,
      "sessions": [...]
    }
  }
}
```

### Get Active Session
```
GET /wear-sessions/active
Authorization: Bearer <token>
```

### Manual Entry
```
POST /wear-sessions/manual
Authorization: Bearer <token>

{
  "startTime": "2026-10-21T08:00:00.000Z",
  "endTime": "2026-10-21T16:00:00.000Z",
  "timezone": "Asia/Kolkata"
}
```

### Edit Session
```
PUT /wear-sessions/:id
Authorization: Bearer <token>

{
  "startTime": "2026-10-21T07:30:00.000Z",
  "endTime": "2026-10-21T16:00:00.000Z"
}
```

### Daily Summary
```
GET /wear-sessions/daily-summary?date=2026-10-21
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "date": "2026-10-21",
    "totalMinutes": 1080,
    "totalHours": 18.0,
    "targetHours": 18,
    "remainingHours": 0,
    "extraHours": 0,
    "targetMet": true,
    "sessions": [...]
  }
}
```

### Weekly Summary
```
GET /wear-sessions/weekly-summary
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    { "date": "2026-10-15", "totalHours": 18.5, "targetHours": 18, "targetMet": true },
    { "date": "2026-10-16", "totalHours": 17.0, "targetHours": 18, "targetMet": false },
    ...
  ]
}
```

---

## Appointments

### List Appointments
```
GET /appointments
Authorization: Bearer <token>

Query params: ?status=upcoming&sort=-date
```

### Create Appointment
```
POST /appointments
Authorization: Bearer <token>

{
  "title": "Orthodontist Check-up",
  "provider": "Dr. Smith",
  "date": "2026-11-15",
  "time": "14:30",
  "timezone": "Asia/Kolkata",
  "location": "123 Dental Clinic",
  "notes": "Discuss Set 3 progress",
  "reminderConfig": {
    "oneDayBefore": true,
    "dayOf": true
  }
}
```

### Reschedule Appointment
```
PUT /appointments/:id/reschedule
Authorization: Bearer <token>

{
  "date": "2026-11-20",
  "time": "10:00",
  "reason": "Schedule conflict"
}
```

### Cancel Appointment
```
PUT /appointments/:id/cancel
Authorization: Bearer <token>
```

### Complete Appointment
```
PUT /appointments/:id/complete
Authorization: Bearer <token>

{
  "postAppointmentNotes": "Orthodontist approved moving to Set 3"
}
```

---

## Journal Entries

### List Entries
```
GET /journal
Authorization: Bearer <token>

Query params: ?category=pain_pressure&alignerSetId=...&unresolved=true&search=keyword&startDate=2026-10-01&endDate=2026-10-31
```

### Create Entry
```
POST /journal
Authorization: Bearer <token>

{
  "alignerSetId": "...",
  "date": "2026-10-15",
  "time": "09:30",
  "category": "pain_pressure",
  "severity": "Moderate",
  "affectedArea": "Upper right canine",
  "description": "Noticeable pressure when wearing Set 1, especially in the morning",
  "isOngoing": true,
  "needsDiscussion": true
}
```

### Resolve Entry
```
PUT /journal/:id/resolve
Authorization: Bearer <token>

{
  "resolutionDate": "2026-10-20"
}
```

---

## Questions

### List Questions
```
GET /questions
Authorization: Bearer <token>

Query params: ?completed=false&appointmentId=...
```

### Create Question
```
POST /questions
Authorization: Bearer <token>

{
  "text": "Can I switch to 7-day changes after Set 5?",
  "priority": "high",
  "alignerSetId": "...",
  "appointmentId": "..."
}
```

### Complete Question
```
PUT /questions/:id/complete
Authorization: Bearer <token>

{
  "answerNotes": "Yes, approved for 7-day changes starting Set 6"
}
```

---

## Calendar

### Get Monthly Events
```
GET /calendar/events?month=2026-10
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "type": "aligner_start",
      "title": "Started Set 1",
      "date": "2026-10-11",
      "color": "#9B8AFB",
      "relatedId": "..."
    },
    {
      "id": "...",
      "type": "planned_change",
      "title": "Planned: Change to Set 2",
      "date": "2026-10-21",
      "color": "#7775E8",
      "relatedId": "..."
    },
    {
      "id": "...",
      "type": "appointment",
      "title": "Orthodontist Check-up",
      "date": "2026-10-24",
      "time": "14:30",
      "color": "#FFD8CE",
      "relatedId": "..."
    }
  ]
}
```

---

## Notifications

### List Notifications
```
GET /notifications
Authorization: Bearer <token>

Query params: ?unread=true&type=appointment_reminder
```

### Mark as Read
```
PUT /notifications/:id/read
Authorization: Bearer <token>
```

### Mark All Read
```
PUT /notifications/read-all
Authorization: Bearer <token>
```

### Register Push Subscription
```
POST /notifications/push-subscription
Authorization: Bearer <token>

{
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "userAgent": "Chrome/118..."
}
```

---

## Reports

### Visit Report
```
GET /reports/visit-report?appointmentId=...
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "appointment": { ... },
    "currentAligner": { ... },
    "alignerHistory": [...],
    "wearTimeSummary": [...],
    "recentIssues": [...],
    "unresolvedIssues": [...],
    "questions": [...],
    "incompleteData": true/false
  }
}
```

### Treatment Summary
```
GET /reports/treatment-summary
Authorization: Bearer <token>
```

---

## Settings

### Get Settings
```
GET /settings
Authorization: Bearer <token>
```

### Update Treatment Settings
```
PUT /settings/treatment
Authorization: Bearer <token>

{
  "phases": [
    {
      "name": "Phase A",
      "startSet": 1,
      "endSet": 5,
      "defaultDurationDays": 10,
      "defaultWearTimeTarget": 18
    },
    {
      "name": "Phase B",
      "startSet": 6,
      "endSet": null,
      "defaultDurationDays": 7,
      "defaultWearTimeTarget": 20
    }
  ],
  "schedulingMode": "actual"
}
```

### Update Notification Settings
```
PUT /settings/notifications
Authorization: Bearer <token>

{
  "appointmentReminder1DayBefore": true,
  "appointmentReminderDayOf": false,
  "appointmentReminderTime": "09:00",
  "alignerReminder1DayBefore": true,
  "alignerReminder2DaysBefore": false,
  "alignerReminder3DaysBefore": false,
  "alignerReminderOnDay": false,
  "alignerOverdueReminder": true
}
```

### Export Data
```
POST /settings/export
Authorization: Bearer <token>

Response 200: (JSON file download)
{
  "exportDate": "2026-10-21T...",
  "user": { ... },
  "alignerSets": [...],
  "wearSessions": [...],
  "appointments": [...],
  "journalEntries": [...],
  "questions": [...],
  "notifications": [...]
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate session) |
| 429 | Rate Limited |
| 500 | Internal Server Error |
