# CivicFix AI — Engineering & Implementation Plan

> **Document Type:** Technical Project Plan  
> **Project:** CivicFix AI  
> **Audience:** Intern Engineering Team  
> **Planning Stage:** Architecture & Core Engineering  
> **Status:** Approved for implementation planning  
> **UI/UX:** Intentionally deferred to a separate UI/UX plan

---

## 1. Executive Summary

CivicFix AI is a public civic-issue reporting and tracking platform.

The platform allows citizens to report real-world civic problems such as:

- Potholes and road damage
- Broken streetlights
- Garbage and sanitation problems
- Water leakage
- Damaged traffic signals
- Other legitimate public-infrastructure/civic issues

A citizen can capture or upload an image, edit it before submission, provide or adjust the issue location, and submit the report. AI validates and classifies the image, generates a complaint description, estimates severity/priority, and checks whether the report appears relevant.

The report then enters an administrative workflow:

**Reported → Verified → Assigned → In Progress → Resolved → Citizen Confirmation**

Citizens receive status updates and can see their complete report history.

The system also provides a location-aware **CivicFeed** that shows relevant civic issues around a user's selected area. This helps citizens become aware of problems in their locality.

The platform is designed with:

- Security and privacy as first-class requirements
- Clean, maintainable code
- Modular architecture
- Scalable backend design
- Optimized image handling
- AI-assisted validation
- Geospatial querying
- Role-based access control
- Citizen feedback and verification
- Admin analytics
- Responsive performance
- Clear documentation

The first implementation phase focuses on making the system **correct, secure, maintainable, and functional**. UI/UX polish will be planned separately after the core system is stable.

---

# 2. Product Vision

## Vision

> Build a trustworthy civic reporting platform that connects citizens, AI-assisted issue detection, and administrators so that public problems can be reported, prioritized, tracked, resolved, and verified.

## Core Problem

Traditional civic complaint systems can suffer from:

- Difficult reporting workflows
- Poor issue categorization
- Duplicate complaints
- Fake or irrelevant reports
- Lack of status visibility
- Weak citizen feedback loops
- Poor prioritization
- Lack of localized awareness
- Limited accountability

CivicFix AI addresses these problems through automation, AI validation, geospatial intelligence, workflow tracking, and citizen verification.

---

# 3. Core Product Principles

The engineering team must follow these principles throughout development.

### 3.1 Security First

Never sacrifice security for development speed.

### 3.2 Privacy by Design

Only collect information that is necessary. Do not expose private user information unnecessarily.

### 3.3 AI Assists; Humans Decide

AI can classify, validate, summarize, and prioritize. It should not independently make irreversible administrative decisions.

### 3.4 Maintainability Over Cleverness

Prefer simple, readable, documented code over complicated abstractions.

### 3.5 Modular Architecture

Authentication, reports, AI, images, notifications, analytics, and administration should have clear boundaries.

### 3.6 Performance by Default

Optimize images, API responses, database queries, frontend bundles, and loading behavior from the beginning.

### 3.7 Scale Without Premature Overengineering

The initial architecture should be capable of scaling, but the first version should remain simple enough for an intern team to understand and maintain.

---

# 4. Project Scope

## 4.1 MVP / Core Features

### Citizen Features

- Registration
- Login/logout
- Secure authentication
- User profile
- Preferred/locality location
- Report civic issue
- Upload/capture image
- Image crop
- Image zoom
- Image rotation
- Basic image adjustment
- Image compression
- GPS/current location
- Manual location adjustment on map
- AI image classification
- AI relevance validation
- AI-generated complaint description
- AI severity/priority estimation
- Report submission
- My Reports dashboard
- Report details
- Status timeline
- In-app notifications
- CivicFeed
- Nearby issue discovery
- Issue map
- Citizen confirmation after resolution
- Citizen rating/review
- Report history

### Administrative Features

- Secure admin login
- Role-based authorization
- Report list
- Report filtering
- Report search
- Report details
- Image viewing
- AI analysis results
- Duplicate/suspicious report indicators
- Report verification
- Priority review
- Department assignment
- Status updates
- Resolution notes
- Resolution image upload
- Analytics
- Citizen feedback
- Report moderation
- Abuse handling

### Public/Home Features

- Product explanation
- Civic impact statistics
- Issues reported
- Issues resolved
- Resolution rate
- Citizen satisfaction
- Verified citizen reviews
- Call-to-action to report an issue
- 404 page

### Engineering Features

- README.md
- PLAN.md
- Environment configuration
- API documentation
- Validation
- Error handling
- Logging
- Security middleware
- Rate limiting
- Testing
- Image optimization
- Database indexing
- Production deployment configuration

---

# 5. Out of Scope for Initial Core Implementation

These may be considered later:

