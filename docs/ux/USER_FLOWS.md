# User Flows - Hospital Alert System

## 🚨 Operator Flow - Creating an Alert

### Primary Flow: Emergency Alert Creation
```
1. LOGIN
   └─→ Operator Dashboard (default view)
       └─→ "CREATE ALERT" button (prominent, red)
           └─→ Alert Creation Form
               ├─→ Room Number (auto-focused, numeric pad)
               ├─→ Alert Type (large buttons)
               │   ├─ Cardiac Arrest (red)
               │   ├─ Code Blue (blue)
               │   ├─ Fire Alert (orange)
               │   ├─ Security (yellow)
               │   └─ Medical Emergency (green)
               ├─→ Urgency Level (1-5 slider, defaults to type)
               ├─→ Description (optional, voice-to-text)
               └─→ SEND ALERT (confirmation dialog)
                   └─→ Success Screen (auto-return in 3s)
                       └─→ Dashboard (shows new alert)
```

### Alternative Flows
1. **Quick Alert** (1-tap for common scenarios)
2. **Voice Alert** (hands-free creation)
3. **Batch Alert** (multiple rooms)

### Error States
- Invalid room number → Inline error
- Network failure → Retry with offline queue
- Timeout → Auto-save draft

### Success Metrics
- Time to create: <10 seconds
- Taps required: 3-5
- Error rate: <1%

## 👩‍⚕️ Nurse Flow - Acknowledging Alerts

### Primary Flow: Alert Response
```
1. LOGIN
   └─→ Healthcare Dashboard
       ├─→ Active Alerts List (auto-refresh)
       │   ├─ Urgent alerts (top, red)
       │   ├─ My department alerts
       │   └─ Other alerts (grayed)
       └─→ Alert Card
           ├─→ Room Number (large)
           ├─→ Alert Type & Urgency
           ├─→ Time Since Created
           ├─→ Escalation Timer (countdown)
           └─→ ACKNOWLEDGE button
               └─→ Confirmation Dialog
                   ├─→ Add Note (optional)
                   └─→ CONFIRM
                       └─→ Alert Status Updated
                           └─→ Navigate to Room Info
```

### Push Notification Flow
```
PUSH NOTIFICATION arrives
└─→ Tap notification
    └─→ App opens to specific alert
        └─→ Quick acknowledge option
            └─→ Return to previous task
```

### Night Shift Adaptations
- Dark mode auto-enabled
- Reduced sound volume
- Larger touch targets
- Department filter pre-applied

### Success Metrics
- Time to acknowledge: <5 seconds
- Response rate: >95%
- Mis-taps: <2%

## 👨‍⚕️ Doctor Flow - Managing Multiple Alerts

### Primary Flow: Alert Triage
```
1. LOGIN
   └─→ Healthcare Dashboard
       ├─→ Filter: "My Patients" (default)
       ├─→ Sort: Urgency + Time
       └─→ Alert List View
           ├─→ Swipe to Acknowledge
           ├─→ Tap for Details
           │   ├─→ Patient History link
           │   ├─→ Previous Alerts
           │   └─→ Team Members Responding
           └─→ Bulk Actions
               ├─→ Select Multiple
               └─→ Acknowledge All
                   └─→ Add General Note
```

### Escalated Alert Flow
```
ESCALATION NOTIFICATION
└─→ Priority Banner (can't dismiss)
    └─→ RESPOND NOW button
        └─→ Alert Details
            ├─→ Why Escalated
            ├─→ Previous Responders
            └─→ TAKE OWNERSHIP
                └─→ Alert Assigned
```

### Success Metrics
- Alert resolution time: <15 minutes
- Escalation prevention: >80%
- Patient satisfaction: >4.5/5

## 👩‍⚕️ Head Doctor Flow - Department Overview

### Primary Flow: Monitoring & Management
```
1. LOGIN
   └─→ Department Dashboard
       ├─→ Real-time Metrics
       │   ├─ Active Alerts (count)
       │   ├─ Staff On Duty
       │   ├─ Response Times (live)
       │   └─ Escalation Risk
       ├─→ Alert Map View
       │   └─→ Floor Plan
       │       ├─ Alert Locations (pins)
       │       └─ Staff Positions
       └─→ Management Actions
           ├─→ Reassign Alert
           ├─→ Override Escalation
           └─→ Broadcast Message
```

### Analytics Flow
```
Analytics Tab
└─→ Time Range Selector
    └─→ Metrics Dashboard
        ├─→ Response Time Trends
        ├─→ Alert Type Distribution
        ├─→ Staff Performance
        └─→ Export Report
            └─→ PDF/CSV options
```

### Success Metrics
- Department response time: <2 minutes avg
- Escalation rate: <10%
- Staff utilization: 70-85%

## 🔐 Admin Flow - System Management

### Primary Flow: User Administration
```
1. LOGIN
   └─→ Admin Dashboard
       ├─→ Quick Stats
       └─→ User Management
           └─→ User List
               ├─→ Search/Filter
               └─→ User Row
                   └─→ Actions Menu
                       ├─→ Edit Profile
                       ├─→ Change Role
                       ├─→ Reset Password
                       └─→ Suspend/Activate
```

### Compliance Flow
```
Compliance Tab
└─→ Audit Logs
    ├─→ Date Range Filter
    ├─→ User Filter
    ├─→ Action Filter
    └─→ Log Entries
        └─→ Export for HIPAA
```

## 🔄 Common Flows

### Login Flow (All Users)
```
1. APP LAUNCH
   └─→ Login Screen
       ├─→ Email Field
       ├─→ Password Field
       ├─→ Hospital Code (remembered)
       └─→ LOGIN button
           ├─→ Success → Role-based redirect
           └─→ Failure → Error message
               └─→ Retry (3 attempts)
                   └─→ Admin contact
```

### Shift Change Flow
```
1. END SHIFT button
   └─→ Handover Summary
       ├─→ Active Alerts List
       ├─→ Pending Tasks
       ├─→ Notes Field
       └─→ CONFIRM HANDOVER
           └─→ Logout
```

### Emergency Override Flow
```
ANY SCREEN
└─→ Emergency Button (always visible)
    └─→ Override Menu
        ├─→ All Alerts
        ├─→ Broadcast Alert
        └─→ Emergency Contacts
```

## 📱 Mobile-Specific Flows

### Offline Alert Creation
```
No Network Detected
└─→ Offline Mode Banner
    └─→ Create Alert (normal flow)
        └─→ "Queued" indicator
            └─→ Auto-sync when online
                └─→ Confirmation notification
```

### Biometric Login (Post-MVP)
```
APP LAUNCH
└─→ Biometric Prompt
    ├─→ Success → Dashboard
    └─→ Failure → Password fallback
```

## 🎯 Critical Success Factors

### Speed Requirements
- Login to Dashboard: <3 seconds
- Alert Creation: <10 seconds
- Acknowledgment: <5 seconds
- Page Transitions: <500ms

### Reliability Requirements
- Offline capability: 100%
- Sync success rate: >99%
- Push delivery: >99%
- Uptime: 99.9%

### Accessibility Requirements
- One-handed operation
- Voice control ready
- Screen reader compliant
- High contrast mode
- Large touch targets (60px+)

## 🚨 Edge Cases

### Multiple Simultaneous Alerts
- Queue alerts visually
- Priority sorting automatic
- Batch acknowledge option
- Overload warning at 10+

### Shift Change During Alert
- Alert ownership transfers
- Notification to new staff
- Handover note requirement
- History preservation

### System Failure Recovery
- Local storage backup
- Auto-recovery on restart
- Sync conflict resolution
- Admin notification

---

*These flows prioritize speed, clarity, and reliability for healthcare professionals working under pressure.*