- Native Android/iOS application
- SMS infrastructure
- WhatsApp notification infrastructure
- Advanced predictive ML models
- Government department API integrations
- Automated government ticket creation
- Fully autonomous issue resolution
- Blockchain
- Microservice architecture
- Kubernetes
- Complex recommendation ML
- Real-time government fleet tracking

The system should be architected so that these can be introduced later if necessary.

---

# 6. Recommended Technology Stack

## Frontend

### React.js + Vite

**Why:**

- Fast development
- Familiar component model
- Excellent ecosystem
- Good performance
- Suitable for SPA architecture
- Easy deployment
- Works well with REST APIs

**Why Vite instead of a heavier framework initially:**

CivicFix does not require server-side rendering for its core functionality. Vite keeps the application lightweight and straightforward.

### JavaScript

Use JavaScript rather than TypeScript for this project.

The team should compensate with:

- Clear interfaces/documentation
- Runtime validation
- Consistent naming
- JSDoc where useful
- ESLint
- Well-defined API contracts

### Tailwind CSS

Use Tailwind for consistent and maintainable styling.

The UI/UX design system will be defined later.

---

# 7. Frontend Supporting Technologies

Recommended:

- React Router
- Axios or Fetch API
- React Hook Form
- Zod or equivalent validation
- Zustand only where global state is actually required
- React Leaflet or another map library
- Recharts for analytics
- A lightweight image editor/cropper library
- Lucide React or another lightweight icon library

Avoid installing libraries simply because they are popular. Every dependency should have a reason.

---

# 8. Backend

## Node.js + Express.js

### Why

- Same language across frontend and backend
- Large ecosystem
- Easy for student/intern teams
- Good for REST APIs
- Simple deployment
- Easy integration with AI and image-processing services

The backend should be organized using a modular layered architecture.

---

# 9. Database

## MongoDB

MongoDB is recommended because:

- Civic reports contain flexible metadata
- AI analysis can evolve over time
- Report structures can contain nested information
- Geospatial queries are supported
- It integrates naturally with Node.js
- It is suitable for the expected project scale

### Important Rule

**Do not store large image files directly inside MongoDB.**

MongoDB stores:

- Image URLs
- Thumbnail URLs
- Metadata
- MIME type
- File size
- Dimensions
- Storage key
- Processing status

Actual images should be stored in object storage.

---

# 10. Image Storage

Use an object-storage service such as:

- Cloudinary
- Amazon S3
- Cloudflare R2
- Supabase Storage
- Another S3-compatible provider

The final provider can be selected based on project budget, free-tier availability, deployment environment, and team familiarity.

### Storage architecture

```text
User
 ↓
Image Processing
 ↓
Object Storage
 ↓
CDN
 ↓
Frontend
```

MongoDB stores references, not large binary image data.

---

# 11. AI Layer

The AI layer should be isolated behind an internal service.

Possible providers/models can include:

- Gemini Vision
- Hugging Face vision models
- Other reliable vision APIs
- Self-hosted/open-source models later

The application should not tightly couple its business logic to one AI provider.

Use an abstraction such as:

```text
AI Service
 ├── classifyIssue()
 ├── validateImage()
 ├── generateDescription()
 ├── estimateSeverity()
 └── detectPotentialDuplicate()
```

If the provider changes later, the rest of the application should not need major changes.

---

# 12. AI Responsibilities

AI can perform the following:

## 12.1 Issue Classification

Example:

```text
Image → Pothole
Confidence → 94%
```

Possible categories:

- ROAD_DAMAGE
- STREETLIGHT
- GARBAGE
- WATER_LEAKAGE
- TRAFFIC_SIGNAL
- PUBLIC_INFRASTRUCTURE
- OTHER_CIVIC
- NON_CIVIC
- UNCERTAIN

---

## 12.2 Relevance Validation

The AI determines whether the uploaded image appears to contain a civic issue.

Example:

```text
User selected: WATER_LEAKAGE
Image: Dog

Result:
Mismatch
```

The user should be asked to upload a relevant image.

---

## 12.3 Complaint Description

AI can convert the visual analysis into a concise complaint.

Example:

> A large pothole appears to be present on the road near the reported location and may create a safety risk for vehicles.

The citizen should be able to edit the generated description.

---

## 12.4 Severity

Example:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

AI should provide an explanation or supporting signals where practical.

---

## 12.5 Priority

Priority should not depend solely on AI.

Combine:

- Issue severity
- Location/context
- Traffic importance where available
- Number of confirmations/reports
- Recency
- Administrative review

Example conceptual score:

```text
Priority Score =
Severity Weight
+ Community Confirmation
+ Recency
+ Location Importance
```

The exact formula should be configurable.

---

# 13. AI Safety Principle

AI is an assistant, not the final authority.

### Correct workflow

```text
User
 ↓
AI analysis
 ↓
Validation
 ↓
Priority suggestion
 ↓
Admin verification
 ↓
Official workflow
```

AI should never directly mark a civic issue as officially resolved.

---

# 14. Image Processing Pipeline

Image handling is a major performance requirement.

## User-side workflow

```text
Capture / Select Image
 ↓
Crop
 ↓
Zoom
 ↓
Rotate
 ↓
Basic Adjustments
 ↓
Preview
 ↓
Client-side Compression
 ↓
Upload
```

## Server-side workflow

```text
Upload
 ↓
File Validation
 ↓
Malware/security checks where applicable
 ↓
Image Processing
 ↓
Resize
 ↓
Convert to WebP/AVIF where supported
 ↓
Generate Thumbnail
 ↓
Store in Object Storage
 ↓
Save Metadata in MongoDB
```

---

# 15. Image Quality Policy

Compression must not make the civic issue unidentifiable.

The goal is:

> Maximum practical compression while preserving enough visual detail to verify the issue.

Do not aggressively reduce resolution.

Recommended approach:

### Thumbnail

Used in lists:

- Small dimensions
- Very small file size
- Fast loading

### Standard image

Used in report details:

- Approximately 1280–1600px maximum dimension
- Good visual quality
- WebP/AVIF where appropriate

### Original

Only retain when there is a legitimate product/security reason.

If retained, apply a documented retention policy.

---

# 16. Image Security

Never trust uploaded files.

Validate:

- MIME type
- Actual file signature
- File size
- Dimensions
- Extension
- Processing result

Reject:

- Unsupported formats
- Extremely large files
- Corrupted images
- Suspicious files

Do not use the original user filename directly as a storage filename.

Generate internal unique storage keys.

---

# 17. Authentication

Recommended authentication architecture:

```text
Registration
 ↓
Password hashing
 ↓
User record
 ↓
Login
 ↓
Secure session/authentication cookie
 ↓
Authenticated requests
```

Passwords must never be stored in plaintext.

Use:

- Argon2id or bcrypt
- Secure HTTP-only cookies
- Secure flag in production
- SameSite protection
- Short-lived authentication where appropriate
- Secure password-reset flow

Do not store sensitive authentication tokens in localStorage unless there is a documented security reason.

---

# 18. Authorization

Use Role-Based Access Control.

Roles:

```text
USER
ADMIN
MODERATOR (optional)
```

Example:

```text
USER
 ├── Create report
 ├── View own reports
 ├── Update permitted own information
 └── Submit feedback

ADMIN
 ├── View reports
 ├── Verify reports
 ├── Assign departments
 ├── Update status
 ├── Resolve reports
 └── View analytics
```

Authorization must always be enforced on the backend.

Never rely only on frontend route protection.

---

# 19. Privacy

Collect only necessary information.

Potential personal data:

- Email
- Name
- Account information
- Preferred locality
- Report history

Do not expose:

- User email to other citizens
- User's home coordinates
- Private profile information
- Authentication credentials

A citizen's location is used internally for personalization.

Other users should see the **civic issue location**, not the reporting user's private home location.

---

# 20. Location Architecture

The application needs two different location concepts.

### User location

Used for:

- CivicFeed personalization
- Nearby issues
- Locality preference

### Issue location

Used for:

- Actual civic problem position
- Map
- Administrative response
- Geospatial searching

These must be stored separately.

---

# 21. Location Submission

When submitting a report:

```text
Current GPS location
        ↓
User sees location
        ↓
User can adjust pin
        ↓
Final issue coordinates
        ↓
Report
```

This is important because the citizen may photograph an issue from a distance.

---

# 22. Geospatial Database Design

MongoDB should use a geospatial index.

Issue locations should use GeoJSON:

```text
{
  type: "Point",
  coordinates: [longitude, latitude]
}
```

Create an appropriate `2dsphere` index.

This enables queries such as:

> Find civic reports within 5 km of this user's selected location.

---

# 23. CivicFeed

The CivicFeed is a location-aware civic issue discovery page.

It is not a machine-learning recommendation system in the first version.

### Initial ranking

Rank issues using:

- Distance
- Priority
- Recency
- Number of confirmations
- Status

Example:

```text
High priority + nearby + recent
        ↓
Medium priority + nearby
        ↓
Older/lower priority issues
```

This provides personalized recommendations without unnecessary ML complexity.

---

# 24. Duplicate Reports

Multiple citizens may report the same pothole.

The system should attempt to identify:

- Similar image
- Similar coordinates
- Same issue category
- Close timestamps

Possible result:

```text
Issue CF-1024

32 citizens reported/confirmed
Same location
Same issue type
```

Instead of creating 32 independent government tasks, the system can group them.

This creates a stronger representation of community demand.

---

# 25. Fake / Abuse Report Handling

The system must anticipate misuse.

Potential controls:

- AI image relevance validation
- Duplicate detection
- Rate limiting
- Report frequency limits
- Suspicious activity flags
- CAPTCHA/challenge after abnormal activity
- Admin moderation
- User report/flag mechanism
- Account restrictions for repeated abuse

Do not automatically ban users solely because AI is uncertain.

Use a review process.

---

# 26. Report Lifecycle

The canonical report lifecycle should be:

```text
DRAFT
 ↓
SUBMITTED
 ↓
AI_ANALYZED
 ↓
VERIFICATION_PENDING
 ↓
VERIFIED
 ↓
ASSIGNED
 ↓
IN_PROGRESS
 ↓
RESOLVED
 ↓
CITIZEN_CONFIRMATION
 ↓
CLOSED
```

Possible alternative states:

```text
REJECTED
DUPLICATE
NEEDS_MORE_INFORMATION
DISPUTED
```

The exact state machine should be centrally defined rather than scattered across components.

---

# 27. Citizen Confirmation

After an administrator marks an issue as resolved:

```text
Resolution Photo
        ↓
Citizen Notification
        ↓
"Was this actually fixed?"
        ↓
YES / STILL EXISTS
        ↓
Rating + Optional Review
```

If the citizen says it is not fixed, the issue can return to:

```text
REOPENED
```

or:

```text
DISPUTED
```

This provides accountability.

---

# 28. Citizen Reviews

After successful resolution:

- Ask whether the issue was actually fixed
- Ask for satisfaction rating
- Allow optional feedback

Example:

```text
Was the issue fixed?
[ Yes ] [ No ]

Rate your experience:
★★★★★
```

Only verified resolution feedback should contribute to the public impact statistics.

---

# 29. Homepage Impact Statistics

The homepage should use database-derived statistics.

Possible metrics:

- Total reports
- Resolved issues
- Active issues
- Resolution rate
- Citizen satisfaction
- Total participating citizens

Example:

```text
1,248 Issues Reported
876 Issues Resolved
70% Resolution Rate
4.7/5 Citizen Rating
```

Do not hardcode these numbers.

The backend should calculate them.

---

# 30. Admin Dashboard

Admin dashboard should provide:

### Overview

- Total reports
- Pending verification
- High-priority issues
- In-progress issues
- Resolved issues
- Reopened issues

### Reports

- Search
- Filter
- Sort
- Pagination
- Category
- Priority
- Location
- Status
- Date

### Map

Color-coded markers:

```text
RED    = Critical/High
YELLOW = Medium
GREEN  = Resolved
```

### Report detail

Show:

- Image
- AI classification
- Confidence
- Description
- Location
- Priority
- User report metadata allowed by privacy policy
- Timeline
- Admin actions
- Resolution evidence
- Citizen feedback

---

# 31. Analytics

Initial analytics:

- Reports by category
- Reports by locality
- Reports over time
- Resolution rate
- Average resolution time
- Priority distribution
- Most affected areas
- Citizen satisfaction

Use aggregation queries rather than loading all reports into the frontend.

---

# 32. API Architecture

Use REST APIs initially.

Example:

```text
/api/auth
/api/users
/api/reports
/api/reports/:id
/api/reports/:id/status
/api/reports/:id/feedback
/api/reports/nearby
/api/ai
/api/notifications
/api/admin/reports
/api/admin/analytics
```

Version the API if appropriate:

```text
/api/v1/...
```

---

# 33. Example Report API Flow

```text
POST /api/v1/reports
        ↓
Authenticate
        ↓
Validate request
        ↓
Validate image
        ↓
Process image
        ↓
Store image
        ↓
AI analysis
        ↓
Calculate priority
        ↓
Save report
        ↓
Return report
```

For long-running AI operations, consider asynchronous processing instead of making the user wait for every operation.

---

# 34. Asynchronous Processing

As traffic increases, AI analysis and image processing can become expensive.

Future-ready architecture:

```text
API
 ↓
Create Report
 ↓
Queue
 ↓
Background Worker
 ├── Image processing
 ├── AI analysis
 ├── Duplicate detection
 └── Notifications
 ↓
Update Report
```

For the MVP, synchronous processing may be acceptable if response times remain reasonable.

Do not introduce a message queue unless actual workload requires it.

---

# 35. Error Handling

Every API should return predictable errors.

Example:

```text
{
  "success": false,
  "message": "Unable to process the uploaded image.",
  "code": "IMAGE_PROCESSING_FAILED"
}
```

Do not expose:

- Stack traces
- Database errors
- Internal file paths
- API keys
- Provider credentials

to users.

---

# 36. Frontend Error Handling

Create:

- Global error boundary
- API error handling
- Loading states
- Empty states
- Retry states
- Network error states
- Authentication expiry handling
- 404 page

---

# 37. 404 Page

A dedicated 404 page is required.

It should provide:

- Clear "Page not found" message
- Return home
- Go to dashboard
- Optional civic-themed illustration

The visual design will be finalized during the UI/UX phase.

---

# 38. Performance Strategy

## Frontend

Use:

- Code splitting
- Lazy-loaded routes
- Optimized images
- Thumbnail images in lists
- Pagination
- Minimal dependencies
- Avoid unnecessary re-renders
- Caching where appropriate
- Skeleton loaders

## Backend

Use:

- Database indexes
- Pagination
- Efficient queries
- Projection/select only required fields
- Caching where appropriate
- Rate limiting
- Compression

## Images

Use:

- Resize
- WebP/AVIF
- Thumbnail generation
- CDN
- Lazy loading

---

# 39. Database Indexing

Indexes should be planned intentionally.

Likely indexes:

### Users

- email unique index

### Reports

- status
- category
- priority
- createdAt
- location `2dsphere`
- reporterId
- possibly compound indexes for common filters

Do not create indexes blindly. Monitor query patterns.

---

# 40. Scalability Strategy

Initial architecture:

```text
React
 ↓
Node/Express
 ↓
MongoDB
 ↓
Object Storage
```

Later:

```text
CDN
 ↓
Load Balancer
 ↓
Multiple API instances
 ↓
Database
 ↓
Object Storage
```

The backend should remain stateless so additional instances can be added later.

---

# 41. Why Not Microservices Initially?

Microservices would add:

- More deployments
- More networking
- More monitoring
- More failure points
- More complexity
- More DevOps work

For a student hackathon and initial production prototype, a modular monolith is more appropriate.

The internal modules should still have clear boundaries so services can be separated later if necessary.

---

# 42. Recommended Backend Structure

```text
server/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── services/
│   │   ├── ai/
│   │   ├── image/
│   │   ├── notification/
│   │   └── report/
│   ├── middleware/
│   ├── validators/
│   ├── utils/
│   ├── jobs/
│   ├── constants/
│   ├── app.js
│   └── server.js
├── tests/
├── .env.example
├── package.json
└── README.md
```

---

# 43. Recommended Frontend Structure

```text
client/
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── features/
│   │   ├── auth/
│   │   ├── reports/
│   │   ├── civicFeed/
│   │   ├── map/
│   │   ├── dashboard/
│   │   └── admin/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── utils/
│   ├── validators/
│   ├── routes/
│   └── main.jsx
├── public/
├── package.json
└── README.md
```

Feature-based organization should be preferred when the application grows.

---

# 44. Coding Standards

Every intern must follow:

- Meaningful variable names
- Small functions
- Single responsibility
- Consistent formatting
- ESLint
- No unused imports
- No commented-out dead code
- No hardcoded secrets
- No duplicated business logic
- Reusable components
- Reusable services
- Proper error handling
- Clear comments only where necessary

Avoid comments that merely repeat what the code says.

---

# 45. Environment Configuration

Never commit secrets.

Use:

```text
.env
.env.example
```

Possible variables:

```text
NODE_ENV=
PORT=
MONGODB_URI=
AUTH_SECRET=
AI_API_KEY=
STORAGE_PROVIDER=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
CLIENT_URL=
```

`.env` must be ignored by Git.

`.env.example` must contain safe placeholder values.

---

# 46. Git Strategy

Use Git from the beginning.

Recommended branches:

```text
main
develop
feature/*
fix/*
```

Examples:

```text
feature/authentication
feature/report-submission
feature/ai-validation
feature/image-processing
feature/admin-dashboard
```

Commit messages should be meaningful:

```text
feat: add report creation API
fix: validate uploaded image MIME type
feat: add nearby civic feed
```

Avoid:

```text
update
final
final2
changes
working
```

---

# 47. Pull Request Rules

Every feature should be reviewed before merging.

PR checklist:

- Feature works
- No secrets committed
- Validation included
- Error handling included
- Tests added where appropriate
- Existing features still work
- Code is readable
- README/API docs updated if required

---

# 48. Testing Strategy

Testing should exist at multiple levels.

## Unit Tests

Test:

- Priority calculation
- Validation
- Utility functions
- Status transitions
- Permission logic

## Integration Tests

Test:

- Authentication
- Report creation
- Report retrieval
- Status updates
- Feedback
- Admin authorization

## Frontend Tests

Test important flows:

- Login
- Report submission
- Image validation
- Dashboard
- Status display

## Manual Testing

Every major release should include:

- Mobile testing
- Desktop testing
- Slow network testing
- Invalid image testing
- Unauthorized access testing
- Duplicate report testing

---

# 49. Security Testing Checklist

Before deployment:

- [ ] Passwords are hashed
- [ ] Authentication is secure
- [ ] Authorization is enforced server-side
- [ ] Admin endpoints are protected
- [ ] Rate limiting exists
- [ ] File uploads are validated
- [ ] File sizes are limited
- [ ] Sensitive errors are hidden
- [ ] Secrets are not committed
- [ ] CORS is configured correctly
- [ ] HTTPS is used in production
- [ ] User data isolation is verified
- [ ] No IDOR vulnerabilities
- [ ] Database credentials are protected
- [ ] Dependency vulnerabilities reviewed

---

# 50. User Data Isolation

A critical requirement.

If User A requests:

```text
GET /api/v1/reports/REPORT_B
```

the backend must determine whether User A has permission to view that report.

Never assume that knowing a report ID grants access.

Use authorization checks such as:

```text
report.ownerId === authenticatedUser.id
```

where applicable.

---

# 51. Admin Security

Admin access must be more restrictive.

Possible controls:

- Separate admin role
- Strong password policy
- Optional 2FA in future
- Admin action logging
- Session expiry
- Rate limiting
- Restricted endpoints

Every important admin action should be auditable.

---

# 52. Notification System

Initial implementation:

### In-app notifications

Examples:

```text
Your report has been verified.
Your issue has been assigned.
Work has started.
Your issue has been resolved.
Please confirm whether the issue was fixed.
```

Future:

- Email
- Push notifications
- SMS
- WhatsApp

These should be separate notification providers behind a notification service.

---

# 53. Report Data Model — Conceptual

A report should contain approximately:

```text
Report
├── id
├── reporterId
├── category
├── title
├── description
├── aiAnalysis
│   ├── category
│   ├── confidence
│   ├── severity
│   └── validationResult
├── priority
├── location
│   ├── GeoJSON
│   └── displayAddress
├── images
│   ├── original/reference
│   ├── standard
│   └── thumbnail
├── status
├── assignedDepartment
├── timeline
├── duplicateGroupId
├── citizenConfirmation
├── feedback
├── createdAt
└── updatedAt
```

The exact schema should be normalized/adjusted based on implementation requirements.

---

# 54. User Data Model — Conceptual

```text
User
├── id
├── name
├── email
├── passwordHash
├── role
├── preferredLocation
├── notificationPreferences
├── createdAt
└── updatedAt
```

Never return `passwordHash` through APIs.

---

# 55. Department Model

Possible departments:

```text
Roads
Waste Management
Water
Electricity
Traffic
Public Works
Other
```

The admin can assign a verified report to the appropriate department.

The exact department structure should remain configurable.

---

# 56. Status Timeline

Every report should maintain a timeline.

Example:

```text
25 Jul
Report submitted

25 Jul
AI analysis completed

26 Jul
Admin verified

27 Jul
Assigned to Roads Department

02 Aug
Work started

08 Aug
Marked resolved

09 Aug
Citizen confirmed resolution
```

This gives citizens transparency.

---

# 57. CivicFeed Query

Conceptually:

```text
User preferred/current location
        ↓
5 km radius
        ↓
Fetch relevant reports
        ↓
Exclude private data
        ↓
Filter according to status/category
        ↓
Rank by priority + distance + recency
        ↓
Return paginated feed
```

The radius should be configurable.

---

# 58. Pagination

Never return thousands of reports in a single API request.

Use pagination:

```text
?page=1&limit=20
```

For very large datasets, cursor-based pagination can be introduced later.

---

# 59. Caching

Caching can be introduced for:

- Homepage statistics
- Public/nearby feed data where appropriate
- Static metadata
- Frequently requested analytics

Do not cache private responses incorrectly.

Cache invalidation rules must be defined.

---

# 60. Logging & Monitoring

Production should log:

- API errors
- Authentication failures
- Important admin actions
- AI failures
- Image-processing failures
- Unexpected server errors

Never log:

- Passwords
- Authentication secrets
- Sensitive tokens
- Private user information unnecessarily

Future monitoring can include:

- Error tracking
- Performance monitoring
- Database metrics
- API latency
- AI latency
- Storage usage

---

# 61. SEO

The public-facing homepage can have basic SEO.

However, the authenticated application itself does not need aggressive SEO.

Focus SEO efforts on:

- Homepage
- Public product pages
- Public civic impact information

Do not expose private reports for SEO purposes.

---

# 62. Accessibility

The core application should follow accessible development practices:

- Semantic HTML
- Keyboard navigation
- Proper labels
- Alt text for meaningful images
- Sufficient contrast
- Visible focus states
- Accessible forms
- Screen-reader-friendly status information

UI/UX details will be finalized later.

---

# 63. Deployment Strategy

Recommended initial deployment model:

```text
Frontend → Vercel / equivalent
Backend → Render / Railway / equivalent
Database → MongoDB Atlas
Images → Cloudinary/S3-compatible storage
```

The exact providers can be selected based on current pricing/free tiers.

Production secrets must be configured in the hosting provider's environment settings.

---

# 64. CI/CD

At minimum:

```text
Git Push
 ↓
Lint
 ↓
Test
 ↓
Build
 ↓
Deploy
```

Future:

- Preview deployments
- Automated security checks
- Database migration strategy if required
- Production approval workflow

---

# 65. README.md Requirements

The repository must maintain a high-quality README.

README should include:

1. Project overview
2. Problem statement
3. Features
4. Architecture
5. Tech stack
6. Project structure
7. Environment variables
8. Installation
9. Development commands
10. API overview
11. Database overview
12. AI integration
13. Image processing
14. Security
15. Deployment
16. Testing
17. Contributors
18. License
19. Future improvements

The README must be updated whenever major architecture changes occur.

---

# 66. Documentation Requirements

Maintain:

```text
README.md
PLAN.md
API documentation
Environment example
Architecture diagrams
Database documentation
```

Future UI/UX documentation:

```text
UI-UX-PLAN.md
```

This document is intentionally not part of the current planning phase.

---

# 67. Development Phases

## Phase 0 — Project Setup

Tasks:

- Create repository
- Configure Git
- Create frontend
- Create backend
- Configure MongoDB
- Configure environment variables
- Configure ESLint/formatting
- Create README
- Create basic folder structure

Deliverable:

> Clean runnable project.

---

## Phase 1 — Authentication

Implement:

- Registration
- Login
- Logout
- Password hashing
- Secure authentication
- User profile
- Role-based authorization

Deliverable:

> Secure user authentication system.

---

## Phase 2 — Report Core

Implement:

- Report schema
- Report creation
- Category selection
- Description
- Location
- Status
- Report retrieval
- My Reports

Deliverable:

> Working civic reporting system without AI.

---

## Phase 3 — Image System

Implement:

- Image selection
- Image editing
- Crop
- Zoom
- Rotate
- Compression
- Validation
- Object storage
- Thumbnail generation

Deliverable:

> Optimized and secure image pipeline.

---

## Phase 4 — AI Integration

Implement:

- Image classification
- Civic relevance validation
- Confidence score
- Description generation
- Severity suggestion
- Priority suggestion

Deliverable:

> AI-assisted report validation.

---

## Phase 5 — Admin System

Implement:

- Admin authentication
- Report list
- Search
- Filtering
- Verification
- Assignment
- Status updates
- Resolution evidence

Deliverable:

> Complete administrative workflow.

---

## Phase 6 — User Tracking

Implement:

- Report timeline
- Notifications
- Resolution updates
- Citizen confirmation
- Reopen flow
- Reviews

Deliverable:

> Complete citizen accountability loop.

---

## Phase 7 — Geospatial CivicFeed

Implement:

- Preferred location
- GeoJSON
- Geospatial index
- Nearby report query
- CivicFeed
- Ranking
- Map

Deliverable:

> Localized civic awareness system.

---

## Phase 8 — Analytics & Impact

Implement:

- Report statistics
- Resolution rate
- Citizen satisfaction
- Category statistics
- Locality statistics
- Homepage impact counters
- Verified reviews

Deliverable:

> Data-driven civic impact dashboard.

---

## Phase 9 — Security Hardening

Perform:

- Authorization testing
- File upload testing
- Rate-limit testing
- Input validation
- IDOR testing
- Dependency review
- CORS review
- Secret review
- Error response review

Deliverable:

> Security-reviewed release candidate.

---

## Phase 10 — Performance & Reliability

Optimize:

- Frontend bundle
- API response time
- Database queries
- Indexes
- Image delivery
- Lazy loading
- Pagination
- Caching where necessary

Deliverable:

> Fast and reliable release candidate.

---

## Phase 11 — Final QA & Deployment

Test:

- Desktop
- Mobile
- Different browsers
- Slow network
- Invalid inputs
- Fake reports
- Duplicate reports
- Unauthorized access
- AI failures
- Storage failures
- Database failures

Then deploy.

---

# 68. Intern Team Allocation

Suggested responsibilities:

### Intern 1 — Frontend

- React
- Routing
- Authentication UI
- Report UI
- Dashboard
- CivicFeed

### Intern 2 — Backend

- Express
- Authentication
- APIs
- Database
- Authorization
- Report lifecycle

### Intern 3 — AI & Image Processing

- AI integration
- Image validation
- Compression
- Image processing
- Duplicate detection

### Intern 4 — Admin & Analytics

- Admin dashboard
- Moderation
- Analytics
- Status management
- Citizen feedback

### Team Lead / Senior Review

- Architecture
- Security
- Code review
- Integration
- Deployment
- QA

Responsibilities can overlap depending on team size.

---

# 69. Definition of Done

A feature is not complete merely because "it works on my machine."

A feature is complete when:

- It works
- It is validated
- It handles errors
- It respects authorization
- It does not expose private information
- It is reasonably tested
- It follows project structure
- It has no unnecessary duplication
- It is documented where necessary
- It works on mobile where applicable
- It does not break existing functionality

---

# 70. MVP Priority Matrix

## P0 — Must Have

- Authentication
- Secure user accounts
- Report submission
- Image editing
- Image compression
- GPS/location
- AI classification
- AI validation
- MongoDB
- Admin dashboard
- Report status
- User dashboard
- Resolution tracking
- Citizen confirmation
- Security
- 404 page
- README

## P1 — Important

- CivicFeed
- Geospatial search
- Map
- Duplicate detection
- Notifications
- Analytics
- Citizen ratings
- Resolution photos

## P2 — Future

- Advanced ML recommendations
- SMS
- WhatsApp
- Push notifications
- Government API integrations
- Queue/worker infrastructure
- Advanced fraud detection
- Multi-language support
- Native mobile apps

---

# 71. Final System Flow

The complete CivicFix system should work approximately like this:

```text
                    CITIZEN
                       │
                       ▼
                Create Account
                       │
                       ▼
              Set Preferred Area
                       │
                       ▼
                CivicFix Home
                  /          \
                 /            \
                ▼              ▼
          CivicFeed       Report Issue
                              │
                              ▼
                         Take/Upload
                            Image
                              │
                              ▼
                      Crop / Zoom / Edit
                              │
                              ▼
                         GPS Location
                              │
                       Adjust Map Pin
                              │
                              ▼
                       Image Compression
                              │
                              ▼
                        AI Validation
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
             Civic         Uncertain      Invalid
             Issue           Issue          Issue
                │             │             │
                ▼             ▼             ▼
             Submit        Review       Re-upload
                │
                ▼
          Store Report
                │
                ▼
        Admin Verification
                │
        ┌───────┼─────────┐
        ▼       ▼         ▼
     Verify   Duplicate  Reject
        │
        ▼
      Assign
        │
        ▼
    In Progress
        │
        ▼
     Resolved
        │
        ▼
 Resolution Evidence
        │
        ▼
   Citizen Notified
        │
        ▼
 Citizen Confirmation
      /       \
    YES        NO
     │          │
     ▼          ▼
  Feedback    Reopen
     │
     ▼
Impact Statistics
     │
     ▼
Homepage / Analytics
```

---

# 72. Final Engineering Direction

CivicFix should **not** be built as a collection of disconnected pages.

It should be treated as a complete system with five major domains:

```text
1. Identity & Security
2. Civic Reporting
3. AI & Media Processing
4. Administration & Resolution
5. Civic Intelligence & Community
```

Each domain should have clear responsibilities.

The first goal is:

> **Build a correct, secure, maintainable core system.**

The second goal is:

> **Make it scalable and performant.**

The third goal is:

> **Make it beautiful and engaging.**

Therefore, UI/UX design is intentionally postponed.

Once the architecture and core workflows are stable, create a separate:

```text
UI-UX-PLAN.md
```

covering:

- Design system
- Color palette
- Typography
- Navigation
- Page layouts
- Mobile layouts
- Components
- Animations
- Accessibility
- Empty states
- Loading states
- Error states
- Admin interface
- CivicFeed interface

---

# 73. Success Criteria

CivicFix will be considered successful when a citizen can:

1. Create an account securely.
2. Select a preferred locality.
3. Capture/upload a civic issue.
4. Edit the image.
5. Have the image compressed without losing useful visual information.
6. Provide accurate issue coordinates.
7. Receive AI-assisted classification and validation.
8. Submit the report.
9. Track the report.
10. Receive status updates.
11. See the issue being resolved.
12. Confirm whether it was actually fixed.
13. Leave feedback.
14. See local civic issues through CivicFeed.
15. Use the platform without exposing private account information.

Administrators must be able to:

1. Securely access the admin system.
2. Review reports.
3. Identify suspicious/duplicate reports.
4. Verify legitimate issues.
5. Assign issues.
6. Update status.
7. Provide resolution evidence.
8. Review citizen feedback.
9. Analyze civic trends.

The system must remain:

**Secure + Private + Maintainable + Fast + Scalable + AI-assisted + Citizen-focused.**

---

# 74. Immediate Next Steps

The team should execute in this order:

```text
1. Freeze core requirements
2. Create repository
3. Create README.md
4. Create frontend/backend structure
5. Configure environment
6. Configure MongoDB
7. Implement authentication
8. Implement report model/API
9. Implement image pipeline
10. Implement AI service abstraction
11. Implement report workflow
12. Implement admin system
13. Implement citizen tracking
14. Implement CivicFeed/geospatial search
15. Implement analytics
16. Harden security
17. Optimize performance
18. Test
19. Deploy
20. Create UI/UX plan
21. Apply final UI/UX implementation
```

**Do not begin by designing animations, gradients, or visual effects.**

First make the machine work.

Then make the machine beautiful.
